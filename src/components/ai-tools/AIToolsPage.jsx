import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
import { useAuth } from '../../context/AuthContext';
import { BackgroundGradientAnimation } from '../ui/background-gradient-animation';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import SEO from '../common/SEO';
import useRateLimit from '../../hooks/useRateLimit';
import RateLimitIndicator from '../common/RateLimitIndicator';
import './AIToolsPage.css';

function AIToolsPage() {
    const [tool, setTool] = useState(null);
    const [text, setText] = useState('');
    const [pdfFile, setPdfFile] = useState(null);
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [quizData, setQuizData] = useState(null);
    const [showAnswers, setShowAnswers] = useState(false);
    const [userAnswers, setUserAnswers] = useState({});
    const [score, setScore] = useState(null);
    const [flippedCards, setFlippedCards] = useState({});

    const [processingProgress, setProcessingProgress] = useState(0);
    const workerRef = React.useRef(null);

    const { currentUser } = useAuth();

    // Rate limiting hook
    const rateLimit = useRateLimit(currentUser, false);

    // Limpieza del worker al desmontar
    useEffect(() => {
        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
            }
        };
    }, []);

    const handleSelectTool = (selectedTool) => {
        setTool(selectedTool);
        setText('');
        setResult('');
        setQuizData(null);
        setShowAnswers(false);
        setUserAnswers({});
        setScore(null);
        setFlippedCards({});
    };

    const clearFile = () => {
        setPdfFile(null);
        document.getElementById('pdf-upload').value = null;
        setText('');
        setResult('');
        setQuizData(null);
        setShowAnswers(false);
        setUserAnswers({});
        setScore(null);
        setFlippedCards({});
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            setText('');
            setResult('');
            setQuizData(null);
            setShowAnswers(false);
            setUserAnswers({});
            setScore(null);
            setFlippedCards({});
        } else {
            setPdfFile(null);
            e.target.value = null;
            setResult('Por favor, sube un archivo PDF válido.');
        }
    };

    const handleCancelProcessing = () => {
        if (workerRef.current) {
            workerRef.current.terminate();
            workerRef.current = null;
        }
        setProcessingProgress(0);
        setPdfFile(null);
        document.getElementById('pdf-upload').value = null;
        setResult('Procesamiento cancelado por el usuario.');
    };

    const extractTextFromPdf = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const arrayBuffer = event.target.result;
                    setProcessingProgress(10);

                    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });

                    loadingTask.onProgress = (progressData) => {
                        if (progressData.total > 0) {
                            const percent = Math.round((progressData.loaded / progressData.total) * 50);
                            setProcessingProgress(percent);
                        }
                    };

                    const pdf = await loadingTask.promise;
                    const totalPages = pdf.numPages;
                    let fullText = '';

                    for (let i = 1; i <= totalPages; i++) {
                        setProcessingProgress(50 + Math.round((i / totalPages) * 50));
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map(item => item.str).join(' ');
                        fullText += pageText + '\n';
                    }

                    setProcessingProgress(0);
                    resolve(fullText);
                } catch (error) {
                    setProcessingProgress(0);
                    reject('Error al procesar PDF: ' + error.message);
                }
            };
            reader.onerror = () => reject('Error al leer archivo');
            reader.readAsArrayBuffer(file);
        });
    };

    const copyToClipboard = async (textToCopy) => {
        try {
            await navigator.clipboard.writeText(textToCopy);
            alert('¡Texto copiado al portapapeles!');
        } catch (err) {
            console.error('Error al copiar:', err);
            alert('No se pudo copiar el texto. Intenta seleccionarlo y copiarlo manualmente.');
        }
    };

    const downloadText = (textToDownload, filename) => {
        const element = document.createElement('a');
        const file = new Blob([textToDownload], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    // Función para manejar la selección de respuesta
    const handleAnswerSelect = (questionIndex, selectedOption) => {
        if (!showAnswers) {
            setUserAnswers(prev => ({
                ...prev,
                [questionIndex]: selectedOption
            }));
        }
    };

    // Función para calcular el puntaje
    const calculateScore = () => {
        if (!quizData) return 0;

        let correctCount = 0;
        quizData.forEach((question, index) => {
            if (userAnswers[index] === question.correctAnswer) {
                correctCount++;
            }
        });

        return {
            correct: correctCount,
            total: quizData.length,
            percentage: Math.round((correctCount / quizData.length) * 100)
        };
    };

    // Función para reiniciar el cuestionario
    const resetQuiz = () => {
        setUserAnswers({});
        setScore(null);
        setShowAnswers(false);
    };

    // Función para manejar el flip de tarjetas
    const handleCardFlip = (index) => {
        setFlippedCards(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const handleGenerate = async () => {
        let inputText = text.trim();
        if (!inputText && !pdfFile) {
            setResult('Por favor, introduce texto o sube un archivo PDF.');
            return;
        }

        const rateLimitCheck = await rateLimit.checkLimit();
        if (!rateLimitCheck.allowed) {
            setResult(`⏱️ ${rateLimitCheck.error}`);
            return;
        }

        setIsLoading(true);
        setResult('');
        setQuizData(null);
        setShowAnswers(false);
        setUserAnswers({});
        setScore(null);
        setFlippedCards({});

        try {
            let content = inputText;
            if (pdfFile) {
                try {
                    content = await extractTextFromPdf(pdfFile);
                    console.log('Texto extraído del PDF (primeros 200 chars):', content.substring(0, 200) + '...');
                    if (!content || content.trim().length === 0) {
                        setResult('El archivo PDF no contiene texto extraíble.');
                        return;
                    }
                } catch (error) {
                    setResult(error);
                    return;
                }
            }

            let systemInstruction = "";

            if (tool === 'resumen') {
                systemInstruction = `Eres un asistente de estudio especializado en español. Resume el texto con este formato Markdown exacto:

# 📋 Resumen: [título del tema]

Breve contexto del tema en 1-2 frases.

## 🎯 Ideas principales

- Primera idea clave
- Segunda idea clave
- Tercera idea clave

## 📖 Desarrollo

### [Primer subtema]
Explicación en 2-3 frases.

### [Segundo subtema]
Explicación en 2-3 frases.

## ✅ Conclusión

Una frase que resuma lo más importante.

Adapta el número de subtemas y bullets al contenido. Escribe en español claro y directo para estudiantes de 12-16 años.`;
            } else if (tool === 'cuestionario') {
                systemInstruction = "Eres un profesor de ESO que enseña en español. Genera un cuestionario de 5 preguntas de opción múltiple en español. Cada pregunta debe tener 4 opciones, solo una correcta. Mezcla el orden de las opciones. Devuelve SOLO un objeto JSON válido con una propiedad `quiz` que es un array de objetos. Cada objeto debe tener: `question` (string), `options` (array de 4 strings), `correctAnswer` (string exacto de la opción correcta). No incluyas texto adicional, solo el JSON.";
            } else if (tool === 'explicar') {
                systemInstruction = "Eres un profesor de ESO que explica conceptos en español de forma clara, sencilla y amigable. Usa ejemplos cotidianos, analogías o pasos si es necesario. La explicación debe ser fácil de entender para un estudiante de 12-14 años. No uses jerga técnica sin explicarla.";
            } else if (tool === 'tarjetas') {
                systemInstruction = "Eres un profesor de ESO que crea tarjetas didácticas en español. Genera 5 tarjetas. Devuelve SOLO un objeto JSON válido con una propiedad `cards` que es un array de objetos. Cada objeto debe tener: `question` (string) y `answer` (string). No incluyas texto adicional, solo el JSON.";
            }

            const payload = {
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: `${systemInstruction}\n\n${content}` }
                        ]
                    }
                ]
            };

            const idToken = await currentUser.getIdToken();
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 429) {
                    throw new Error(errorData.error || 'Límite de uso alcanzado. Espera un momento.');
                }
                console.error('❌ Error de API:', errorData);
                throw new Error(errorData.error?.message || 'Error en la API');
            }

            const data = await response.json();
            const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!generatedText) {
                setResult("No se pudo generar el resultado.");
                return;
            }

            if (tool === 'cuestionario' || tool === 'tarjetas') {
                let parsedData = null;
                try {
                    parsedData = JSON.parse(generatedText);
                } catch (parseError) {
                    console.log('Intentando extraer JSON de la respuesta...');
                    try {
                        const start = generatedText.indexOf('{');
                        const end = generatedText.lastIndexOf('}');
                        if (start !== -1 && end !== -1 && end > start) {
                            const jsonStr = generatedText.substring(start, end + 1);
                            parsedData = JSON.parse(jsonStr);
                            console.log('✅ JSON extraído con éxito:', parsedData);
                        } else {
                            throw new Error('No se pudo encontrar un objeto JSON en la respuesta.');
                        }
                    } catch (extractError) {
                        console.error('Error extrayendo JSON:', extractError);
                        setResult('Error: La API no devolvió un JSON válido. Intenta de nuevo.');
                        return;
                    }
                }

                if (tool === 'cuestionario') {
                    if (parsedData.quiz && Array.isArray(parsedData.quiz)) {
                        setQuizData(parsedData.quiz);
                    } else {
                        setResult('Error: La API no devolvió un formato de cuestionario válido.');
                    }
                } else if (tool === 'tarjetas') {
                    if (parsedData.cards && Array.isArray(parsedData.cards)) {
                        setQuizData(parsedData.cards);
                    } else {
                        setResult('Error: La API no devolvió un formato de tarjetas válido.');
                    }
                }
            } else {
                setResult(generatedText);
            }

            await rateLimit.incrementCount();

            if (currentUser && (tool === 'cuestionario' || tool === 'tarjetas' || tool === 'resumen' || tool === 'explicar')) {
                try {
                    const promptText = pdfFile ? "📄 PDF cargado" : text.trim();
                    const title = tool === 'resumen' ? "Resumen generado" :
                        tool === 'cuestionario' ? "Cuestionario generado" :
                            tool === 'tarjetas' ? "Tarjetas generadas" :
                                `Explicación: ${text.split(' ').slice(0, 5).join(' ')}...`;

                    const responseToSave = (tool === 'cuestionario' || tool === 'tarjetas')
                        ? JSON.stringify(quizData || generatedText)
                        : generatedText;

                    await addDoc(collection(db, 'users', currentUser.uid, 'ai_history'), {
                        prompt: promptText,
                        response: responseToSave,
                        tool: tool,
                        timestamp: serverTimestamp(),
                        title: title
                    });

                    console.log('✅ Guardado en historial correctamente');
                } catch (saveError) {
                    console.error('❌ Error al guardar en historial:', saveError);
                }
            }
        } catch (error) {
            console.error('Error al generar contenido:', error);
            setResult('Hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <SEO
                title="Herramientas de IA - SmartStudy"
                description="Resume textos, genera cuestionarios o explica conceptos con nuestra IA. Ideal para estudiantes de ESO."
                image="https://res.cloudinary.com/ds7shn66t/image/upload/v1759232770/Banner_Producto_del_Dia_Promocion_Cafe_Azul_vi0xs4.jpg"
                url="https://smartstudy.vercel.app/herramientas-ia"
            />

            <section className="ai-tools relative overflow-hidden">
                <BackgroundGradientAnimation containerClassName="absolute inset-0 z-0 h-full w-full" interactive={false} />
                <div className="container relative z-10">
                    <h2 className="section-title">Herramientas de Inteligencia Artificial</h2>
                    <p className="subtitle">Potencia tus estudios con IA: resume textos, genera cuestionarios, tarjetas o explica conceptos.</p>

                    {currentUser && (
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <Link to="/historial-ia" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                                📚 Ver mi historial de IA
                            </Link>
                        </div>
                    )}

                    {currentUser && !rateLimit.isLoading && (
                        <RateLimitIndicator
                            remainingCallsMinute={rateLimit.remainingCallsMinute}
                            remainingCallsHour={rateLimit.remainingCallsHour}
                            limits={rateLimit.limits}
                            nextResetMinute={rateLimit.nextResetMinute}
                            nextResetHour={rateLimit.nextResetHour}
                            isPremium={rateLimit.isPremium}
                        />
                    )}

                    <div className="tool-selection">
                        <button
                            className={`tool-card ${tool === 'resumen' ? 'active' : ''}`}
                            onClick={() => handleSelectTool('resumen')}
                        >
                            <h3><i className="fas fa-file-alt"></i> Crea un Resumen</h3>
                            <p>Convierte textos largos en resúmenes claros y estructurados.</p>
                        </button>
                        <button
                            className={`tool-card ${tool === 'cuestionario' ? 'active' : ''}`}
                            onClick={() => handleSelectTool('cuestionario')}
                        >
                            <h3><i className="fas fa-question-circle"></i> Genera un Cuestionario</h3>
                            <p>Crea preguntas de estudio con 4 opciones cada una.</p>
                        </button>
                        <button
                            className={`tool-card ${tool === 'tarjetas' ? 'active' : ''}`}
                            onClick={() => handleSelectTool('tarjetas')}
                        >
                            <h3><i className="fas fa-clipboard-list"></i> Genera Tarjetas Didácticas</h3>
                            <p>Crea tarjetas interactivas para memorizar conceptos.</p>
                        </button>
                        <button
                            className={`tool-card ${tool === 'explicar' ? 'active' : ''}`}
                            onClick={() => handleSelectTool('explicar')}
                        >
                            <h3><i className="fas fa-lightbulb"></i> Explica un Concepto</h3>
                            <p>Pregunta cualquier duda y recibe una explicación sencilla.</p>
                        </button>
                    </div>

                    {tool && (
                        <div className="tool-interface">
                            <div className="file-preview">
                                {pdfFile && (
                                    <div className="file-info">
                                        <i className="fas fa-file-pdf"></i>
                                        <span>{pdfFile.name}</span>
                                        <button
                                            className="remove-file"
                                            onClick={clearFile}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="file-input-container">
                                {processingProgress > 0 ? (
                                    <div className="pdf-progress-container">
                                        <div className="pdf-progress-bar">
                                            <div
                                                className="pdf-progress-fill"
                                                style={{ width: `${processingProgress}%` }}
                                            ></div>
                                        </div>
                                        <div className="pdf-progress-info">
                                            <span>Procesando PDF... {processingProgress}%</span>
                                            <button
                                                className="btn-text-danger"
                                                onClick={handleCancelProcessing}
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <label htmlFor="pdf-upload" className="file-label">
                                            {pdfFile ? 'Cambiar archivo PDF' : 'Sube un archivo PDF'}
                                        </label>
                                        <input
                                            id="pdf-upload"
                                            type="file"
                                            accept="application/pdf"
                                            onChange={handleFileChange}
                                            className="hidden-input"
                                        />
                                    </>
                                )}
                            </div>
                            <p className="or-text">o escribe tu pregunta/concepto:</p>
                            <textarea
                                className="tool-textarea"
                                rows="8"
                                placeholder="Ej: ¿Qué es la fotosíntesis? o Explica el teorema de Pitágoras..."
                                value={text}
                                onChange={(e) => {
                                    setText(e.target.value);
                                    if (pdfFile) {
                                        clearFile();
                                    }
                                }}
                                disabled={!!pdfFile}
                            ></textarea>
                            <button
                                type="button"
                                className="btn btn-primary generate-btn"
                                onClick={handleGenerate}
                                disabled={isLoading || (!text.trim() && !pdfFile)}
                            >
                                {isLoading ? (
                                    <span className="loading-text">
                                        <span className="spinner"></span>
                                        Generando con IA...
                                    </span>
                                ) : 'Generar Contenido'}
                            </button>
                        </div>
                    )}

                    {isLoading && (
                        <div className="generating-message">
                            <div className="spinner-large"></div>
                            <p>Estamos procesando tu contenido con IA. Esto puede tardar unos segundos...</p>
                            <p className="tip">💡 Consejo: Mientras esperas, puedes preparar tu siguiente pregunta.</p>
                        </div>
                    )}

                    {quizData && tool === 'cuestionario' && (
                        <div className="result-container quiz-result">
                            <div className="result-header">
                                <h3><i className="fas fa-graduation-cap"></i> Tu Cuestionario de Estudio</h3>
                                <div className="result-actions">
                                    <button
                                        className="btn btn-outline copy-btn"
                                        onClick={() => {
                                            const quizText = quizData.map((q, i) =>
                                                `${i + 1}. ${q.question}\n${q.options.map((opt, j) => `   ${String.fromCharCode(65 + j)}. ${opt}`).join('\n')}\n`
                                            ).join('\n');
                                            copyToClipboard(quizText);
                                        }}
                                    >
                                        <i className="fas fa-copy"></i> Copiar
                                    </button>
                                    <button
                                        className="btn btn-outline download-btn"
                                        onClick={() => {
                                            const quizText = quizData.map((q, i) =>
                                                `${i + 1}. ${q.question}\n${q.options.map((opt, j) => `   ${String.fromCharCode(65 + j)}. ${opt}`).join('\n')}\n`
                                            ).join('\n');
                                            downloadText(quizText, 'cuestionario.txt');
                                        }}
                                    >
                                        <i className="fas fa-download"></i> Descargar
                                    </button>
                                </div>
                            </div>

                            {score && (
                                <div className="quiz-score-display">
                                    <h4>Tu Resultado: {score.correct}/{score.total} ({score.percentage}%)</h4>
                                    <div className="score-bar">
                                        <div
                                            className="score-progress"
                                            style={{ width: `${score.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {quizData.map((q, index) => {
                                const userAnswer = userAnswers[index];
                                const isCorrect = userAnswer === q.correctAnswer;

                                return (
                                    <div key={index} className="quiz-question">
                                        <h4>{index + 1}. {q.question}</h4>
                                        <ul className="options-list">
                                            {q.options.map((option, optIndex) => {
                                                const isSelected = userAnswer === option;
                                                const isActuallyCorrect = option === q.correctAnswer;
                                                const letter = String.fromCharCode(65 + optIndex);

                                                let optionClass = 'option-item';

                                                if (showAnswers) {
                                                    if (isActuallyCorrect) {
                                                        optionClass += ' correct';
                                                    } else if (isSelected && !isActuallyCorrect) {
                                                        optionClass += ' incorrect';
                                                    }
                                                } else if (isSelected) {
                                                    optionClass += ' selected';
                                                }

                                                return (
                                                    <li
                                                        key={optIndex}
                                                        className={optionClass}
                                                        onClick={() => handleAnswerSelect(index, option)}
                                                    >
                                                        <span className="option-letter">{letter}.</span>
                                                        {option}
                                                        {showAnswers && isSelected && (
                                                            <span className="answer-feedback">
                                                                {isCorrect ? ' ✓ Correcta' : ' ✗ Incorrecta'}
                                                            </span>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ul>

                                        {showAnswers && userAnswer && (
                                            <div className="question-feedback">
                                                <p>
                                                    <strong>Tu respuesta:</strong> {userAnswer}
                                                    {isCorrect ? (
                                                        <span className="feedback-correct"> ✓ Correcto</span>
                                                    ) : (
                                                        <span className="feedback-incorrect"> ✗ Incorrecto</span>
                                                    )}
                                                </p>
                                                {!isCorrect && (
                                                    <p className="correct-answer-text">
                                                        <strong>Respuesta correcta:</strong> {q.correctAnswer}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            <div className="quiz-actions">
                                <button
                                    className="btn btn-outline reset-btn"
                                    onClick={resetQuiz}
                                >
                                    <i className="fas fa-redo"></i> Reiniciar Cuestionario
                                </button>

                                <button
                                    className="btn btn-secondary toggle-answers"
                                    onClick={() => {
                                        if (showAnswers) {
                                            resetQuiz();
                                        } else {
                                            setShowAnswers(true);
                                            setScore(calculateScore());
                                        }
                                    }}
                                >
                                    {showAnswers ? (
                                        <>
                                            <i className="fas fa-redo"></i> Reiniciar Cuestionario
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-check-circle"></i> Mostrar Respuestas y Calificar
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {quizData && tool === 'tarjetas' && (
                        <div className="result-container">
                            <div className="result-header">
                                <h3><i className="fas fa-clipboard-list"></i> Tus Tarjetas Didácticas</h3>
                                <div className="result-actions">
                                    <button
                                        className="btn btn-outline copy-btn"
                                        onClick={() => {
                                            const cardsText = quizData.map((card, i) =>
                                                `Tarjeta ${i + 1}\nPregunta: ${card.question}\nRespuesta: ${card.answer}\n\n`
                                            ).join('');
                                            copyToClipboard(cardsText);
                                        }}
                                    >
                                        <i className="fas fa-copy"></i> Copiar
                                    </button>
                                    <button
                                        className="btn btn-outline download-btn"
                                        onClick={() => {
                                            const cardsText = quizData.map((card, i) =>
                                                `Tarjeta ${i + 1}\nPregunta: ${card.question}\nRespuesta: ${card.answer}\n\n`
                                            ).join('');
                                            downloadText(cardsText, 'tarjetas.txt');
                                        }}
                                    >
                                        <i className="fas fa-download"></i> Descargar
                                    </button>
                                </div>
                            </div>
                            <div className="flashcards-container">
                                <div className="flashcards-grid">
                                    {quizData.map((card, index) => (
                                        <div key={index} className="flashcard-item">
                                            <div
                                                className={`flashcard ${flippedCards[index] ? 'flipped' : ''}`}
                                                onClick={() => handleCardFlip(index)}
                                            >
                                                <div className="flashcard-front">
                                                    <div className="flashcard-header">
                                                        <span className="flashcard-number">Tarjeta {index + 1}</span>
                                                        <span className="flashcard-indicator">👆 Haz clic para ver la respuesta</span>
                                                    </div>
                                                    <div className="flashcard-content">
                                                        <h4>Pregunta:</h4>
                                                        <p>{card.question}</p>
                                                    </div>
                                                </div>
                                                <div className="flashcard-back">
                                                    <div className="flashcard-header">
                                                        <span className="flashcard-number">Tarjeta {index + 1}</span>
                                                        <span className="flashcard-indicator">👆 Haz clic para ver la pregunta</span>
                                                    </div>
                                                    <div className="flashcard-content">
                                                        <h4>Respuesta:</h4>
                                                        <p>{card.answer}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flashcards-instruction">
                                    <p>💡 <strong>Instrucción:</strong> Haz clic en cualquier tarjeta para girarla y ver la respuesta.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {result && tool === 'resumen' && (
                        <div className="result-container">
                            <div className="result-header">
                                <h3><i className="fas fa-file-alt"></i> Resumen Generado</h3>
                                <div className="result-actions">
                                    <button
                                        className="btn btn-outline copy-btn"
                                        onClick={() => copyToClipboard(result)}
                                    >
                                        <i className="fas fa-copy"></i> Copiar
                                    </button>
                                    <button
                                        className="btn btn-outline download-btn"
                                        onClick={() => downloadText(result, 'resumen.txt')}
                                    >
                                        <i className="fas fa-download"></i> Descargar
                                    </button>
                                </div>
                            </div>
                            <div className="summary-content markdown-body">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {result}
                                </ReactMarkdown>
                            </div>
                            <div className="summary-footer">
                                <div className="summary-stats">
                                    <span className="stat-item">
                                        <i className="fas fa-text-height"></i>
                                        {result.split(' ').length} palabras
                                    </span>
                                    <span className="stat-item">
                                        <i className="fas fa-paragraph"></i>
                                        {result.split('\n').filter(line => line.trim().length > 0).length} párrafos
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {result && tool === 'explicar' && (
                        <div className="result-container">
                            <div className="result-header">
                                <h3><i className="fas fa-lightbulb"></i> Explicación</h3>
                                <div className="result-actions">
                                    <button
                                        className="btn btn-outline copy-btn"
                                        onClick={() => copyToClipboard(result)}
                                    >
                                        <i className="fas fa-copy"></i> Copiar
                                    </button>
                                    <button
                                        className="btn btn-outline download-btn"
                                        onClick={() => downloadText(result, 'explicacion.txt')}
                                    >
                                        <i className="fas fa-download"></i> Descargar
                                    </button>
                                </div>
                            </div>
                            <div className="explanation-content">
                                {result.split('\n').map((line, index) => {
                                    if (line.trim() === '') return <br key={index} />;

                                    if (line.startsWith('### ')) {
                                        return <h4 key={index} className="explanation-subtitle">{line.replace('### ', '')}</h4>;
                                    } else if (line.startsWith('## ')) {
                                        return <h3 key={index} className="explanation-subtitle">{line.replace('## ', '')}</h3>;
                                    } else if (line.startsWith('# ')) {
                                        return <h2 key={index} className="explanation-title">{line.replace('# ', '')}</h2>;
                                    } else if (line.startsWith('**') && line.endsWith('**')) {
                                        return <p key={index} className="explanation-bold">{line.replace(/\*\*/g, '')}</p>;
                                    } else if (line.match(/^\d+\.\s/)) {
                                        return <p key={index} className="explanation-numbered-item">{line}</p>;
                                    } else if (line.startsWith('- ') || line.startsWith('* ')) {
                                        return <p key={index} className="explanation-bullet-item">{line}</p>;
                                    } else if (line.includes('**')) {
                                        const parts = line.split('**');
                                        return (
                                            <p key={index} className="explanation-text">
                                                {parts.map((part, i) =>
                                                    i % 2 === 1 ?
                                                        <strong key={i}>{part}</strong> :
                                                        part
                                                )}
                                            </p>
                                        );
                                    } else {
                                        return <p key={index} className="explanation-text">{line}</p>;
                                    }
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

export default AIToolsPage;