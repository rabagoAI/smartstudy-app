// src/components/ai-tools/AIToolsPage.js

import React, { useState, useEffect } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import './AIToolsPage.css'; // Añadiremos estilos personalizados

const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

function AIToolsPage() {
    const [tool, setTool] = useState(null);
    const [text, setText] = useState('');
    const [pdfFile, setPdfFile] = useState(null);
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [quizData, setQuizData] = useState(null);
    const [showAnswers, setShowAnswers] = useState(false);

    useEffect(() => {
        GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }, []);

    const handleSelectTool = (selectedTool) => {
        setTool(selectedTool);
        setText('');
        setPdfFile(null);
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
                    const pdf = await getDocument({ data: arrayBuffer }).promise;
                    let fullText = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map(item => item.str).join(' ');
                        fullText += pageText + '\n';
                    }
                    resolve(fullText);
                } catch (error) {
                    reject('Error al procesar el PDF: ' + error.message);
                }
            };
            reader.onerror = () => reject('Error al leer el archivo');
            reader.readAsArrayBuffer(file);
        });
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
                systemInstruction = "Eres un asistente de estudio experto. Resume el texto proporcionado de manera clara, estructurada y concisa. Usa viñetas, títulos y subtítulos cuando sea apropiado. El resumen debe ser fácil de entender para estudiantes de ESO.";
            } else if (tool === 'cuestionario') {
                systemInstruction = "Eres un profesor de ESO. Genera un cuestionario de 5 preguntas de opción múltiple. Cada pregunta debe tener 4 opciones, solo una correcta. Mezcla el orden de las opciones. Presenta el resultado como un objeto JSON con una propiedad `quiz` que es un array de objetos. Cada objeto debe tener: `question` (string), `options` (array de 4 strings), `correctAnswer` (string exacto de la opción correcta).";
                generationConfig = {
                    responseMimeType: "application/json"
                };
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
                setResult(generatedText || "No se pudo generar el resultado.");
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
                <p className="subtitle">Potencia tus estudios con IA: resume textos y genera cuestionarios de forma instantánea.</p>

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
                                        onClick={() => {
                                            setPdfFile(null);
                                            document.getElementById('pdf-upload').value = null;
                                        }}
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

                        <p className="or-text">o pega el texto directamente:</p>
                        <textarea
                            className="tool-textarea"
                            rows="8"
                            placeholder="Pega aquí el texto que quieres que la IA procese..."
                            value={text}
                            onChange={(e) => {
                                setText(e.target.value);
                                setPdfFile(null);
                                document.getElementById('pdf-upload').value = null;
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
                        <p className="tip">💡 Consejo: Mientras esperas, puedes preparar tu siguiente texto o PDF.</p>
                    </div>
                )}

                {quizData && (
                    <div className="result-container quiz-result">
                        <h3><i className="fas fa-graduation-cap"></i> Tu Cuestionario de Estudio</h3>
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

                {result && tool !== 'cuestionario' && (
                    <div className="result-container">
                        <h3><i className="fas fa-file-alt"></i> Resultado de la IA</h3>
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