// src/analytics.js
import ReactGA from 'react-ga4';
import { hasAnalyticsConsent, getCookieConsent, clearAnalyticsCookies } from './utils/cookieConsent';

let initialized = false;

// Inicializar Google Analytics SOLO si el usuario ha aceptado las cookies analíticas.
// Se llama al arrancar la app y otra vez desde el banner al pulsar "Aceptar".
export const initGA = () => {
  if (initialized) return;
  if (!hasAnalyticsConsent()) {
    // Si el usuario retiró el consentimiento, borramos aquí las cookies de GA:
    // al arrancar GA aún no está cargado y no puede volver a escribirlas.
    if (getCookieConsent() === 'rejected') clearAnalyticsCookies();
    return;
  }
  const measurementId = import.meta.env.VITE_APP_GA_MEASUREMENT_ID;
  if (!measurementId) return;
  ReactGA.initialize(measurementId);
  initialized = true;
  console.log('✅ Google Analytics inicializado');
};

// Trackear page views (cuando cambia de página). No-op sin consentimiento.
export const trackPageView = (path) => {
  if (!initialized) return;
  ReactGA.send({
    hitType: 'pageview',
    page: path
  });
};

// Trackear eventos personalizados. No-op sin consentimiento.
export const trackEvent = (category, action, label) => {
  if (!initialized) return;
  ReactGA.event({
    category: category,
    action: action,
    label: label,
  });
  console.log(`📊 Evento: ${category} - ${action}`);
};

// Ejemplos de uso:
// trackEvent('auth', 'signup_success', 'email@example.com')
// trackEvent('landing', 'click_cta', 'hero_section')
// trackEvent('subjects', 'view_subject', 'Mathematics')
