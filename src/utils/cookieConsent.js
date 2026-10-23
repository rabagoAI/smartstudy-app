// src/utils/cookieConsent.js
// Gestión del consentimiento de cookies (RGPD / LOPDGDD / LSSI-CE).
// La decisión del usuario se guarda en localStorage. Hasta que el usuario
// acepta de forma explícita, NO se cargan cookies analíticas (Google Analytics).

const STORAGE_KEY = 'cookie_consent_v1';

// Devuelve 'accepted' | 'rejected' | null (null = el usuario no ha decidido aún)
export const getCookieConsent = () => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'accepted' || value === 'rejected' ? value : null;
  } catch {
    // localStorage no disponible (p. ej. modo privado)
    return null;
  }
};

export const setCookieConsent = (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Si no se puede persistir, la decisión solo vale para esta sesión.
  }
  // Avisa a la app en la MISMA pestaña (el evento 'storage' solo llega a otras pestañas).
  window.dispatchEvent(new CustomEvent('cookie-consent-change', { detail: value }));
};

export const hasAnalyticsConsent = () => getCookieConsent() === 'accepted';

// Borra las cookies de Google Analytics (_ga, _ga_*) al retirar el consentimiento.
// GA las crea en el dominio raíz (p. ej. .smartstudia.com), así que probamos
// tanto el host actual como sus dominios padre.
export const clearAnalyticsCookies = () => {
  const names = document.cookie
    .split(';')
    .map((c) => c.split('=')[0].trim())
    .filter((name) => name === '_ga' || name.startsWith('_ga_') || name === '_gid');

  const parts = window.location.hostname.split('.');
  const domains = [''];
  for (let i = 0; i < parts.length - 1; i++) {
    domains.push(`; domain=.${parts.slice(i).join('.')}`);
  }

  names.forEach((name) => {
    domains.forEach((domain) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
    });
  });
};
