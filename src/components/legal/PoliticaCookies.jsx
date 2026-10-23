// src/components/legal/PoliticaCookies.jsx
// Política de Cookies (art. 22.2 LSSI-CE + Guía de cookies de la AEPD).
// Si añades una herramienta nueva que use cookies, actualiza la tabla.

import React from 'react';
import LegalLayout from './LegalLayout';
import { reopenCookieBanner } from '../common/CookieBanner';

export default function PoliticaCookies() {
  return (
    <LegalLayout title="Política de Cookies" updatedAt="23 de octubre de 2026">
      <h2>1. Qué son las cookies</h2>
      <p>
        Las cookies y tecnologías similares (como el almacenamiento local del navegador) son
        pequeños archivos que una web guarda en tu dispositivo para recordar información sobre
        tu visita.
      </p>

      <h2>2. Cookies que usamos</h2>

      <h3>Técnicas o necesarias (no requieren consentimiento)</h3>
      <p>Son imprescindibles para que la web funcione: mantener tu sesión iniciada, procesar pagos y recordar tu decisión sobre cookies.</p>
      <div className="legal-table-wrap">
        <table className="legal-table">
          <thead>
            <tr><th>Nombre</th><th>Proveedor</th><th>Finalidad</th><th>Duración</th></tr>
          </thead>
          <tbody>
            <tr><td>firebase:authUser:* (almacenamiento local)</td><td>Google Firebase</td><td>Mantener la sesión iniciada</td><td>Hasta cerrar sesión</td></tr>
            <tr><td>cookie_consent_v1 (almacenamiento local)</td><td>SmartStudia</td><td>Recordar tu decisión sobre cookies</td><td>24 meses; después te volveremos a preguntar</td></tr>
            <tr><td>__stripe_mid, __stripe_sid</td><td>Stripe</td><td>Prevención del fraude en los pagos</td><td>1 año / 30 minutos</td></tr>
          </tbody>
        </table>
      </div>

      <h3>Analíticas (solo con tu consentimiento)</h3>
      <p>Nos ayudan a entender cómo se usa SmartStudia para mejorarla. Solo se activan si pulsas «Aceptar todas».</p>
      <div className="legal-table-wrap">
        <table className="legal-table">
          <thead>
            <tr><th>Nombre</th><th>Proveedor</th><th>Finalidad</th><th>Duración</th></tr>
          </thead>
          <tbody>
            <tr><td>_ga</td><td>Google Analytics</td><td>Distinguir usuarios de forma estadística</td><td>2 años</td></tr>
            <tr><td>_ga_*</td><td>Google Analytics</td><td>Mantener el estado de la sesión de analítica</td><td>2 años</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        Google puede tratar estos datos en EE. UU. al amparo del Data Privacy Framework. Más
        información en la{' '}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">política de privacidad de Google</a>.
      </p>

      <h2>3. Cómo cambiar tu decisión</h2>
      <p>Puedes aceptar o rechazar las cookies analíticas en cualquier momento:</p>
      <p>
        <button type="button" className="legal-button" onClick={reopenCookieBanner}>
          Cambiar preferencias de cookies
        </button>
      </p>
      <p>
        También puedes borrar o bloquear las cookies desde la configuración de tu navegador
        (Chrome, Firefox, Safari o Edge). Si bloqueas las cookies técnicas, es posible que no
        puedas iniciar sesión.
      </p>
    </LegalLayout>
  );
}
