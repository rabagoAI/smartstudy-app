// src/components/legal/PoliticaPrivacidad.jsx
// Política de Privacidad (arts. 13 y 14 RGPD + LOPDGDD). Conviene que la
// revise un profesional. Actualizar la tabla si se añade un proveedor nuevo.

import React from 'react';
import LegalLayout from './LegalLayout';


export default function PoliticaPrivacidad() {
  return (
    <LegalLayout title="Política de Privacidad" updatedAt="23 de octubre de 2026">
      <h2>1. Responsable del tratamiento</h2>
      <ul>
        <li><strong>Responsable:</strong> Francisco García Rabago</li>
        <li><strong>NIF:</strong> 50982280-C</li>
        <li><strong>Domicilio:</strong> Calle Arena Alta, 45, 45291 Cobeja (Toledo)</li>
        <li><strong>Email para temas de privacidad:</strong> pacoalfair@hotmail.com</li>
      </ul>

      <h2>2. Qué datos tratamos</h2>
      <ul>
        <li><strong>Datos de cuenta:</strong> nombre, email y contraseña (cifrada por Firebase Authentication).</li>
        <li>
          <strong>Datos de suscripción:</strong> estado del plan Premium e identificadores de
          cliente y suscripción de Stripe. SmartStudia <strong>no almacena</strong> los datos de
          tu tarjeta: los gestiona directamente Stripe.
        </li>
        <li>
          <strong>Contenido que introduces en las herramientas de IA:</strong> textos, apuntes y
          preguntas que escribes o subes, y las respuestas generadas, que guardamos en tu
          historial.
        </li>
        <li><strong>Datos de uso:</strong> consumo de las herramientas de IA (para aplicar los límites del plan gratuito).</li>
        <li>
          <strong>Datos técnicos y de navegación:</strong> errores técnicos de la aplicación y,
          solo si aceptas las cookies analíticas, estadísticas de uso mediante Google Analytics.
        </li>
      </ul>
      <p>
        Te pedimos que <strong>no incluyas datos personales de terceros</strong> ni datos
        especialmente sensibles (salud, ideología, etc.) en los textos o archivos que envías a
        las herramientas de IA.
      </p>

      <h2>3. Finalidades y base legal</h2>
      <div className="legal-table-wrap">
        <table className="legal-table">
          <thead>
            <tr><th>Finalidad</th><th>Base legal (art. 6 RGPD)</th></tr>
          </thead>
          <tbody>
            <tr><td>Crear y gestionar tu cuenta</td><td>Ejecución del contrato (art. 6.1.b)</td></tr>
            <tr><td>Prestar las herramientas de IA y guardar tu historial</td><td>Ejecución del contrato (art. 6.1.b)</td></tr>
            <tr><td>Gestionar la suscripción Premium y los cobros</td><td>Ejecución del contrato (6.1.b) y obligación legal fiscal (6.1.c)</td></tr>
            <tr><td>Detectar errores y mantener la seguridad del servicio</td><td>Interés legítimo (art. 6.1.f)</td></tr>
            <tr><td>Analítica web (Google Analytics)</td><td>Consentimiento (art. 6.1.a), revocable en cualquier momento</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        No usamos tus datos para tomar decisiones automatizadas con efectos jurídicos sobre ti
        ni para elaborar perfiles comerciales.
      </p>

      <h2>4. Plazo de conservación</h2>
      <ul>
        <li>Datos de cuenta e historial: mientras mantengas tu cuenta activa.</li>
        <li>Datos de facturación: el plazo exigido por la normativa fiscal y mercantil (hasta 6 años).</li>
        <li>Al eliminar tu cuenta, borraremos o anonimizaremos tus datos salvo obligación legal de conservarlos.</li>
      </ul>

      <h2>5. Encargados del tratamiento y destinatarios</h2>
      <p>
        No vendemos tus datos. Para prestar el servicio usamos los siguientes proveedores, que
        actúan como encargados del tratamiento bajo contrato (DPA):
      </p>
      <div className="legal-table-wrap">
        <table className="legal-table">
          <thead>
            <tr><th>Proveedor</th><th>Servicio</th><th>Ubicación / garantías</th></tr>
          </thead>
          <tbody>
            <tr><td>Google (Firebase)</td><td>Autenticación y base de datos</td><td>Unión Europea (Madrid, europe-southwest1); para soporte o servicios auxiliares desde EE. UU., Data Privacy Framework y cláusulas contractuales tipo</td></tr>
            <tr><td>Google (Gemini API)</td><td>Generación de respuestas de IA</td><td>EE. UU.; Data Privacy Framework y cláusulas contractuales tipo</td></tr>
            <tr><td>Stripe</td><td>Pagos y suscripciones</td><td>Irlanda / EE. UU.; Data Privacy Framework</td></tr>
            <tr><td>Cloudinary</td><td>Alojamiento de imágenes y vídeos</td><td>EE. UU.; Data Privacy Framework / cláusulas contractuales tipo</td></tr>
            <tr><td>Vercel</td><td>Alojamiento web y funciones de servidor</td><td>EE. UU.; Data Privacy Framework</td></tr>
            <tr><td>Sentry (Functional Software Inc.)</td><td>Registro de errores técnicos</td><td>EE. UU.; Data Privacy Framework / cláusulas contractuales tipo</td></tr>
            <tr><td>Google (Analytics)</td><td>Analítica web, solo con tu consentimiento</td><td>EE. UU.; Data Privacy Framework</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        El contenido que envías a las herramientas de IA se transmite a la API de Google Gemini
        únicamente para generar la respuesta, y Google lo trata conforme a las condiciones de
        uso de la API de Gemini. Por eso te pedimos que no incluyas datos personales en él.
      </p>

      <h2>6. Tus derechos</h2>
      <p>Puedes ejercer en cualquier momento los derechos de:</p>
      <ul>
        <li><strong>Acceso</strong> a tus datos.</li>
        <li><strong>Rectificación</strong> de datos inexactos.</li>
        <li><strong>Supresión</strong> («derecho al olvido»).</li>
        <li><strong>Oposición</strong> y <strong>limitación</strong> del tratamiento.</li>
        <li><strong>Portabilidad</strong> de tus datos en un formato estructurado.</li>
        <li><strong>Retirar tu consentimiento</strong> (por ejemplo, el de cookies analíticas) sin que afecte a la licitud del tratamiento previo.</li>
      </ul>
      <p>
        Para ejercerlos, escribe a pacoalfair@hotmail.com indicando el derecho que
        quieres ejercer. Responderemos en el plazo máximo de un mes. Si consideras que no hemos
        atendido correctamente tu solicitud, puedes reclamar ante la Agencia Española de
        Protección de Datos (<a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">www.aepd.es</a>).
      </p>

      <h2>7. Menores de edad</h2>
      <p>
        Si tienes menos de 14 años, necesitas el consentimiento de tus padres o tutores para
        registrarte (art. 7 LOPDGDD).
      </p>

      <h2>8. Seguridad</h2>
      <p>
        Aplicamos medidas técnicas y organizativas para proteger tus datos: conexiones cifradas
        (HTTPS), contraseñas gestionadas por Firebase Authentication, reglas de acceso a la base
        de datos por usuario y verificación de los pagos en servidor.
      </p>
    </LegalLayout>
  );
}
