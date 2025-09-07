// src/components/ai-tools/AIToolsPage.js

import React, { useState } from 'react';
import '../../App.css';

// Variable global para la API de Gemini, proporcionada automáticamente
const apiKey = typeof __api_key !== 'undefined' ? __api_key : '';

function AIToolsPage() {
    const [tool, setTool] = useState(null);
    const [text, setText] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSelectTool = (selectedTool) => {
        setTool(selectedTool);
        setResult(''); // Limpiar resultados al cambiar de herramienta
    };

    const handleGenerate = async () => {
        if (!text.trim()) {
            setResult('Por favor, introduce algún texto.');
            return;
        }

        setIsLoading(true);
        setResult('');

        let systemInstruction = "";
        if (tool === 'resumen') {
            systemInstruction = "Eres un asistente de estudio. Tu tarea es resumir el texto proporcionado por el usuario de manera concisa y clara, enfocándote en los puntos clave.";
        } else if (tool === 'cuestionario') {
            systemInstruction = "Eres un asistente de estudio. Tu tarea es generar un cuestionario de 5 preguntas de opción múltiple basadas en el texto proporcionado por el usuario. Cada pregunta debe tener 4 opciones y la respuesta correcta debe estar claramente marcada, por ejemplo, con (Respuesta Correcta).";
        }

        const payload = {
            contents: [{ parts: [{ text: text }] }],
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
                        <textarea
                            className="tool-textarea"
                            rows="10"
                            placeholder="Pega aquí el texto que quieres que la IA procese..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        ></textarea>
                        <button
                            className="btn btn-primary generate-btn"
                            onClick={handleGenerate}
                            disabled={isLoading}
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