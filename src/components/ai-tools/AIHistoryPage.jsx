// src/components/ai-tools/AIHistoryPage.js
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, query, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import './AIHistoryPage.css';

// Componente para renderizar respuestas largas de forma eficiente
const LazyText = ({ text }) => {
  const [expanded, setExpanded] = useState(false);
  const shouldTruncate = text.length > 300;

  if (!shouldTruncate) {
    return (
      <div className="response-text">
        {text.split('\n').map((line, i) => (
          <p key={i} className={line.startsWith('-') ? 'bullet-point' : ''}>{line}</p>
        ))}
      </div>
    );
  }

  return (
    <div className="response-text">
      {expanded ? (
        text.split('\n').map((line, i) => (
          <p key={i} className={line.startsWith('-') ? 'bullet-point' : ''}>{line}</p>
        ))
      ) : (
        <p>{text.substring(0, 300)}...</p>
      )}
      <button
        className="btn-text-link"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Ver menos' : 'Ver más'}
      </button>
    </div>
  );
};

function AIHistoryPage() {
  const { currentUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  // Estados para búsqueda (Local en items cargados)
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTool, setFilterTool] = useState('all');

  const ITEMS_PER_PAGE = 20;

  const fetchHistory = useCallback(async (isInitial = false) => {
    if (!currentUser) return;

    try {
      if (isInitial) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const historyRef = collection(db, 'users', currentUser.uid, 'ai_history');
      let q;

      if (isInitial) {
        q = query(historyRef, orderBy('timestamp', 'desc'), limit(ITEMS_PER_PAGE));
      } else if (lastDoc) {
        q = query(historyRef, orderBy('timestamp', 'desc'), startAfter(lastDoc), limit(ITEMS_PER_PAGE));
      } else {
        return; // No more docs
      }

      const snapshot = await getDocs(q);

      const newItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date()
      }));

      // Actualizar cursor
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      setLastDoc(lastVisible);
      setHasMore(snapshot.docs.length === ITEMS_PER_PAGE);

      if (isInitial) {
        setHistory(newItems);
      } else {
        setHistory(prev => [...prev, ...newItems]);
      }

    } catch (err) {
      console.error("Error fetching history:", err);
      setError('Error al cargar el historial. Intenta recargar.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [currentUser, lastDoc]);

  // Cargar inicial
  useEffect(() => {
    fetchHistory(true);
  }, [currentUser]); // Solo al montar o cambiar usuario

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchHistory(false);
    }
  };

  const copyToClipboard = async (textToCopy) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      alert('¡Copiado!');
    } catch (err) { alert('Error al copiar'); }
  };

  const downloadText = (text, filename) => {
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.click(); // Hack simple
    element.click();
  };

  // Filtrado local optimizado
  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const matchesTool = filterTool === 'all' || item.tool === filterTool;
      const matchesSearch = searchTerm === '' ||
        item.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.response.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesTool && matchesSearch;
    });
  }, [history, filterTool, searchTerm]);

  return (
    <div className="ai-history">
      <div className="container">
        <h2 className="section-title">Historial de IA</h2>

        <div className="history-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Buscar en historial cargado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <select
            value={filterTool}
            onChange={(e) => setFilterTool(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todas</option>
            <option value="resumen">Resúmenes</option>
            <option value="cuestionario">Cuestionarios</option>
            <option value="explicar">Explicaciones</option>
          </select>
        </div>

        {loading ? (
          <p className="text-center">Cargando...</p>
        ) : filteredHistory.length === 0 ? (
          <p className="no-history">No se encontraron resultados.</p>
        ) : (
          <div className="history-list">
            {filteredHistory.map((item) => (
              <div key={item.id} className="history-item">
                <div className="history-header">
                  <h3>{item.title || 'Sin título'}</h3>
                  <span className="history-date">
                    {item.timestamp.toLocaleDateString()}
                  </span>
                </div>
                <div className="history-content">
                  <div className="history-prompt">
                    <strong>Tú:</strong> {item.prompt}
                  </div>
                  <div className="history-response">
                    <strong>IA:</strong>
                    <LazyText text={item.response} />
                  </div>
                </div>
                <div className="history-actions">
                  <button onClick={() => copyToClipboard(item.response)} className="btn-sm">Copiar</button>
                  <button onClick={() => downloadText(item.response, `ia-${item.id}.txt`)} className="btn-sm">Descargar</button>
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="load-more-container">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="btn btn-primary btn-load-more"
                >
                  {loadingMore ? 'Cargando más...' : 'Cargar más antiguos'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AIHistoryPage;