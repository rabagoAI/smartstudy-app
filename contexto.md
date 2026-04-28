# SmartStudIA — Contexto del Proyecto y Seguimiento de Mejoras

> Última actualización: 2026-04-28

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
- **Estado:** `[x]` completado (2026-04-28)
- **Archivos modificados:**
  - `api/gemini.js` — verificación de token + rate limiting con transacción Firestore
  - `src/components/ai-tools/EducationalChat.jsx` — envía `Authorization: Bearer <idToken>`
  - `src/components/ai-tools/AIToolsPage.jsx` — envía `Authorization: Bearer <idToken>`
  - `src/components/ai-tools/MindMapGenerator.jsx` — envía `Authorization: Bearer <idToken>`
  - `.env.example` — documentadas las variables `GEMINI_API_KEY` y `FIREBASE_SERVICE_ACCOUNT_KEY`
  - `package.json` — añadida dependencia `firebase-admin`
- **Solución implementada:**
  1. Los tres componentes obtienen el Firebase ID token con `currentUser.getIdToken()` y lo envían en el header `Authorization: Bearer <token>`.
  2. El proxy `api/gemini.js` verifica el token con Firebase Admin SDK (`getAuth().verifyIdToken()`). Si es inválido o falta, devuelve 401.
  3. Una vez verificado el UID, se ejecuta una transacción Firestore en `rate_limits/{uid}` que comprueba e incrementa atómicamente los contadores (5/min y 20/hour para usuarios free). Si se supera el límite, devuelve 429.
  4. Los tres componentes manejan el 429 con un mensaje claro al usuario.
  5. El hook `useRateLimit.js` se mantiene como indicador UX (muestra llamadas restantes), pero el enforcement real es ahora el servidor.
- **Acciones completadas (manuales, 2026-04-28):**
  - [x] `FIREBASE_SERVICE_ACCOUNT_KEY` generado desde Firebase Console y añadido como variable de entorno en Vercel. Redeploy completado sin errores.
  - [x] Firestore Security Rules actualizadas: eliminado `|| true` de `isAdmin()` (agujero crítico que daba permisos de admin a todos), añadida regla `rate_limits/{uid}` con `allow read, write: if false`.

---

#### SEC-05 — Source maps activados en producción
- **Estado:** `[x]` completado (2026-04-27)
- **Archivos:** `vite.config.js:20`
- **Solución:** `sourcemap: true` → `sourcemap: false`. Si se necesitan source maps para Sentry, usar `sourcemap: 'hidden'` y subir los mapas en el pipeline de CI.

---

#### SEC-06 — Emails de usuario enviados como etiquetas a Google Analytics (fuga de PII)
- **Estado:** `[x]` completado (2026-04-27)
- **Archivos:** `src/components/home/Landing.jsx:83,86`, `src/components/common/Header.jsx:60`
- **Solución:** Reemplazados `formData.email` y `currentUser?.email` por `user.uid` / `currentUser?.uid` en los tres `trackEvent` de auth.

---

#### SEC-07 — Inconsistencia en el campo de suscripción (posible escalada de privilegios)
- **Estado:** `[x]` completado (2026-04-27)
- **Archivos:** `src/context/AuthContext.jsx:158`, `src/components/subjects/SubjectDetailsPage.jsx:98`, `src/components/common/PayPalSubscription.jsx:62`
- **Solución:** Unificado a `subscription`. `PayPalSubscription` ahora escribe `subscription: 'premium'`. `SubjectDetailsPage` usa `isSubscribed` del contexto en lugar de leer `userData?.subscriptionStatus` directamente.
- **Acción pendiente (manual):**
  - [ ] Revisar reglas de seguridad de Firestore para que usuarios no puedan escribir `subscription: 'premium'` en su propio documento sin pasar por el webhook de PayPal.

---

### 🟡 MEDIAS — Planificar en las próximas semanas

#### SEC-08 — Enumeración de usuarios vía `fetchSignInMethodsForEmail`
- **Estado:** `[x]` completado (2026-04-27)
- **Archivos:** `src/components/home/Landing.jsx`
- **Solución:** Eliminados el import de `fetchSignInMethodsForEmail`, los estados `emailStatus`/`emailMessage` y el `useEffect` con debounce. El error `auth/email-already-in-use` de Firebase llega al `catch` de `handleSubmit` como cualquier otro error.
- **Acción pendiente (manual):**
  - [ ] Activar "Email Enumeration Protection" en Firebase Authentication Console → Authentication → Settings → User actions.

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
- **Estado:** `[x]` completado (2026-04-27)
- **Archivos:** `src/analytics.js:7`, `.env.example`
- **Solución:** `G-VKRN1MRKG4` movido a `VITE_APP_GA_MEASUREMENT_ID`. Si la variable no está definida, GA no se inicializa (fail-safe).
- **Acción pendiente (manual):**
  - [ ] Añadir `VITE_APP_GA_MEASUREMENT_ID=G-VKRN1MRKG4` en `.env.local` y en Vercel → Settings → Environment Variables.

---

### 🟢 BAJAS — Deuda técnica y buenas prácticas

#### BUG-01 — `ProfilePage` crashea con `.toDate()` en usuarios de `RegisterPage`
- **Estado:** `[x]` completado (2026-04-27)
- **Archivos:** `src/components/ProfilePage.jsx:27`
- **Solución:** `createdAt.toDate()` reemplazado por `typeof createdAt?.toDate === 'function' ? createdAt.toDate() : new Date(createdAt)`. Soporta tanto `Firestore.Timestamp` como string ISO.

---

#### BUG-02 — Lógica de creación de usuario duplicada e inconsistente
- **Estado:** `[x]` completado (2026-04-27)
- **Archivos:** `src/components/auth/RegisterPage.jsx`
- **Solución:** `RegisterPage` ahora usa `useAuth().signup()` en lugar de llamar a Firebase directamente. Todos los flujos de registro crean el documento con el mismo schema: `uid`, `email`, `name`, `createdAt`, `admin`, `subscription`.

---

#### BUG-03 — Ambos planes de suscripción usan el mismo `planId` de PayPal
- **Estado:** `[x]` completado (2026-04-27)
- **Archivos:** `src/components/common/SubscriptionModal.jsx`, `src/components/common/PayPalSubscription.jsx`
- **Solución:** `PayPalSubscription` acepta prop `planId`. `SubscriptionModal` pasa `VITE_APP_PAYPAL_PLAN_ID_MONTHLY` y `VITE_APP_PAYPAL_PLAN_ID_ANNUAL` respectivamente.
- **Acción pendiente (manual):**
  - [ ] Crear los dos planes en PayPal Developer Dashboard y añadir `VITE_APP_PAYPAL_PLAN_ID_MONTHLY` y `VITE_APP_PAYPAL_PLAN_ID_ANNUAL` en `.env.local` y en Vercel.

---

#### BUG-04 — `Math.random()` como key de React en mensajes del chat
- **Estado:** `[x]` completado (2026-04-27)
- **Archivos:** `src/components/ai-tools/EducationalChat.jsx:246`
- **Solución:** Eliminado el fallback `|| Math.random()`. Los mensajes de Firestore siempre tienen `id` estable.

---

#### BUG-05 — `PrivateRoute` duplicado con import roto
- **Estado:** `[ ]`
- **Archivos:** `src/components/common/PrivateRoute.jsx`
- **Problema:** Existe un segundo `PrivateRoute` no usado con un import incorrecto (`../../AuthContext` en lugar de `../../context/AuthContext`). Si se usara, crashearía en runtime.
- **Acción:** Eliminar el archivo duplicado.

---

#### PERF-01 — `dist/` commiteado en el repositorio
- **Estado:** `[x]` ya resuelto (verificado 2026-04-28)
- **Nota:** `dist/` nunca estuvo trackeado en ninguna rama. `.gitignore` ya tenía `/dist` correctamente. No requirió acción.

---

#### PERF-02 — PDF.js cargado desde CDN en cada mount del componente
- **Estado:** `[x]` completado (2026-04-28)
- **Archivos:** `src/components/ai-tools/AIToolsPage.jsx`
- **Solución:** Eliminado el `useEffect` que inyectaba un `<script>` desde CDN. Añadido `import * as pdfjsLib from 'pdfjs-dist'` a nivel de módulo. El `workerSrc` se configura una sola vez al cargar el módulo (CDN solo para el worker, que debe ser un archivo separado). Reemplazadas todas las referencias `window.pdfjsLib` por el módulo importado.

---

#### PERF-03 — Chat carga todos los mensajes y filtra en cliente
- **Estado:** `[ ]`
- **Archivos:** `src/components/ai-tools/EducationalChat.jsx:55-81`
- **Problema:** Comentario "FIX PROVISIONAL": se eliminó el `where` de la query Firestore para evitar crear un índice compuesto. Con el tiempo el usuario descargará cada vez más mensajes innecesarios.
- **Acción:** Crear el índice compuesto en Firebase Console y restaurar el filtro en la query.

---

#### UX-01 — `robots.txt` permite crawling de rutas privadas
- **Estado:** `[x]` completado (2026-04-27)
- **Archivos:** `public/robots.txt`
- **Solución:** Añadidos `Disallow: /admin/`, `Disallow: /perfil` y `Disallow: /historial-ia`.

---

## Resumen de Prioridades

| ID | Severidad | Título | Estado |
|----|-----------|--------|--------|
| SEC-01 | 🔴 CRÍTICA | Credenciales reales en `.env` | `[~]` en progreso |
| SEC-02 | 🔴 CRÍTICA | Ruta `/admin/upload` sin verificación de rol | `[x]` |
| SEC-03 | 🟠 ALTA | Claves de API en bundle del cliente | `[x]` |
| SEC-04 | 🟠 ALTA | Rate limiting solo en cliente | `[x]` |
| SEC-05 | 🟠 ALTA | Source maps en producción | `[x]` |
| SEC-06 | 🟠 ALTA | Emails de usuario enviados a GA4 (PII) | `[x]` |
| SEC-07 | 🟠 ALTA | Campo de suscripción inconsistente | `[x]` |
| SEC-08 | 🟡 MEDIA | Enumeración de usuarios en registro | `[x]` |
| SEC-09 | 🟡 MEDIA | Sin validación en uploads del admin | `[x]` |
| SEC-10 | 🟡 MEDIA | API handler de Next.js bundleado en cliente | `[x]` |
| SEC-11 | 🟡 MEDIA | GA4 Measurement ID hardcodeado | `[x]` |
| BUG-01 | 🟢 BAJA | Crash `.toDate()` en ProfilePage | `[x]` |
| BUG-02 | 🟢 BAJA | Creación de usuario duplicada e inconsistente | `[x]` |
| BUG-03 | 🟢 BAJA | Ambos planes PayPal usan el mismo planId | `[x]` |
| BUG-04 | 🟢 BAJA | `Math.random()` como key de React | `[x]` |
| BUG-05 | 🟢 BAJA | PrivateRoute duplicado con import roto | `[x]` |
| PERF-01 | 🟢 BAJA | `dist/` commiteado en git | `[x]` |
| PERF-02 | 🟢 BAJA | PDF.js cargado desde CDN en cada mount | `[x]` |
| PERF-03 | 🟢 BAJA | Chat filtra mensajes en cliente en lugar de en Firestore | `[ ]` |
| UX-01 | 🟢 BAJA | `robots.txt` expone rutas privadas | `[x]` |

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
| 2026-04-27 | SEC-05 | `sourcemap: true` → `sourcemap: false` en `vite.config.js` | Claude Code |
| 2026-04-27 | SEC-06 | Emails reemplazados por `uid` en los 3 `trackEvent` de auth (Landing + Header) | Claude Code |
| 2026-04-27 | SEC-07 | Campo unificado a `subscription`; `SubjectDetailsPage` usa `isSubscribed` del contexto | Claude Code |
| 2026-04-27 | SEC-08 | Eliminado `fetchSignInMethodsForEmail` en keystroke; error manejado en submit | Claude Code |
| 2026-04-27 | SEC-11 | GA4 Measurement ID movido a `VITE_APP_GA_MEASUREMENT_ID` en env | Claude Code |
| 2026-04-27 | BUG-01 | `createdAt.toDate()` protegido para soportar Timestamp e ISO string | Claude Code |
| 2026-04-27 | BUG-02 | `RegisterPage` migrado a usar `AuthContext.signup()` para schema unificado | Claude Code |
| 2026-04-27 | BUG-03 | `PayPalSubscription` acepta prop `planId`; modal pasa IDs monthly/annual separados | Claude Code |
| 2026-04-27 | BUG-04 | Eliminado `Math.random()` como key en lista de mensajes del chat | Claude Code |
| 2026-04-27 | UX-01 | `robots.txt` actualizado con Disallow para `/admin/`, `/perfil`, `/historial-ia` | Claude Code |
| 2026-04-28 | SEC-04 | Rate limiting real en servidor: Firebase Admin verifica token + transacción Firestore en `rate_limits/{uid}`; 3 componentes envían `Authorization: Bearer <idToken>` | Claude Code |
| 2026-04-28 | SEC-04 | `FIREBASE_SERVICE_ACCOUNT_KEY` añadido como variable de entorno en Vercel; redeploy completado | paco rabago |
| 2026-04-28 | REGLAS | Firestore Security Rules: eliminado `\|\| true` de `isAdmin()` (todos eran admin); añadida regla `rate_limits/{uid}` con `allow read, write: if false` | paco rabago |
| 2026-04-28 | DOCS | Creado `rama-github.md` con explicación del flujo de ramas, commits y PRs para el proyecto | Claude Code |
| 2026-04-28 | DOCS | Página SmartStudIA en Notion actualizada: tabla de seguridad ampliada (SEC-01…SEC-11) y sección de flujo de trabajo con GitHub | Claude Code |
| 2026-04-28 | PERF-01 | Verificado: `dist/` nunca estuvo trackeado; `.gitignore` ya tenía `/dist` — no requirió acción | Claude Code |
| 2026-04-28 | PERF-02 | PDF.js migrado de CDN dinámico a `import * as pdfjsLib from 'pdfjs-dist'`; eliminado `useEffect` de inyección de script | Claude Code |
