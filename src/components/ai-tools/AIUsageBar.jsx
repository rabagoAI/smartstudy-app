// src/components/ai-tools/AIUsageBar.jsx
// Componente para mostrar el límite de uso de herramientas IA

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Zap, Clock, AlertCircle, Check } from 'lucide-react';
import './AIUsageBar.css';

export default function AIUsageBar() {
  const { currentUser } = useAuth();
  const [usageData, setUsageData] = useState({
    daily: 0,
    hourly: 0,
    lastReset: null,
    lastHourlyReset: null
  });
  const [loading, setLoading] = useState(true);

  // Límites
  const DAILY_LIMIT = 50; // Usos por día
  const HOURLY_LIMIT = 10; // Usos por hora

  useEffect(() => {
    if (!currentUser) return;

    const loadUsageData = async () => {
      try {
        const userRef = doc(db, 'users', currentUser.uid, 'settings', 'ai_usage');
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const now = new Date();
          const lastReset = data.lastReset?.toDate?.() || new Date();
          const lastHourlyReset = data.lastHourlyReset?.toDate?.() || new Date();

          // Verificar si hay que resetear el contador diario (24 horas)
          const daysDiff = Math.floor((now - lastReset) / (1000 * 60 * 60 * 24));
          if (daysDiff >= 1) {
            setUsageData({
              daily: 0,
              hourly: data.hourly || 0,
              lastReset: now,
              lastHourlyReset: lastHourlyReset
            });
          } else {
            // Verificar si hay que resetear el contador por hora
            const hoursDiff = Math.floor((now - lastHourlyReset) / (1000 * 60 * 60));
            if (hoursDiff >= 1) {
              setUsageData({
                daily: data.daily || 0,
                hourly: 0,
                lastReset: lastReset,
                lastHourlyReset: now
              });
            } else {
              setUsageData(data);
            }
          }
        } else {
          // Primer uso
          setUsageData({
            daily: 0,
            hourly: 0,
            lastReset: new Date(),
            lastHourlyReset: new Date()
          });
        }
      } catch (error) {
        console.error('Error cargando datos de uso:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsageData();
  }, [currentUser]);

  // Incrementar contador de uso
  const incrementUsage = async () => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid, 'settings', 'ai_usage');
      const now = new Date();

      const newData = {
        daily: (usageData.daily || 0) + 1,
        hourly: (usageData.hourly || 0) + 1,
        lastReset: usageData.lastReset || now,
        lastHourlyReset: usageData.lastHourlyReset || now,
        updatedAt: serverTimestamp()
      };

      await setDoc(userRef, newData, { merge: true });
      setUsageData(newData);
    } catch (error) {
      console.error('Error actualizando uso:', error);
    }
  };

  // Verificar si puede usar
  const canUseAI = () => {
    return usageData.daily < DAILY_LIMIT && usageData.hourly < HOURLY_LIMIT;
  };

  // Calcular tiempo restante para reset horario
  const getTimeUntilHourlyReset = () => {
    if (!usageData.lastHourlyReset) return '1h';
    const now = new Date();
    const lastReset = new Timestamp.fromDate(usageData.lastHourlyReset).toDate?.() || usageData.lastHourlyReset;
    const diffMs = new Date(lastReset.getTime() + 60 * 60 * 1000) - now;
    const minutes = Math.ceil(diffMs / (1000 * 60));
    return minutes > 0 ? `${minutes}m` : '1m';
  };

  // Calcular tiempo restante para reset diario
  const getTimeUntilDailyReset = () => {
    if (!usageData.lastReset) return '24h';
    const now = new Date();
    const lastReset = new Timestamp.fromDate(usageData.lastReset).toDate?.() || usageData.lastReset;
    const diffMs = new Date(lastReset.getTime() + 24 * 60 * 60 * 1000) - now;
    const hours = Math.ceil(diffMs / (1000 * 60 * 60));
    return hours > 0 ? `${hours}h` : '24h';
  };

  if (loading) {
    return (
      <div className="ai-usage-bar loading">
        <div className="usage-skeleton" />
      </div>
    );
  }

  const dailyPercentage = (usageData.daily / DAILY_LIMIT) * 100;
  const hourlyPercentage = (usageData.hourly / HOURLY_LIMIT) * 100;
  const canUse = canUseAI();

  return (
    <div className={`ai-usage-bar ${!canUse ? 'limited' : ''}`}>
      <div className="usage-container">
        
        {/* Uso Diario */}
        <div className="usage-item">
          <div className="usage-header">
            <div className="usage-title">
              <Clock size={18} />
              <span>Uso Diario</span>
            </div>
            <span className="usage-count">{usageData.daily}/{DAILY_LIMIT}</span>
          </div>
          <div className="progress-bar">
            <div 
              className={`progress-fill ${dailyPercentage >= 80 ? 'warning' : ''} ${dailyPercentage >= 100 ? 'danger' : ''}`}
              style={{ width: `${Math.min(dailyPercentage, 100)}%` }}
            />
          </div>
          <div className="usage-info">
            <span className="text-small">
              {DAILY_LIMIT - usageData.daily} usos restantes hoy
            </span>
            <span className="text-small secondary">
              Reset en {getTimeUntilDailyReset()}
            </span>
          </div>
        </div>

        {/* Uso Por Hora */}
        <div className="usage-item">
          <div className="usage-header">
            <div className="usage-title">
              <Zap size={18} />
              <span>Uso por Hora</span>
            </div>
            <span className="usage-count">{usageData.hourly}/{HOURLY_LIMIT}</span>
          </div>
          <div className="progress-bar">
            <div 
              className={`progress-fill ${hourlyPercentage >= 80 ? 'warning' : ''} ${hourlyPercentage >= 100 ? 'danger' : ''}`}
              style={{ width: `${Math.min(hourlyPercentage, 100)}%` }}
            />
          </div>
          <div className="usage-info">
            <span className="text-small">
              {HOURLY_LIMIT - usageData.hourly} usos restantes esta hora
            </span>
            <span className="text-small secondary">
              Reset en {getTimeUntilHourlyReset()}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="usage-status">
          {canUse ? (
            <div className="status-good">
              <Check size={18} />
              <span>Puedes usar las herramientas</span>
            </div>
          ) : (
            <div className="status-warning">
              <AlertCircle size={18} />
              <span>Límite alcanzado. Intenta más tarde.</span>
            </div>
          )}
        </div>

      </div>

      {/* Plan Info */}
      <div className="usage-plan-info">
        <p className="plan-text">
          📊 <strong>Plan Gratuito:</strong> {DAILY_LIMIT} usos/día, {HOURLY_LIMIT} usos/hora
        </p>
      </div>
    </div>
  );
}
