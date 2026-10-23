// src/components/legal/AvisoLegal.jsx
// Aviso Legal (art. 10 LSSI-CE). PLANTILLA: completar los huecos marcados
// con <Todo> y hacer revisar por un profesional antes de publicar.

import React from 'react';
import LegalLayout from './LegalLayout';

const Todo = ({ children }) => <span className="legal-todo">[COMPLETAR: {children}]</span>;

export default function AvisoLegal() {
  return (
    <LegalLayout title="Aviso Legal" updatedAt="23 de octubre de 2026">
      <h2>1. Datos identificativos del titular</h2>
      <p>
        En cumplimiento del artículo 10 de la Ley 34/2002, de Servicios de la Sociedad de la
        Información y de Comercio Electrónico (LSSI-CE), se informa de los datos del titular de
        este sitio web:
      </p>
      <ul>
        <li><strong>Titular:</strong> <Todo>nombre y apellidos o razón social</Todo></li>
        <li><strong>NIF/DNI:</strong> <Todo>NIF</Todo></li>
        <li><strong>Domicilio:</strong> <Todo>dirección postal completa</Todo></li>
        <li><strong>Email de contacto:</strong> <Todo>email de contacto</Todo></li>
        <li>
          <strong>Datos registrales (solo sociedades):</strong>{' '}
          <Todo>Registro Mercantil, tomo, folio, hoja — o eliminar esta línea si eres autónomo</Todo>
        </li>
        <li><strong>Sitio web:</strong> https://www.smartstudia.com</li>
      </ul>

      <h2>2. Objeto</h2>
      <p>
        SmartStudia es una plataforma educativa online que ofrece contenidos de estudio
        (resúmenes, vídeos y exámenes resueltos) y herramientas basadas en inteligencia
        artificial (chat educativo, tarjetas, exámenes y mapas mentales), con una modalidad
        gratuita y una suscripción Premium de pago.
      </p>

      <h2>3. Condiciones de uso</h2>
      <p>
        El acceso al sitio web atribuye la condición de usuario e implica la aceptación de este
        Aviso Legal. El usuario se compromete a hacer un uso adecuado de los contenidos y
        servicios y, en particular, a no:
      </p>
      <ul>
        <li>Utilizar la plataforma con fines ilícitos o contrarios a la buena fe.</li>
        <li>
          Subir o introducir en las herramientas de IA datos personales de terceros (por
          ejemplo, nombres, notas o datos de contacto de compañeros o profesores) ni datos
          especialmente protegidos (salud, ideología, etc.) sin una base legal para ello.
        </li>
        <li>Subir contenidos que vulneren derechos de propiedad intelectual de terceros.</li>
        <li>Intentar acceder a áreas restringidas o a cuentas de otros usuarios.</li>
      </ul>

      <h2>4. Contenido generado por inteligencia artificial</h2>
      <p>
        Las respuestas de las herramientas de IA se generan automáticamente y pueden contener
        errores o imprecisiones. Son un apoyo al estudio y no sustituyen al material oficial ni
        al criterio del profesorado.
      </p>

      <h2>5. Propiedad intelectual e industrial</h2>
      <p>
        Los contenidos propios del sitio (textos, diseño, logotipos, vídeos y código) son
        titularidad de SmartStudia o de sus licenciantes. Queda prohibida su reproducción,
        distribución o transformación sin autorización, salvo para uso personal de estudio.
      </p>

      <h2>6. Responsabilidad</h2>
      <p>
        El titular no se responsabiliza de los daños derivados de interrupciones del servicio
        por causas ajenas, ni de los contenidos de sitios web de terceros enlazados.
      </p>

      <h2>7. Menores de edad</h2>
      <p>
        Para registrarse, el usuario debe tener al menos 14 años (art. 7 LOPDGDD). Los menores
        de 14 años solo podrán usar la plataforma con el consentimiento de sus padres o tutores
        legales. <Todo>revisar con un profesional el tratamiento de menores y la contratación de Premium por menores</Todo>
      </p>

      <h2>8. Legislación aplicable y jurisdicción</h2>
      <p>
        Este Aviso Legal se rige por la legislación española. Para cualquier controversia, las
        partes se someten a los juzgados y tribunales que correspondan conforme a la normativa
        de consumidores y usuarios.
      </p>
    </LegalLayout>
  );
}
