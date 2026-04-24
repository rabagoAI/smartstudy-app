# SmartStudIA — Contexto del Proyecto y Seguimiento de Mejoras

> Última actualización: 2026-04-24

---

## Stack Técnico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + Vite 7 (SPA) |
| Routing | React Router v7 |
| Auth / DB | Firebase 12 (Auth, Firestore, Storage) |
| IA | Google Gemini API (`@google/generative-ai`) |
| Pagos | PayPal (`@paypal/react-paypal-js`) |
| Uploads | Cloudinary (vía Axios) |
| Estado | TanStack React Query v5 |
| Monitoring | Sentry React v10 |
| Analytics | react-ga4 (Google Analytics 4) |
| PDF | pdfjs-dist (cargado desde CDN dinámicamente) |
| Diagramas | Mermaid v11 |
| Estilos | Tailwind CSS v3 + CSS custom |
| i18n | i18next + i18next-browser-languagedetector |
| Deploy | Vercel |

---

## Registro de Mejoras

Leyenda de estado: `[ ]` pendiente · `[~]` en progreso · `[x]` completado

---

### 🔴 CRÍTICAS — Deben resolverse antes de cualquier despliegue público

#### SEC-01 — Credenciales reales expuestas en `.env`
- **Estado:** `[~]` en progreso
- **Archivos:** `.env`, `.env.local`, `.env.production`
- **Problema:** Las claves reales de Firebase, Cloudinary (incluyendo el API Secret, que es una credencial de servidor), PayPal, Gemini y Grok están en texto plano en archivos de entorno.
- **Riesgo:** Si estos archivos llegan a un repositorio público (o ya lo han hecho), cualquier persona puede usar esas credenciales. El Cloudinary API Secret nunca debe existir en un proyecto frontend.

**Acciones completadas (2026-04-24):**
- [x] `VITE_APP_CLOUDINARY_API_KEY` y `VITE_APP_CLOUDINARY_API_SECRET` eliminados de `.env`. El `UploadForm.jsx` ya usaba `upload_preset: 'unsigned_pdfs'` (sin firmar) — esas variables no eran necesarias en ningún sitio del código.
- [x] `.env.production` añadido a `.gitignore` (antes solo estaba `.env.production.local`).
- [x] `.env.production` desindexado del git con `git rm --cached` — ya no será trackeado en futuros commits.

**⚠️ HALLAZGO CRÍTICO — Historial git comprometido:**
El comando `git log --all --full-history` confirmó que `.env`, `.env.local` y `.env.production` fueron commiteados en el pasado:
- Commit `151e5af` (Oct 22, 2025): primera migración a Vite
- Commit `e5bdf56` (Jan 23, 2026): "Cambios importantes hechos con Antigravity"
- Commit `1ed8f54` (Jan 23, 2026): "Mejoras recomendadas en Antigravity"

Esto significa que las claves estuvieron expuestas en el historial de git. Si el repositorio es o fue público, las claves deben considerarse comprometidas.

**Acciones pendientes — requieren intervención manual:**
- [ ] **URGENTE**: Rotar TODAS las claves en sus consolas respectivas:
  - **Firebase**: [console.firebase.google.com](https://console.firebase.google.com) → Project Settings → General → regenerar API Key (o restringirla por dominio/IP en Google Cloud Console)
  - **Cloudinary**: [cloudinary.com/console](https://cloudinary.com/console) → Settings → Security → regenerar API Secret
  - **PayPal**: [developer.paypal.com](https://developer.paypal.com) → My Apps → regenerar Client ID y Secret
  - **Google (Gemini)**: [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials → eliminar y recrear la API Key de Gemini
  - **xAI (Grok)**: [console.x.ai](https://console.x.ai) → API Keys → eliminar la clave actual y generar una nueva
- [ ] **Limpiar el historial de git** con BFG Repo Cleaner o `git filter-repo`:
  ```bash
  # Opción 1: BFG Repo Cleaner (más sencillo)
  # 1. Descargar bfg.jar desde https://rtyley.github.io/bfg-repo-cleaner/
  # 2. Crear archivo "passwords.txt" con las claves a eliminar (una por línea)
  # 3. Ejecutar:
  java -jar bfg.jar --replace-text passwords.txt
  git reflog expire --expire=now --all && git gc --prune=now --aggressive
  git push --force-with-lease

  # Opción 2: git filter-repo (requiere pip install git-filter-repo)
  git filter-repo --path .env --invert-paths
  git filter-repo --path .env.local --invert-paths
  git filter-repo --path .env.production --invert-paths
  git push --force-with-lease
  ```
  **IMPORTANTE**: Avisar a todos los colaboradores del repo que deben hacer `git clone` fresco tras la limpieza.
- [ ] Verificar si el repositorio fue público en algún momento. Si lo fue, asumir que las claves están comprometidas independientemente de la limpieza.
- [ ] Una vez rotadas las claves, actualizar los archivos `.env` locales con los nuevos valores.

---

#### SEC-02 — Ruta `/admin/upload` sin verificación de rol
- **Estado:** `[x]` completado (2026-04-24)
- **Archivos:** `src/App.jsx`, `src/components/admin/UploadForm.jsx`, `src/components/auth/AdminRoute.jsx` (nuevo)
- **Solución implementada:**
  1. Creado `src/components/auth/AdminRoute.jsx` — verifica `isAdmin` de `AuthContext`; redirige a `/` si no autenticado y a `/home` si no es admin.
  2. Ruta `/admin/upload` movida fuera de `<PrivateRoute>` y envuelta en `<AdminRoute>` en `App.jsx`.
  3. Barrera secundaria añadida en `UploadForm.jsx`: `if (!isAdmin) return <Navigate to="/home" />` para protección en profundidad.
  4. De paso resuelto SEC-09: añadida validación de tipo MIME y tamaño máximo (100 MB) en `handleFileChange`.
  5. De paso resuelto BUG-05: eliminado `src/components/common/PrivateRoute.jsx` (duplicado con import roto `../../AuthContext`).

---

### 🟠 ALTAS — Resolver en el siguiente sprint

#### SEC-03 — Claves de API embebidas en el bundle del cliente
- **Estado:** `[x]` completado (2026-04-24)
- **Archivos modificados:**
  - `api/gemini.js` (nuevo) — Vercel Function proxy
  - `src/components/ai-tools/EducationalChat.jsx`
  - `src/components/ai-tools/AIToolsPage.jsx`
  - `src/components/ai-tools/MindMapGenerator.jsx`
  - `vercel.json` — rewrite actualizado para no interceptar `/api/*`
  - `.env.local` — variable renombrada a `GEMINI_API_KEY` (sin prefijo `VITE_APP_`)
- **Solución implementada:**
  1. Creado `api/gemini.js` — Vercel Function que recibe `{ contents, model }` y llama a Gemini con la clave guardada como variable de entorno de servidor (`GEMINI_API_KEY`, sin prefijo `VITE_APP_`).
  2. Los 3 componentes ahora llaman a `/api/gemini` en lugar de `generativelanguage.googleapis.com` directamente. La clave nunca llega al bundle del cliente.
  3. `MindMapGenerator.jsx` migrado de usar el SDK `@google/generative-ai` a fetch directo al proxy.
  4. `vercel.json` rewrite cambiado a `/((?!api/).*)`  para que las rutas `/api/*` no sean interceptadas por el rewrite del SPA.
  5. De paso resuelto SEC-10: eliminado `src/pages/api/educational-chat.jsx` (archivo dead code de convención Next.js bundleado en el cliente).
- **Acción pendiente (manual):**
  - [ ] Rotar la clave Gemini (ver SEC-01) y añadir la nueva como variable de entorno en Vercel Dashboard → Project → Settings → Environment Variables con nombre `GEMINI_API_KEY`.
  - [ ] Para desarrollo local: usar `vercel dev` en lugar de `npm run dev` para que la función `/api/gemini` esté disponible. Instalar Vercel CLI si hace falta: `npm i -g vercel`.

---

#### SEC-04 — Rate limiting solo en cliente (bypasseable)
- **Estado:** `[ ]`
- **Archivos:** `src/hooks/useRateLimit.js`
- **Problema:** Los contadores de rate limiting se guardan en `localStorage`. Cualquier usuario puede borrarlos en DevTools y hacer llamadas ilimitadas a la API de Gemini (que además tiene la clave expuesta — ver SEC-03).
- **Acción:** Implementar rate limiting real en el proxy/serverless del punto SEC-03 (p.ej. con Redis o Upstash, o en Firestore con reglas de seguridad que limiten escrituras por tiempo).

---

#### SEC-05 — Source maps activados en producción
- **Estado:** `[ ]`
- **Archivos:** `vite.config.js:20`
- **Problema:** `sourcemap: true` en la build de producción genera 66 archivos `.map` que exponen el código fuente original completo a cualquier visitante. También duplica el tamaño del bundle.
- **Acción:**
  1. Cambiar a `sourcemap: false` para producción.
  2. Si se necesitan source maps para Sentry, usar `sourcemap: 'hidden'` y subir los mapas a Sentry en el pipeline de CI, sin servirlos públicamente.

---

#### SEC-06 — Emails de usuario enviados como etiquetas a Google Analytics (fuga de PII)
- **Estado:** `[ ]`
- **Archivos:** `src/components/home/Landing.jsx:83,86`, `src/components/common/Header.jsx:60`
- **Problema:** Los emails de los usuarios se envían como `label` en eventos de GA4. Esto viola los ToS de Google Analytics, el GDPR y la privacidad básica de los usuarios. Los emails quedan registrados en los dashboards de GA.
- **Acción:** Reemplazar el email por un identificador anónimo (p.ej. el `uid` hasheado, o simplemente omitir el label).

---

#### SEC-07 — Inconsistencia en el campo de suscripción (posible escalada de privilegios)
- **Estado:** `[ ]`
- **Archivos:** `src/context/AuthContext.jsx:158`, `src/components/subjects/SubjectDetailsPage.jsx:98`, `src/components/common/PayPalSubscription.jsx:62`
- **Problema:** `AuthContext` comprueba `userData?.subscription === 'premium'` pero `PayPalSubscription` escribe `subscriptionStatus`. Dos nombres de campo distintos para la misma propiedad. Resultado: tras un pago exitoso, `isSubscribed` en `AuthContext` sigue siendo `false`.
- **Acción:**
  1. Unificar el campo a un único nombre (p.ej. `subscriptionStatus`) en todo el proyecto.
  2. Revisar las reglas de seguridad de Firestore para que los usuarios no puedan escribir `subscriptionStatus: 'premium'` en su propio documento sin pasar por el webhook de PayPal.

---

### 🟡 MEDIAS — Planificar en las próximas semanas

#### SEC-08 — Enumeración de usuarios vía `fetchSignInMethodsForEmail`
- **Estado:** `[ ]`
- **Archivos:** `src/components/home/Landing.jsx:46`
- **Problema:** La llamada se ejecuta en cada keystroke del campo email durante el registro. Permite a cualquier visitante anónimo saber qué emails están registrados en el servicio.
- **Acción:**
  1. Eliminar la llamada o moverla solo al submit del formulario.
  2. Activar "Email Enumeration Protection" en Firebase Authentication Console (Authentication → Settings → User actions).

---

#### SEC-09 — Sin validación de tipo/tamaño en uploads del admin
- **Estado:** `[ ]`
- **Archivos:** `src/components/admin/UploadForm.jsx:41-55`
- **Problema:** No se valida el tipo MIME ni el tamaño del archivo antes de subir a Cloudinary. El tipo MIME del navegador es controlado por el usuario.
- **Acción:** Añadir validación de extensión y tamaño máximo en el handler `handleFileChange`. Configurar también restricciones en el upload preset de Cloudinary.

---

#### SEC-10 — Archivo API handler de Next.js bundleado en el cliente
- **Estado:** `[ ]`
- **Archivos:** `src/pages/api/educational-chat.jsx`
- **Problema:** Este archivo usa la convención de Next.js (`handler(req, res)`) pero la app es un SPA de Vite sin servidor. El archivo se compila en el bundle del cliente como código muerto, exponiendo la lógica interna y el system prompt.
- **Acción:** Eliminar el archivo o moverlo a una Vercel Function real fuera de `src/`.

---

#### SEC-11 — Measurement ID de GA4 hardcodeado en el código fuente
- **Estado:** `[ ]`
- **Archivos:** `src/analytics.js:7`
- **Problema:** `G-VKRN1MRKG4` está hardcodeado directamente, no cargado desde una variable de entorno.
- **Acción:** Moverlo a `VITE_APP_GA_MEASUREMENT_ID` en `.env`.

---

### 🟢 BAJAS — Deuda técnica y buenas prácticas

#### BUG-01 — `ProfilePage` crashea con `.toDate()` en usuarios de `RegisterPage`
- **Estado:** `[ ]`
- **Archivos:** `src/components/ProfilePage.jsx:27`
- **Problema:** Los usuarios registrados por `RegisterPage.jsx` tienen `createdAt` como `Date` nativo o string ISO, no como `Firestore.Timestamp`. Llamar `.toDate()` sobre ellos lanza `TypeError`.
- **Acción:** Añadir una comprobación: `typeof createdAt.toDate === 'function' ? createdAt.toDate() : new Date(createdAt)`.

---

#### BUG-02 — Lógica de creación de usuario duplicada e inconsistente
- **Estado:** `[ ]`
- **Archivos:** `src/context/AuthContext.jsx`, `src/components/auth/RegisterPage.jsx`, `src/components/common/PayPalSubscription.jsx`
- **Problema:** El documento de usuario en Firestore se crea con esquemas distintos según el flujo de registro (3 rutas distintas con campos distintos).
- **Acción:** Centralizar la creación del documento de usuario en `AuthContext.signup()` y que todos los flujos pasen por ahí.

---

#### BUG-03 — Ambos planes de suscripción usan el mismo `planId` de PayPal
- **Estado:** `[ ]`
- **Archivos:** `src/components/common/SubscriptionModal.jsx:37-53`
- **Problema:** Las tarjetas "Mensual" y "Anual" no distinguen el `planId`. Ambas usan `VITE_APP_PAYPAL_PLAN_ID`.
- **Acción:** Crear dos planes en PayPal y añadir `VITE_APP_PAYPAL_PLAN_ID_MONTHLY` y `VITE_APP_PAYPAL_PLAN_ID_ANNUAL`.

---

#### BUG-04 — `Math.random()` como key de React en mensajes del chat
- **Estado:** `[ ]`
- **Archivos:** `src/components/ai-tools/EducationalChat.jsx:252`
- **Problema:** Genera claves únicas en cada render, destruyendo la reconciliación de React.
- **Acción:** Asignar un `id` estable (p.ej. timestamp + índice) al crear el mensaje.

---

#### BUG-05 — `PrivateRoute` duplicado con import roto
- **Estado:** `[ ]`
- **Archivos:** `src/components/common/PrivateRoute.jsx`
- **Problema:** Existe un segundo `PrivateRoute` no usado con un import incorrecto (`../../AuthContext` en lugar de `../../context/AuthContext`). Si se usara, crashearía en runtime.
- **Acción:** Eliminar el archivo duplicado.

---

#### PERF-01 — `dist/` commiteado en el repositorio
- **Estado:** `[ ]`
- **Archivos:** `.gitignore`, directorio `dist/`
- **Problema:** El build compilado está trackeado en git, inflando el repo y generando conflictos en los artifacts.
- **Acción:** `git rm -r --cached dist/` y confirmar que `dist` está en `.gitignore`.

---

#### PERF-02 — PDF.js cargado desde CDN en cada mount del componente
- **Estado:** `[ ]`
- **Archivos:** `src/components/ai-tools/AIToolsPage.jsx:97-112`
- **Problema:** Se inyecta un `<script>` desde CDN en cada mount si no está ya cargado. `pdfjs-dist` ya está en `package.json`.
- **Acción:** Importar directamente desde el paquete npm instalado.

---

#### PERF-03 — Chat carga todos los mensajes y filtra en cliente
- **Estado:** `[ ]`
- **Archivos:** `src/components/ai-tools/EducationalChat.jsx:55-81`
- **Problema:** Comentario "FIX PROVISIONAL": se eliminó el `where` de la query Firestore para evitar crear un índice compuesto. Con el tiempo el usuario descargará cada vez más mensajes innecesarios.
- **Acción:** Crear el índice compuesto en Firebase Console y restaurar el filtro en la query.

---

#### UX-01 — `robots.txt` permite crawling de rutas privadas
- **Estado:** `[ ]`
- **Archivos:** `public/robots.txt`
- **Problema:** `Disallow:` vacío permite indexar `/admin/upload`, `/perfil`, `/historial-ia`.
- **Acción:** Añadir `Disallow: /admin/` y `Disallow: /perfil` y `Disallow: /historial-ia`.

---

## Resumen de Prioridades

| ID | Severidad | Título | Estado |
|----|-----------|--------|--------|
| SEC-01 | 🔴 CRÍTICA | Credenciales reales en `.env` | `[~]` en progreso |
| SEC-02 | 🔴 CRÍTICA | Ruta `/admin/upload` sin verificación de rol | `[x]` |
| SEC-03 | 🟠 ALTA | Claves de API en bundle del cliente | `[x]` |
| SEC-04 | 🟠 ALTA | Rate limiting solo en cliente | `[ ]` |
| SEC-05 | 🟠 ALTA | Source maps en producción | `[ ]` |
| SEC-06 | 🟠 ALTA | Emails de usuario enviados a GA4 (PII) | `[ ]` |
| SEC-07 | 🟠 ALTA | Campo de suscripción inconsistente | `[ ]` |
| SEC-08 | 🟡 MEDIA | Enumeración de usuarios en registro | `[ ]` |
| SEC-09 | 🟡 MEDIA | Sin validación en uploads del admin | `[x]` |
| SEC-10 | 🟡 MEDIA | API handler de Next.js bundleado en cliente | `[x]` |
| SEC-11 | 🟡 MEDIA | GA4 Measurement ID hardcodeado | `[ ]` |
| BUG-01 | 🟢 BAJA | Crash `.toDate()` en ProfilePage | `[ ]` |
| BUG-02 | 🟢 BAJA | Creación de usuario duplicada e inconsistente | `[ ]` |
| BUG-03 | 🟢 BAJA | Ambos planes PayPal usan el mismo planId | `[ ]` |
| BUG-04 | 🟢 BAJA | `Math.random()` como key de React | `[ ]` |
| BUG-05 | 🟢 BAJA | PrivateRoute duplicado con import roto | `[x]` |
| PERF-01 | 🟢 BAJA | `dist/` commiteado en git | `[ ]` |
| PERF-02 | 🟢 BAJA | PDF.js cargado desde CDN en cada mount | `[ ]` |
| PERF-03 | 🟢 BAJA | Chat filtra mensajes en cliente en lugar de en Firestore | `[ ]` |
| UX-01 | 🟢 BAJA | `robots.txt` expone rutas privadas | `[ ]` |

---

## Historial de Cambios

| Fecha | ID | Descripción | Autor |
|-------|----|-------------|-------|
| 2026-04-24 | — | Análisis inicial y creación de este documento | Claude Code |
| 2026-04-24 | SEC-01 | Eliminados `VITE_APP_CLOUDINARY_API_KEY` y `VITE_APP_CLOUDINARY_API_SECRET` de `.env` (no se usaban; upload usa preset sin firmar) | Claude Code |
| 2026-04-24 | SEC-01 | Añadido `.env.production` a `.gitignore`; desindexado con `git rm --cached` | Claude Code |
| 2026-04-24 | SEC-02 | Creado `AdminRoute.jsx`; ruta `/admin/upload` protegida con doble barrera (ruta + componente) | Claude Code |
| 2026-04-24 | SEC-09 | Validación de tipo MIME y tamaño máximo (100 MB) añadida en `UploadForm.handleFileChange` | Claude Code |
| 2026-04-24 | BUG-05 | Eliminado `components/common/PrivateRoute.jsx` (duplicado con import roto) | Claude Code |
| 2026-04-24 | SEC-03 | Creado `api/gemini.js` proxy; 3 componentes migrados a `/api/gemini`; clave movida a var servidor | Claude Code |
| 2026-04-24 | SEC-10 | Eliminado `src/pages/api/educational-chat.jsx` (dead code Next.js bundleado en cliente) | Claude Code |
