// src/components/ai-tools/AIToolsPage.js
import React, { useState, useEffect } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { useAuth } from '../../AuthContext'; // ✅ Para obtener el UID del usuario
import { db } from '../../firebase'; // ✅ Para guardar en Firestore
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // ✅ Funciones de Firestore
import { Link } from 'react-router-dom'; // ✅ Para enlazar al historial
import './AIToolsPage.css';

const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

function AIToolsPage() {
    const [tool, setTool] = useState(null);
    const [text, setText] = useState('');
    const [pdfFile, setPdfFile] = useState(null);
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [quizData, setQuizData] = useState(null);
    const [showAnswers, setShowAnswers] = useState(false);

    // ✅ Obtener usuario actual
    const { currentUser } = useAuth();

    useEffect(() => {
        GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }, []);

    // ✅ Función para seleccionar herramienta (sin limpiar el PDF)
    const handleSelectTool = (selectedTool) => {
        setTool(selectedTool);
        setText(''); // Solo limpiamos el texto manual
        setResult('');
        setQuizData(null);
        setShowAnswers(false);
        // ✅ NO limpiamos pdfFile aquí → se mantiene entre herramientas
    };

    // ✅ Función para limpiar el archivo PDF manualmente
    const clearFile = () => {
        setPdfFile(null);
        document.getElementById('pdf-upload').value = null;
        setText('');
        setResult('');
        setQuizData(null);
        setShowAnswers(false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            setText('');
            setResult('');
            setQuizData(null);
            setShowAnswers(false);
        } else {
            setPdfFile(null);
            e.target.value = null;
            setResult('Por favor, sube un archivo PDF válido.');
        }
    };

    const extractTextFromPdf = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const arrayBuffer = event.target.result;
                    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
                        reject('Error: El archivo PDF está vacío o corrupto.');
                        return;
                    }
                    const pdf = await getDocument({ data: arrayBuffer }).promise;
                    let fullText = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map(item => item.str).join(' ');
                        fullText += pageText + '\n';
                    }
                    if (!fullText.trim()) {
                        reject('Error: El PDF no contiene texto extraíble.');
                        return;
                    }
                    resolve(fullText);
                } catch (error) {
                    console.error('Error detallado al procesar PDF:', error);
                    reject('Error al procesar el archivo PDF: ' + (error.message || 'Error desconocido'));
                }
            };
            reader.onerror = () => {
                reject('Error al leer el archivo: ' + reader.error);
            };
            reader.readAsArrayBuffer(file);
        });
    };

    // ✅ Función para copiar texto al portapapeles
    const copyToClipboard = async (textToCopy) => {
        try {
            await navigator.clipboard.writeText(textToCopy);
            alert('¡Texto copiado al portapapeles!');
        } catch (err) {
            console.error('Error al copiar:', err);
            alert('No se pudo copiar el texto. Intenta seleccionarlo y copiarlo manualmente.');
        }
    };

    // ✅ Función para descargar texto como archivo
    const downloadText = (textToDownload, filename) => {
        const element = document.createElement('a');
        const file = new Blob([textToDownload], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleGenerate = async () => {
        let inputText = text.trim();
        if (!inputText && !pdfFile) {
            setResult('Por favor, introduce texto o sube un archivo PDF.');
            return;
        }

        setIsLoading(true);
        setResult('');
        setQuizData(null);
        setShowAnswers(false);

        try {
            let content = inputText;
            if (pdfFile) {
                try {
                    content = await extractTextFromPdf(pdfFile);
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
            let generationConfig = {};

            if (tool === 'resumen') {
                systemInstruction = "Eres un asistente de estudio especializado en español. Resume el texto proporcionado de manera clara, estructurada y concisa. Usa viñetas, títulos y subtítulos cuando sea apropiado. El resumen debe ser fácil de entender para estudiantes de ESO.";
            } else if (tool === 'cuestionario') {
                systemInstruction = "Eres un profesor de ESO que enseña en español. Genera un cuestionario de 5 preguntas de opción múltiple en español. Cada pregunta debe tener 4 opciones, solo una correcta. Mezcla el orden de las opciones. Presenta el resultado como un objeto JSON con una propiedad `quiz` que es un array de objetos. Cada objeto debe tener: `question` (string), `options` (array de 4 strings), `correctAnswer` (string exacto de la opción correcta).";
                generationConfig = {
                    responseMimeType: "application/json"
                };
            } else if (tool === 'explicar') {
                systemInstruction = "Eres un profesor de ESO que explica conceptos en español de forma clara, sencilla y amigable. Usa ejemplos cotidianos, analogías o pasos si es necesario. La explicación debe ser fácil de entender para un estudiante de 12-14 años. No uses jerga técnica sin explicarla. Si el usuario pregunta sobre un concepto, responde con una explicación estructurada, con título, desarrollo y ejemplo práctico.";
            }

            const payload = {
                contents: [{ parts: [{ text: content }] }],
                systemInstruction: { parts: [{ text: systemInstruction }] },
                generationConfig
            };

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Error en la API');
            }

            const data = await response.json();
            const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!generatedText) {
                setResult("No se pudo generar el resultado.");
                return;
            }

            // ✅ Guardar en historial de IA si el usuario está autenticado
            if (currentUser) {
                try {
                    const promptText = pdfFile ? "📄 PDF cargado" : text.trim();
                    const title = tool === 'resumen' ? "Resumen generado" :
                                  tool === 'cuestionario' ? "Cuestionario generado" :
                                  `Explicación: ${text.split(' ').slice(0, 5).join(' ')}...`;

                    await addDoc(collection(db, 'users', currentUser.uid, 'ai_history'), {
                        prompt: promptText,
                        response: generatedText,
                        tool: tool,
                        timestamp: serverTimestamp(),
                        title: title
                    });
                    console.log('✅ Historial de IA guardado');
                } catch (saveError) {
                    console.error('❌ Error al guardar en historial:', saveError);
                    // No mostramos alerta al usuario, solo logueamos
                }
            }

            // Procesar resultado
            if (tool === 'cuestionario' && generatedText) {
                try {
                    const parsedData = JSON.parse(generatedText);
                    if (Array.isArray(parsedData.quiz)) {
                        setQuizData(parsedData.quiz);
                    } else {
                        throw new Error('Formato de cuestionario inválido');
                    }
                } catch (parseError) {
                    console.error('Error parsing JSON:', parseError);
                    setResult('Error al generar el cuestionario. Por favor, inténtalo de nuevo.');
                }
            } else {
                setResult(generatedText);
            }

        } catch (error) {
            console.error('Error al generar contenido:', error);
            setResult('Hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="ai-tools">
            <div className="container">
                <h2 className="section-title">Herramientas de Inteligencia Artificial</h2>
                <p className="subtitle">Potencia tus estudios con IA: resume textos, genera cuestionarios o explica conceptos.</p>

                {/* ✅ Botón para ver historial (solo si está autenticado) */}
                {currentUser && (
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <Link to="/historial-ia" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                            📚 Ver mi historial de IA
                        </Link>
                    </div>
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
                                    clearFile(); // Limpiar PDF si se empieza a escribir
                                }
                            }}
                            disabled={!!pdfFile}
                        ></textarea>
                        <button
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

                {quizData && (
                    <div className="result-container quiz-result">
                        <div className="result-header">
                            <h3><i className="fas fa-graduation-cap"></i> Tu Cuestionario de Estudio</h3>
                            <div className="result-actions">
                                <button 
                                    className="btn btn-outline copy-btn"
                                    onClick={() => {
                                        const quizText = quizData.map((q, i) => 
                                            `${i+1}. ${q.question}\n${q.options.map((opt, j) => `   ${String.fromCharCode(65+j)}. ${opt}`).join('\n')}\n`
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
                                            `${i+1}. ${q.question}\n${q.options.map((opt, j) => `   ${String.fromCharCode(65+j)}. ${opt}`).join('\n')}\n`
                                        ).join('\n');
                                        downloadText(quizText, 'cuestionario.txt');
                                    }}
                                >
                                    <i className="fas fa-download"></i> Descargar
                                </button>
                            </div>
                        </div>
                        {quizData.map((q, index) => (
                            <div key={index} className="quiz-question">
                                <h4>{index + 1}. {q.question}</h4>
                                <ul className="options-list">
                                    {q.options.map((option, optIndex) => (
                                        <li 
                                            key={optIndex}
                                            className={`option-item ${showAnswers && option === q.correctAnswer ? 'correct' : ''}`}
                                        >
                                            <span className="option-letter">{String.fromCharCode(65 + optIndex)}.</span>
                                            {option}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                        <button 
                            className="btn btn-secondary toggle-answers"
                            onClick={() => setShowAnswers(!showAnswers)}
                        >
                            {showAnswers ? 'Ocultar Respuestas' : 'Mostrar Respuestas'}
                        </button>
                    </div>
                )}

                {result && tool === 'resumen' && (
                    <div className="result-container">
                        <div className="result-header">
                            <h3><i className="fas fa-file-alt"></i> Resultado de la IA</h3>
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
                        <div className="result-text">
                            {result.split('\n').map((line, index) => (
                                <p key={index} className={line.startsWith('-') ? 'bullet-point' : ''}>
                                    {line}
                                </p>
                            ))}
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
                        <div className="result-text">
                            {result.split('\n').map((line, index) => (
                                <p key={index} className={line.startsWith('-') ? 'bullet-point' : ''}>
                                    {line}
                                </p>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

export default AIToolsPage;