// src/components/ai-tools/AIResultDisplay.jsx
// Componente para mostrar resultados de IA con formato mejorado

import React, { useState } from 'react';
import { Copy, Download, ThumbsUp, ThumbsDown, Share2, Loader } from 'lucide-react';
import './AIResultDisplay.css';

export default function AIResultDisplay({ 
  result, 
  title = "Resultado de la IA",
  isLoading = false,
  onRegenerate = () => {}
}) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Copiar al portapapeles
  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Descargar como texto
  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([result], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `resultado-ia-${new Date().getTime()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Compartir
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: result,
      });
    } else {
      handleCopy();
    }
  };

  // Procesar markdown mejorado
  const parseContent = (text) => {
    if (!text) return null;

    const elements = [];
    const lines = text.split('\n');
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Encabezados H2 (##)
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={`h2-${i}`} className="ai-result-h2">
            {line.replace('## ', '')}
          </h2>
        );
        i++;
      }
      // Encabezados H3 (###)
      else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${i}`} className="ai-result-h3">
            {line.replace('### ', '')}
          </h3>
        );
        i++;
      }
      // Encabezados H4 (####)
      else if (line.startsWith('#### ')) {
        elements.push(
          <h4 key={`h4-${i}`} className="ai-result-h4">
            {line.replace('#### ', '')}
          </h4>
        );
        i++;
      }
      // Listas numeradas (1., 2., etc.)
      else if (/^\d+\.\s/.test(line)) {
        const listItems = [];
        while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
          const content = lines[i].replace(/^\d+\.\s/, '');
          listItems.push(
            <li key={`li-${i}`} className="ai-result-li">
              {content}
            </li>
          );
          i++;
        }
        elements.push(
          <ol key={`ol-${elements.length}`} className="ai-result-ol">
            {listItems}
          </ol>
        );
      }
      // Listas con * o -
      else if (line.startsWith('* ') || line.startsWith('- ')) {
        const listItems = [];
        while (i < lines.length && (lines[i].startsWith('* ') || lines[i].startsWith('- '))) {
          const content = lines[i].replace(/^[\*\-]\s/, '');
          listItems.push(
            <li key={`li-${i}`} className="ai-result-li">
              {content}
            </li>
          );
          i++;
        }
        elements.push(
          <ul key={`ul-${elements.length}`} className="ai-result-ul">
            {listItems}
          </ul>
        );
      }
      // Separadores (---)
      else if (line.trim() === '---' || line.trim() === '***') {
        elements.push(<hr key={`hr-${i}`} className="ai-result-hr" />);
        i++;
      }
      // Párrafos vacios
      else if (line.trim() === '') {
        elements.push(<div key={`space-${i}`} className="ai-result-spacer" />);
        i++;
      }
      // Párrafos normales
      else if (line.trim()) {
        elements.push(
          <p key={`p-${i}`} className="ai-result-p">
            {line}
          </p>
        );
        i++;
      } else {
        i++;
      }
    }

    return elements;
  };

  return (
    <div className="ai-result-container">
      {/* Header */}
      <div className="ai-result-header">
        <h2 className="ai-result-title">{title}</h2>
        <div className="ai-result-actions">
          <button
            className="ai-action-btn"
            onClick={handleCopy}
            title="Copiar resultado"
          >
            <Copy size={18} />
          </button>
          <button
            className="ai-action-btn"
            onClick={handleDownload}
            title="Descargar como texto"
          >
            <Download size={18} />
          </button>
          <button
            className="ai-action-btn"
            onClick={handleShare}
            title="Compartir"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="ai-result-content">
        {isLoading ? (
          <div className="ai-result-loading">
            <Loader className="ai-spinner" />
            <p>Generando respuesta...</p>
          </div>
        ) : result ? (
          <div className="ai-result-text">
            {parseContent(result)}
          </div>
        ) : (
          <p className="ai-result-empty">Sin contenido para mostrar</p>
        )}
      </div>

      {/* Footer con feedback y acciones */}
      {result && !isLoading && (
        <div className="ai-result-footer">
          <div className="ai-feedback">
            <span className="ai-feedback-label">¿Te fue útil?</span>
            <button
              className={`ai-feedback-btn ${feedback === 'good' ? 'active' : ''}`}
              onClick={() => setFeedback('good')}
              title="Sí, fue útil"
            >
              <ThumbsUp size={16} />
            </button>
            <button
              className={`ai-feedback-btn ${feedback === 'bad' ? 'active' : ''}`}
              onClick={() => setFeedback('bad')}
              title="No, no fue útil"
            >
              <ThumbsDown size={16} />
            </button>
          </div>
          
          <button
            className="ai-regenerate-btn"
            onClick={onRegenerate}
          >
            Regenerar respuesta
          </button>
        </div>
      )}

      {/* Feedback confirmado */}
      {feedback && (
        <div className="ai-result-feedback-confirm">
          {feedback === 'good' ? '✓ Gracias por tu feedback' : '✓ Feedback registrado'}
        </div>
      )}
    </div>
  );
}