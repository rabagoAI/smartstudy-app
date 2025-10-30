// src/analytics.js
import ReactGA from 'react-ga4';

// Inicializar Google Analytics
export const initGA = () => {
  // REEMPLAZA "G-XXXXXXXXXX" CON TU MEASUREMENT ID
  ReactGA.initialize('G-VKRN1MRKG4');
  console.log('✅ Google Analytics inicializado');
};

// Trackear page views (cuando cambia de página)
export const trackPageView = (path) => {
  ReactGA.send({ 
    hitType: 'pageview', 
    page: path 
  });
};

// Trackear eventos personalizados
export const trackEvent = (category, action, label) => {
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