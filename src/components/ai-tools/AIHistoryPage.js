// src/components/ai-tools/AIHistoryPage.js
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../AuthContext';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import './AIHistoryPage.css';

function AIHistoryPage() {
  const { currentUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Estados para búsqueda y filtrado
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTool, setFilterTool] = useState('all'); // 'all', 'resumen', 'cuestionario', 'explicar'

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

  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    const historyRef = collection(db, 'users', currentUser.uid, 'ai_history');
    const q = query(historyRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const historyList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date()
      }));
      setHistory(historyList);
      setLoading(false);
    }, (error) => {
      console.error('Error al obtener historial:', error);
      setError('No se pudo cargar el historial. Por favor, inténtalo de nuevo más tarde.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // ✅ Filtrar y buscar usando useMemo para mejor rendimiento
  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      // Filtrar por herramienta
      const matchesTool = filterTool === 'all' || item.tool === filterTool;
      
      // Buscar en prompt o response
      const matchesSearch = searchTerm === '' || 
        item.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.response.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesTool && matchesSearch;
    });
  }, [history, filterTool, searchTerm]);

  if (loading) {
    return (
      <div className="ai-history">
        <div className="container">
          <h2 className="section-title">Historial de IA</h2>
          <p>Cargando tu historial...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-history">
        <div className="container">
          <h2 className="section-title">Historial de IA</h2>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-history">
      <div className="container">
        <h2 className="section-title">Historial de IA</h2>

        {/* ✅ Panel de búsqueda y filtrado */}
        <div className="history-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Buscar en historial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <i className="fas fa-search search-icon"></i>
          </div>

          <select
            value={filterTool}
            onChange={(e) => setFilterTool(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todas las herramientas</option>
            <option value="resumen">Resúmenes</option>
            <option value="cuestionario">Cuestionarios</option>
            <option value="explicar">Explicaciones</option>
          </select>
        </div>

        {filteredHistory.length === 0 ? (
          <p className="no-history">
            {history.length === 0 
              ? "No tienes historial de generaciones aún. ¡Empieza a usar las herramientas de IA!" 
              : "No se encontraron resultados con tu búsqueda o filtro."
            }
          </p>
        ) : (
          <div className="history-list">
            {filteredHistory.map((item) => (
              <div key={item.id} className="history-item">
                <div className="history-header">
                  <h3>{item.title}</h3>
                  <span className="history-date">
                    {item.timestamp.toLocaleDateString()} {item.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="history-content">
                  <div className="history-prompt">
                    <strong>Prompt:</strong> {item.prompt}
                  </div>
                  <div className="history-response">
                    <strong>Respuesta:</strong>
                    <div className="response-text">
                      {item.response.split('\n').map((line, index) => (
                        <p key={index} className={line.startsWith('-') ? 'bullet-point' : ''}>
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="history-actions">
                  <button 
                    className="btn btn-outline copy-btn"
                    onClick={() => copyToClipboard(item.response)}
                  >
                    <i className="fas fa-copy"></i> Copiar
                  </button>
                  <button 
                    className="btn btn-outline download-btn"
                    onClick={() => downloadText(item.response, `${item.tool}-${item.id}.txt`)}
                  >
                    <i className="fas fa-download"></i> Descargar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AIHistoryPage;