// src/components/common/CookieBanner.jsx
// Banner de consentimiento de cookies (primera capa). Bloquea Google Analytics
// hasta que el usuario pulsa "Aceptar todas". "Rechazar todas" tiene el mismo
// peso visual que aceptar, como exige la guía de cookies de la AEPD.

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCookieConsent, setCookieConsent, clearAnalyticsCookies } from '../../utils/cookieConsent';
import { initGA } from '../../analytics';
import './CookieBanner.css';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Solo se muestra si el usuario aún no ha decidido
    if (getCookieConsent() === null) setVisible(true);

    // Permite reabrir el banner desde la Política de Cookies ("Cambiar preferencias")
    const reopen = () => setVisible(true);
    window.addEventListener('cookie-consent-reopen', reopen);
    return () => window.removeEventListener('cookie-consent-reopen', reopen);
  }, []);

  const accept = () => {
    setCookieConsent('accepted');
    initGA(); // Carga GA ahora que hay consentimiento
    setVisible(false);
  };

  const reject = () => {
    const wasAccepted = getCookieConsent() === 'accepted';
    setCookieConsent('rejected');
    setVisible(false);
    if (wasAccepted) {
      // GA ya estaba cargado en esta página: borramos sus cookies y recargamos
      // para que el script deje de ejecutarse.
      clearAnalyticsCookies();
      window.location.reload();
    }
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-live="polite" aria-label="Aviso de cookies">
      <div className="cookie-banner__content">
        <p className="cookie-banner__text">
          Usamos cookies técnicas necesarias para que la web funcione y, solo si lo aceptas,
          cookies analíticas de terceros (Google Analytics) para saber cómo se usa SmartStudia.
          Puedes cambiar tu decisión cuando quieras. Más información en la{' '}
          <Link to="/politica-de-cookies" className="cookie-banner__link">Política de Cookies</Link>.
        </p>
        <div className="cookie-banner__actions">
          <button type="button" className="cookie-banner__btn" onClick={reject}>
            Rechazar todas
          </button>
          <button type="button" className="cookie-banner__btn" onClick={accept}>
            Aceptar todas
          </button>
        </div>
      </div>
    </div>
  );
}

// Reabre el banner para que el usuario cambie su decisión.
export const reopenCookieBanner = () => {
  window.dispatchEvent(new Event('cookie-consent-reopen'));
};
