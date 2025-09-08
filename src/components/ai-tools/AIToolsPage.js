// src/components/ai-tools/AIToolsPage.js

import React, { useState } from 'react';
import '../../App.css';
import * as pdfjsLib from 'pdfjs-dist';

// Variable global para la API de Gemini
const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

// Asegurarse de que el worker de PDF.js esté configurado
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function AIToolsPage() {
    const [tool, setTool] = useState(null);
    const [text, setText] = useState('');
    const [pdfFile, setPdfFile] = useState(null);
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Maneja la selección de herramienta, limpiando los estados
    const handleSelectTool = (selectedTool) => {
        setTool(selectedTool);
        setText('');
        setPdfFile(null);
        setResult('');
    };

    // Maneja la selección de archivo PDF
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            setText(''); // Limpiar texto manual si se sube un archivo
            setResult('');
        } else {
            setPdfFile(null);
            e.target.value = null; // Resetear el campo de archivo
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
                    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                    let fullText = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        fullText += textContent.items.map(item => item.str).join(' ');
                    }
                    resolve(fullText);
                } catch (error) {
                    reject('Error al procesar el archivo PDF: ' + error.message);
                }
            };
            reader.onerror = (error) => reject('Error al leer el archivo: ' + error.message);
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

        let content = inputText;
        if (pdfFile) {
            try {
                content = await extractTextFromPdf(pdfFile);
                if (content.length === 0) {
                    setResult('El archivo PDF no contiene texto extraíble.');
                    setIsLoading(false);
                    return;
                }
            } catch (error) {
                setResult(error);
                setIsLoading(false);
                return;
            }
        }
        
        let systemInstruction = "";
        if (tool === 'resumen') {
            systemInstruction = "Eres un asistente de estudio. Tu tarea es resumir el texto proporcionado por el usuario de manera concisa y clara, enfocándote en los puntos clave.";
        } else if (tool === 'cuestionario') {
            systemInstruction = "Eres un asistente de estudio. Tu tarea es generar un cuestionario de 5 preguntas de opción múltiple basadas en el texto proporcionado por el usuario. Cada pregunta debe tener 4 opciones y la respuesta correcta debe estar claramente marcada, por ejemplo, con (Respuesta Correcta).";
        }

        const payload = {
            contents: [{ parts: [{ text: content }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] },
        };
        
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error.message || 'Error en la API');
            }

            const data = await response.json();
            const generatedText = data.candidates[0]?.content?.parts[0]?.text || "No se pudo generar el resultado.";
            setResult(generatedText);
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

                {result && (
                    <div className="result-container">
                        <h3>Resultado</h3>
                        <p className="result-text">{result}</p>
                    </div>
                )}
            </div>
        </section>
    );
}

export default AIToolsPage;


