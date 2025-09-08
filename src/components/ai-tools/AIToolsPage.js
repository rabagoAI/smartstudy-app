// src/components/ai-tools/AIToolsPage.js

import React, { useState, useEffect } from 'react';
import '../../App.css';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

// Variable global para la API de Gemini
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
        // Configurar el worker con la versión específica instalada
        GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }, []);

    // Maneja la selección de herramienta, limpiando los estados
    const handleSelectTool = (selectedTool) => {
        setTool(selectedTool);
        setText('');
        setPdfFile(null);
        setResult('');
        setQuizData(null);
        setShowAnswers(false);
    };

    // Maneja la selección de archivo PDF
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            setText(''); // Limpiar texto manual si se sube un archivo
            setResult('');
            setQuizData(null);
            setShowAnswers(false);
        } else {
            setPdfFile(null);
            // Resetear el campo de archivo para permitir subir el mismo archivo de nuevo
            e.target.value = null; 
            setResult('Por favor, sube un archivo PDF válido.');
        }
    };

    // Función para extraer texto de un archivo PDF
    const extractTextFromPdf = async (file) => {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onload = async (event) => {
                const arrayBuffer = event.target.result;
                try {
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
                    console.error('Error al procesar PDF:', error);
                    reject('Error al procesar el archivo PDF: ' + error.message);
                }
            };
            reader.onerror = (error) => {
                console.error('Error al leer archivo:', error);
                reject('Error al leer el archivo: ' + error.message);
            };
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
                systemInstruction = "Eres un asistente de estudio. Tu tarea es resumir el texto proporcionado por el usuario de manera concisa y clara, enfocándote en los puntos clave.";
            } else if (tool === 'cuestionario') {
                systemInstruction = "Eres un asistente de estudio. Tu tarea es generar un cuestionario de 5 preguntas de opción múltiple con la respuesta correcta. Asegúrate de que la respuesta correcta sea una de las opciones. Presenta el resultado como un objeto JSON con una propiedad `quiz` que es un array de objetos. Cada objeto de pregunta debe tener `question`, `options` (un array de strings) y `correctAnswer` (la respuesta correcta como string).";
                generationConfig = {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "OBJECT",
                        properties: {
                            "quiz": {
                                "type": "ARRAY",
                                "items": {
                                    "type": "OBJECT",
                                    "properties": {
                                        "question": { "type": "STRING" },
                                        "options": {
                                            "type": "ARRAY",
                                            "items": { "type": "STRING" }
                                        },
                                        "correctAnswer": { "type": "STRING" }
                                    },
                                    "propertyOrdering": ["question", "options", "correctAnswer"]
                                }
                            }
                        }
                    }
                };
            }

            const payload = {
                contents: [{ parts: [{ text: content }] }],
                systemInstruction: { parts: [{ text: systemInstruction }] },
                generationConfig
            };
            
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
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
                const parsedData = JSON.parse(generatedText);
                setQuizData(parsedData.quiz);
            } else {
                setResult(generatedText || "No se pudo generar el resultado.");
            }
            
        } catch (error) {
            console.error('Error al generar contenido:', error);
            setResult('Hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.');
            setQuizData(null);
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
                        <p>Convierte textos largos en resúmenes claros.</p>
                    </button>
                    <button
                        className={`tool-card ${tool === 'cuestionario' ? 'active' : ''}`}
                        onClick={() => handleSelectTool('cuestionario')}
                    >
                        <h3><i className="fas fa-question-circle"></i> Genera un Cuestionario</h3>
                        <p>Crea preguntas de estudio basadas en tus apuntes.</p>
                    </button>
                </div>

                {tool && (
                    <div className="tool-interface">
                        <div className="file-input-container">
                            <label htmlFor="pdf-upload" className="file-label">
                                {pdfFile ? `Archivo seleccionado: ${pdfFile.name}` : 'Sube un archivo PDF'}
                            </label>
                            <input
                                id="pdf-upload"
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                className="hidden-input"
                                key={pdfFile ? pdfFile.name : 'empty'}
                            />
                        </div>
                        <p className="or-text">o pega el texto directamente:</p>
                        <textarea
                            className="tool-textarea"
                            rows="10"
                            placeholder="Pega aquí el texto que quieres que la IA procese..."
                            value={text}
                            onChange={(e) => {
                                setText(e.target.value);
                                setPdfFile(null); // Limpiar archivo si se empieza a escribir
                                document.getElementById('pdf-upload').value = null;
                            }}
                            disabled={!!pdfFile}
                        ></textarea>
                        <button
                            className="btn btn-primary generate-btn"
                            onClick={handleGenerate}
                            disabled={isLoading || (!text.trim() && !pdfFile)}
                        >
                            {isLoading ? 'Generando...' : 'Generar'}
                        </button>
                    </div>
                )}

                {isLoading && (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Procesando con IA. Esto puede tardar unos segundos...</p>
                    </div>
                )}

                {quizData && (
                    <div className="result-container">
                        <h3>Cuestionario</h3>
                        {quizData.map((q, index) => (
                            <div key={index} className="quiz-question">
                                <h4>{index + 1}. {q.question}</h4>
                                <ul>
                                    {q.options.map((option, optIndex) => (
                                        <li 
                                            key={optIndex}
                                            className={showAnswers && option === q.correctAnswer ? 'correct-answer' : ''}
                                        >
                                            {option}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                        <button 
                            className="btn btn-secondary" 
                            onClick={() => setShowAnswers(!showAnswers)}
                        >
                            {showAnswers ? 'Ocultar Respuestas' : 'Mostrar Respuestas'}
                        </button>
                    </div>
                )}

                {result && tool !== 'cuestionario' && (
                    <div className="result-container">
                        <h3>Resultado</h3>
                        <div className="result-text" style={{whiteSpace: 'pre-wrap'}}>
                            {result}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

export default AIToolsPage;









