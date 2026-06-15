# SmartStudIA — Contexto del Proyecto y Seguimiento de Mejoras

> Última actualización: 2026-06-12

---

## Stack Técnico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + Vite 7 (SPA) |
| Routing | React Router v7 |
| Auth / DB | Firebase 12 (Auth, Firestore, Storage) |
| IA | Google Gemini API (`@google/generative-ai`) |
| Pagos | Stripe (`stripe`) — modo test activo |
| Uploads | Cloudinary (vía Axios) |
| Estado | TanStack React Query v5 |
| Monitoring | Sentry React v10 |
| Analytics | react-ga4 (Google Analytics 4) |
| PDF | pdfjs-dist (cargado desde CDN dinámicamente) |
| Generación contenido | Python 3 + pymupdf + Anthropic SDK (`anthropic`) |
| Firebase CLI | `firebase-tools` — deploy de rules e indexes |
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

### 💳 PAGOS — Stripe (migrado desde PayPal, mayo 2025)

#### PAY-01 — Migración de PayPal a Stripe
- **Estado:** `[x]` completado (2026-05-25)
- **Archivos nuevos:** `api/create-checkout-session.ts`, `api/create-portal-session.ts`, `api/webhook.ts`, `src/hooks/useSubscription.ts`, `src/hooks/useAiUsage.ts`, `src/components/SubscribeButton.tsx`, `src/components/ManageSubscriptionButton.tsx`, `src/components/PlanBadge.tsx`, `src/components/Paywall.tsx`
- **Archivos eliminados:** `src/components/common/PayPalSubscription.jsx`, `src/components/common/SubscriptionModal.jsx`, `src/components/common/SubscriptionModal.css`
- **Cambios clave:**
  - El estado premium se escribe **solo desde el webhook** de Stripe — nunca desde el cliente
  - Campo `premium: boolean` en Firestore (antes `subscription: 'premium'`)
  - Campo `plan: 'free' | 'basic'` en Firestore
  - Trial de 14 días sin tarjeta al suscribirse al Plan Básico
  - Límites de IA leídos desde Firestore por el servidor (`api/gemini.js`)
  - Customer Portal de Stripe para gestión de suscripción (cancelar, cambiar tarjeta, facturas)

#### PAY-02 — Activar cuenta Stripe en modo Live
- **Estado:** `[ ]` pendiente
- **Descripción:** Actualmente toda la integración funciona en **modo test** (`sk_test_...`). Los cobros son simulados.
- **Acciones necesarias (manual):**
  1. Completar el onboarding en [Stripe Dashboard](https://dashboard.stripe.com) → activar cuenta (datos bancarios, negocio, etc.)
  2. En Vercel → smartstudy-app → Settings → Environment Variables, reemplazar las 4 variables por sus versiones **live**:
     - `STRIPE_SECRET_KEY` → `sk_live_...`
     - `VITE_STRIPE_PUBLIC_KEY` → `pk_live_...`
     - `STRIPE_BASIC_PRICE_ID` → el `price_...` del producto en modo live
     - `STRIPE_WEBHOOK_SECRET` → registrar nuevo endpoint en Stripe Dashboard (live) → `whsec_...`
  3. Endpoint del webhook live: `https://www.smartstudia.com/api/webhook`
  4. Eventos a suscribir: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
  5. Hacer redeploy en Vercel para que coja las nuevas variables

#### PAY-03 — Añadir Plan Anual
- **Estado:** `[ ]` pendiente
- **Descripción:** Solo existe Plan Básico mensual (4,99€/mes). Falta crear el plan anual con descuento.
- **Acciones necesarias:**
  1. Crear nuevo precio en Stripe Dashboard → producto "SmartStudIA Básico" → Add pricing → Recurring, anual, precio a decidir
  2. Añadir variable en Vercel: `STRIPE_ANNUAL_PRICE_ID=price_...`
  3. En `api/create-checkout-session.ts`, añadir el case:
     ```ts
     const priceId =
       planId === 'basic'  ? process.env.STRIPE_BASIC_PRICE_ID :
       planId === 'annual' ? process.env.STRIPE_ANNUAL_PRICE_ID :
       null;
     ```
  4. Decidir si el plan anual tiene trial de 14 días o no
  5. Añadir `<SubscribeButton planId="annual" label="Plan Anual" />` en la página de precios
  6. Actualizar `<Paywall>` para mostrar ambas opciones

---

### 📚 CONTENIDO — Pipeline de generación educativa

#### CONT-01 — Script Python de generación de temas
- **Estado:** `[x]` completado (2026-05-25)
- **Archivos:** `generar_tema.py`, `requirements.txt`, `README_generador.md`, `scripts/.gitkeep`
- **Descripción:** Script CLI que extrae texto de un PDF con pymupdf y llama a Claude Haiku 4.5 para generar JSON estructurado (resumen, cuestionario de 10 preguntas, 10-15 tarjetas, guión de vídeo). Guarda el documento en Firestore con `publicado: false`.
- **Estructura Firestore:** `contenido/{curso}/asignaturas/{asignatura}/temas/{numero_tema}`
- **Uso:**
  ```bash
  python generar_tema.py \
    --pdf "pdfs/1ESO/matematicas/tema3.pdf" \
    --pagina_inicio 12 --pagina_fin 28 \
    --curso "1ESO" --asignatura "Matematicas" \
    --tema "Números enteros" --numero_tema 3
  ```
- **Flags opcionales:** `--no-firestore` (solo genera JSON), `--output archivo.json`
- **Modelo:** `claude-haiku-4-5` con prompt caching en el system prompt
- **Muestra:** tokens usados (input/output/cache) y coste estimado en €
- **Variables necesarias en `.env` local:**
  - `ANTHROPIC_API_KEY` — clave de Anthropic Console
  - `FIREBASE_CREDENTIALS_PATH=scripts/serviceAccountKey.json` — JSON de Firebase Admin SDK (en `.gitignore`)
  - `FIREBASE_PROJECT_ID` — igual que `VITE_APP_FIREBASE_PROJECT_ID`

#### CONT-02 — Frontend de contenido educativo (React)
- **Estado:** `[x]` completado (2026-05-25)
- **Archivos nuevos:**
  - `src/hooks/useTema.ts` — lee `contenido/{curso}/asignaturas/{asig}/temas/{n}`; controla acceso free/premium
  - `src/components/contenido/AsignaturasHome.tsx` — selector de curso (tabs) + tarjetas de asignaturas con badge "Solo Tema 1" para usuarios free
  - `src/components/contenido/ListaTemas.tsx` — lista temas publicados; Tema 1 libre, resto con Paywall inline
  - `src/components/contenido/VistaTema.tsx` — 4 tabs: Resumen · Cuestionario (con puntuación) · Tarjetas (flip 3D CSS) · Vídeo/Guión
  - `src/components/admin/PublicarTemas.tsx` — panel `/admin/publicar`; queries directas por ruta (curso × asignatura) en paralelo con `Promise.all`; botón "Publicar" por tema
- **Archivos modificados:**
  - `src/App.jsx` — rutas: `/contenido`, `/contenido/:curso/:asignatura`, `/contenido/:curso/:asignatura/:numeroTema`, `/admin/publicar`
  - `src/components/common/Header.jsx` — enlace "📚 Contenido" en desktop y móvil
- **Reglas de acceso:**
  - Plan free: solo Tema 1 de cada asignatura
  - Plan básico: todos los temas
  - El bloqueo se aplica tanto en `useTema.ts` (no fetch) como en `ListaTemas` (Paywall)

#### CONT-03 — Firestore rules e indexes para contenido
- **Estado:** `[x]` completado (2026-05-25)
- **Archivos:** `firestore.rules`, `firestore.indexes.json`, `firebase.json`, `.firebaserc`
- **Reglas destacadas:**
  - Solo el Admin SDK puede escribir temas (no el cliente)
  - Usuarios solo leen temas con `publicado: true` (o admins ven todos)
  - El campo `premium` y otros de Stripe solo los puede actualizar el webhook (bloqueados en regla de `users/{uid}`)
- **Índices añadidos:**
  - `temas` (COLLECTION): `publicado ASC + numero_tema ASC` — para `ListaTemas`
  - `temas` (COLLECTION_GROUP): `publicado ASC + numero_tema ASC` — para `PublicarTemas`
- **Deploy completado:** `firebase deploy --only firestore` ejecutado por el usuario (2026-05-25)
- **Fixes posteriores (2026-05-26):**
  - `isAdmin()` en Firestore rules actualizado para comprobar primero `request.auth.token.admin == true` (custom claim, funciona con collection group) y como fallback el campo `admin` en Firestore
  - `PublicarTemas.tsx` migrado de `collectionGroup` a queries directas por ruta — evita el bug de `get()` en reglas con collection group queries
  - `src/context/AuthContext.jsx`: corregida condición de carrera — `setLoading(false)` movido al interior del primer `onSnapshot` para que `isAdmin` no se evalúe antes de que llegue `userData`
  - `scripts/set_admin_claim.py` creado — establece custom claim `admin: true` en Firebase Auth via Admin SDK
- **Acción pendiente:**
  - [x] `serviceAccountKey.json` descargado y colocado en `scripts/` — completado 2026-05-26
  - [ ] Ejecutar `python scripts/set_admin_claim.py --email pacoalfair@hotmail.com` para establecer el custom claim admin (opcional, el panel ya funciona sin él)

#### CONT-04 — Generación de contenido 1ºESO Matemáticas
- **Estado:** `[x]` completado (2026-05-26)
- **Descripción:** 13 temas generados con `generar_tema.py` desde el PDF de Matemáticas LOMLOE Marea Verde (316 páginas). Subidos a Firestore con `publicado: false`. Tema 1 publicado y verificado en la app. Vídeo del Tema 1 creado con NotebookLM + subido a YouTube (`https://youtu.be/Trgl-DettEw`) y enlazado vía campo `video_url` en Firestore.
- **Batch script:** `generar_1ESO_matematicas.bat` — genera los 13 temas de golpe
- **Helper:** `helper_toc.py` — detecta los capítulos y rangos de páginas de cualquier PDF
- **Rangos de páginas 1ºESO Matemáticas:**

| Tema | Título | Páginas |
|------|--------|---------|
| 1 | Resolución de problemas | 5–21 |
| 2 | Números naturales. Divisibilidad | 22–52 |
| 3 | Potencias y raíces | 53–68 |
| 4 | Números enteros | 69–86 |
| 5 | Fracciones | 87–113 |
| 6 | Números decimales | 114–143 |
| 7 | Sistemas de medida | 144–166 |
| 8 | Figuras planas | 167–201 |
| 9 | Longitudes y áreas | 202–222 |
| 10 | Magnitudes proporcionales. Porcentajes | 223–246 |
| 11 | Álgebra | 247–265 |
| 12 | Tablas y gráficas. El plano | 266–296 |
| 13 | Estadística y probabilidad | 297–316 |

- **Pendiente:** publicar Temas 2–13 cuando se generen sus vídeos en NotebookLM

#### CONT-05 — Generación de contenido 1ºESO Lengua Española
- **Estado:** `[x]` completado (2026-05-28)
- **Script:** `generar_1ESO_lengua.bat`
- **Unidades generadas:** 9 · Tema 1 publicado
- **Rangos de páginas (PDF único, 151 págs.):**

| Unidad | Título | Páginas |
|--------|--------|---------|
| 1 | Comunicación no verbal y textos normativos | 3–16 |
| 2 | Textos descriptivos y narrativos | 17–28 |
| 3 | Textos formales y dialogados | 29–40 |
| 4 | El género lírico | 41–58 |
| 5 | El género narrativo | 59–74 |
| 6 | El género teatral | 75–90 |
| 7 | Las palabras variables | 91–108 |
| 8 | El verbo y las palabras invariables | 109–119 |
| 9 | Ortografía y comunicación | 120–151 |

#### CONT-06 — Generación de contenido 1ºESO Biología y Geología
- **Estado:** `[x]` completado (2026-05-28)
- **Script:** `generar_1ESO_biologia.py` (Python en vez de .bat — la ruta `1ºESO` tiene `º` que cmd.exe no maneja)
- **Temas generados:** 10 · Tema 1 publicado
- **PDFs individuales por tema** en `C:\Users\Paco\Desktop\pdf\1ºESO\Ciencias Naturales\`

| Tema | Título | Archivo |
|------|--------|---------|
| 1 | El Universo | 1_Tema_01_Universo.pdf |
| 2 | La materia | 1_Tema_02_La_materia.pdf |
| 3 | La atmósfera | 1_Tema_03_La_atmosfera.pdf |
| 4 | La hidrosfera | 1_Tema_04_La_hidrosfera.pdf |
| 5 | La geosfera | 1_Tema_05_La_geosfera.pdf |
| 6 | Los seres vivos. Diversidad | 1_Tema_06_Los_SSVV_diversidad.pdf |
| 7 | Clasificación de los seres vivos | 1_Tema_07_Clasificacion_SSVV.pdf |
| 8 | El reino de las plantas | 1_Tema_08_Reino_plantas.pdf |
| 9 | Los invertebrados | 1_Tema_09_Invertebrados.pdf |
| 10 | Los vertebrados | 1_Tema_10_Vertebrados.pdf |

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
- **Estado:** `[x]` completado (2026-04-29)
- **Archivos:** `src/components/ai-tools/EducationalChat.jsx:55-68`, `firestore.indexes.json` (nuevo)
- **Solución:** Restaurado `where('sessionId', '==', sessionIdRef.current)` en la query. Eliminado el filtro en cliente. Creado `firestore.indexes.json` con el índice compuesto `sessionId ASC + createdAt ASC` para la subcolección `educational_chat`.
- **Acción pendiente (manual):**
  - [ ] Desplegar el índice: `firebase deploy --only firestore:indexes` (requiere Firebase CLI y proyecto configurado). Alternativa: crear el índice manualmente en Firebase Console → Firestore → Indexes → Composite → Add Index con los campos `sessionId (ASC)` y `createdAt (ASC)` en la colección `educational_chat`.

---

#### UX-01 — `robots.txt` permite crawling de rutas privadas
- **Estado:** `[x]` completado (2026-04-27)
- **Archivos:** `public/robots.txt`
- **Solución:** Añadidos `Disallow: /admin/`, `Disallow: /perfil` y `Disallow: /historial-ia`.

---

## Resumen de Prioridades

| ID | Severidad | Título | Estado |
|----|-----------|--------|--------|
| PAY-02 | 💳 PAGO | Activar cuenta Stripe en modo Live | `[ ]` pendiente |
| PAY-03 | 💳 PAGO | Añadir Plan Anual | `[ ]` pendiente |
| CONT-01 | 📚 CONTENIDO | Script Python `generar_tema.py` | `[x]` |
| CONT-02 | 📚 CONTENIDO | Frontend React sección Contenido | `[x]` |
| CONT-03 | 📚 CONTENIDO | Firestore rules + indexes + Firebase CLI | `[x]` |
| CONT-04 | 📚 CONTENIDO | Generación 1ºESO Matemáticas (13 temas) | `[x]` |
| CONT-05 | 📚 CONTENIDO | Generación 1ºESO Lengua Española (9 unidades) | `[x]` |
| CONT-06 | 📚 CONTENIDO | Generación 1ºESO Biología y Geología (10 temas) | `[x]` |
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
| PERF-03 | 🟢 BAJA | Chat filtra mensajes en cliente en lugar de en Firestore | `[x]` |
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
| 2026-04-29 | PERF-03 | Restaurado `where('sessionId', ...)` en query Firestore; eliminado filtro en cliente; creado `firestore.indexes.json` con índice compuesto | Claude Code |
| 2026-05-25 | PAY-01 | Migración completa de PayPal a Stripe: 3 API routes, 2 hooks, 4 componentes React, webhook con verificación de firma. Eliminados PayPalSubscription, SubscriptionModal y @paypal/react-paypal-js | Claude Code |
| 2026-05-25 | PAY-01 | Variables Stripe añadidas en Vercel; webhook registrado en Stripe Dashboard; prueba de pago completada con éxito en modo test | paco rabago |
| 2026-05-25 | CONT-01 | Script `generar_tema.py` con pymupdf + Claude Haiku 4.5 + prompt caching; guarda en Firestore con `publicado: false`; muestra tokens y coste en € | Claude Code |
| 2026-05-25 | CONT-02 | Frontend React: `AsignaturasHome`, `ListaTemas`, `VistaTema` (4 tabs + flip 3D), `PublicarTemas`; rutas y enlace en Header | Claude Code |
| 2026-05-25 | CONT-03 | `firestore.rules` completas, 2 índices para `temas`, `firebase.json` + `.firebaserc`; deploy ejecutado con Firebase CLI | paco rabago |
| 2026-05-26 | CONT-04 | `generar_1ESO_matematicas.bat` ejecutado: 13 temas de Matemáticas 1ºESO generados con Claude Haiku 4.5 y subidos a Firestore | paco rabago |
| 2026-05-26 | CONT-04 | Tema 1 publicado desde `/admin/publicar`; vídeo Tema 1 creado con NotebookLM y enlazado en Firestore (`video_url`) | paco rabago |
| 2026-05-26 | CONT-03 | `isAdmin()` en Firestore rules actualizado para usar `request.auth.token.admin` (custom claim) como check primario | Claude Code |
| 2026-05-26 | CONT-02 | `PublicarTemas.tsx`: migrado de `collectionGroup` a queries directas por ruta para evitar bug de permisos | Claude Code |
| 2026-05-26 | AUTH | `AuthContext.jsx`: corregida condición de carrera en `setLoading(false)` — ahora espera el primer snapshot de Firestore | Claude Code |
| 2026-05-26 | INFRA | `scripts/serviceAccountKey.json` añadido; `scripts/set_admin_claim.py` creado; `.env` actualizado con variables Python | Claude Code |
| 2026-05-28 | CONT-05 | 9 unidades de Lengua Española 1ºESO generadas y Unidad 1 publicada | paco rabago |
| 2026-05-28 | CONT-06 | 10 temas de Biología y Geología 1ºESO generados y Tema 1 publicado (PDFs por capítulo, script Python por problema con `º` en ruta) | paco rabago |
| 2026-06-12 | SEC-12 | Escalada de privilegios cerrada en `firestore.rules`: `admin`/`premium`/`plan`/`stripe*`/`subscription*` no escribibles por el cliente (update vía `diff().affectedKeys()`; create fuerza valores por defecto). **Desplegado a Firebase.** | Claude Code |
| 2026-06-12 | SEC-13 | Paywall de contenido movido a servidor: `temas/{id}` solo legible por free si es tema 1 o `gratis==true`; premium vía `isPremium()`; admin todo. **Desplegado a Firebase.** | Claude Code |
| 2026-06-12 | SEC-14 | URLs de Stripe corregidas: `APP_BASE_URL` como dominio canónico (antes `VERCEL_URL` interno); `cancel_url` `/precios`→`/perfil`. Variable creada en Vercel + redeploy. | Claude Code / paco rabago |
| 2026-06-12 | SEC-15 | Cuota mensual de IA aplicada en servidor (`api/gemini.js`, transacción Firestore, reembolso si Gemini falla); contador `aiUsage*` lockeado en rules; transacción cliente eliminada de `useAiUsage.ts`. **Reglas desplegadas; código en deploy Vercel.** | Claude Code |
| 2026-06-12 | SEC-16 | Validación de entrada en `/api/gemini`: guarda `req.body`, allowlist de modelos, tope 30k chars, máx 100 entradas, validación de estructura `contents`. | Claude Code |
| 2026-06-12 | SEC-17 | Cabeceras de seguridad en `vercel.json`: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. ⚠️ CSP por verificar en preview. | Claude Code |
| 2026-06-12 | SEC-18 | Fail-open de rate-limit y cuota ahora emiten alerta estructurada `[ALERT]` con `uid`/error/timestamp en `api/gemini.js`. | Claude Code |
| 2026-06-12 | BUG-05 | `firebase.jsx`: persistencia offline migrada de `enableIndexedDbPersistence` (deprecada) a `initializeFirestore` + `persistentLocalCache` + `persistentMultipleTabManager` (multi-pestaña nativo). | Claude Code |
| 2026-06-12 | PERF-04 | `useSubscription` deriva de `userData` de AuthContext en vez de abrir su propio `onSnapshot`: un solo listener sobre `users/{uid}`, fin de la doble fuente de verdad. | Claude Code |
| 2026-06-15 | #10 | Page views GA4: `initGA()` cableado en `main.jsx` (no se llamaba) + `RouteTracker` con `useLocation` dispara `trackPageView` en cada navegación | Claude Code |
| 2026-06-15 | #15 | `LoadingSpinner` extraído a componente común con CSS (spinner + `prefers-reduced-motion`) e i18n `common.loading`; eliminado el inline de `App.jsx` | Claude Code |
| 2026-06-15 | SEC-16 | Historial del chat recortado por presupuesto de chars en `lib/chatHistory.ts` (`buildChatHistory`) para no chocar con el tope de 30k del servidor | Claude Code |
| 2026-06-15 | #12 | `tsconfig.json` (allowJs, checkJs off, strict, alias `@/*`) + devDeps TS + script `typecheck`; pasa sin errores | Claude Code |
| 2026-06-15 | #14 | `generar_*.py/.bat` y `helper_toc.py` movidos a `scripts/` con wrappers anclados a su dir; README y `.gitignore` (Python) actualizados | Claude Code |
| 2026-06-15 | #13 | Vitest configurado (jsdom) + scripts `test`/`test:watch` + workflow CI (`.github/workflows/ci.yml`); 9 tests (`chatHistory`, `cn`); eliminado `App.test.jsx` boilerplate | Claude Code |

---

## 🗓️ TAREAS PENDIENTES — Próxima sesión

### 🔒 EMPEZAR AQUÍ — Continuación auditoría seguridad/calidad (2026-06-12)

Sesión del 2026-06-12: se revisó el proyecto y se cerraron 9 mejoras (SEC-12…SEC-18, BUG-05, PERF-04). Quedaron pendientes los siguientes puntos de la lista original. **Retomar por aquí.**

**Verificación post-deploy (hacer primero, ya está todo desplegado):**
- [ ] **Probar CSP en producción** (SEC-17): abrir la app con la consola del navegador y navegar por login, herramientas IA, chat, mapas mentales (mermaid), contenido y perfil. Si aparece `Refused to ... Content-Security-Policy`, pasar el origen bloqueado para añadirlo a `vercel.json`. Alternativa: cambiar a `Content-Security-Policy-Report-Only` para fase de observación.
- [ ] **Probar flujo de pago Stripe** (SEC-14): checkout → verificar que tras pagar/cancelar aterriza en `www.smartstudia.com`, no en `*.vercel.app`.
- [ ] **Auditar usuarios con `admin:true`** (SEC-12): comprobar en Firestore si alguien se auto-asignó admin antes del fix (la app estuvo expuesta). Script Admin SDK o consola Firebase.

**Mejoras pendientes de la lista (orden recomendado):**
- [x] **#10 — Tracking de page views** (2026-06-15): `initGA()` se llama en `main.jsx` (antes no se invocaba en ningún sitio) y un componente `RouteTracker` dentro del `<Router>` dispara `trackPageView` en cada cambio de ruta vía `useLocation`.
- [ ] **#11 — Reset de cuota mensual frágil**: depende de que el cliente compare el mes; si nadie abre la app no se resetea. Considerar reset en servidor (ya se incrementa en `api/gemini.js`, que recalcula el mes en cada llamada — verificar si basta o conviene un job).
- [x] **#12 — tsconfig + typecheck** (2026-06-15): añadido `tsconfig.json` (`allowJs`, `checkJs:false`, `strict`, alias `@/*`→`src/*`), devDeps `typescript`+`@types/*`, script `npm run typecheck`. **Pasa sin errores.**
- [x] **#13 — Tests + CI** (2026-06-15): runner Vitest configurado en `vite.config.js` (jsdom, setupTests), scripts `test`/`test:watch`, workflow `.github/workflows/ci.yml` (install→typecheck→test→build). Lógica de truncado de chat extraída a `src/lib/chatHistory.ts` con tests; tests de `cn`. **9 tests verdes.** Siguiente paso: tests del webhook Stripe y reglas Firestore (`@firebase/rules-unit-testing`).
- [x] **#14 — Scripts movidos a `scripts/`** (2026-06-15): `generar_*.py/.bat` y `helper_toc.py` movidos con `git mv`. Wrappers anclados a su propio dir (`%~dp0` / `cwd=REPO_ROOT`) para funcionar desde cualquier CWD. README y `.gitignore` (Python) actualizados.
- [x] **#15 — `LoadingSpinner`** (2026-06-15): extraído a `src/components/common/LoadingSpinner.jsx` con clase CSS (spinner animado, `prefers-reduced-motion`) y texto `t('common.loading')`.

**Follow-ups menores de los fixes de hoy:**
- [ ] **Decidir fail-open vs fail-closed** en la cuota mensual (SEC-18): hoy queda fail-open + alerta. Pasar a fail-closed solo si se ven dispararse las alertas `[ALERT]`.
- [x] **Truncar historial en `EducationalChat`** (2026-06-15): `buildChatHistory` recorta el historial por presupuesto de chars (22k, margen bajo el tope de 30k del servidor) descartando los mensajes más antiguos. Función pura testeada.
- [ ] **Limpiar variables PayPal residuales** en Vercel: `VITE_APP_PAYPAL_CLIENT_ID` y `VITE_APP_PAYPAL_PLAN_ID` ya no se usan tras la migración a Stripe.
- [ ] **(Opcional) Sentry en backend**: añadir `@sentry/node` a las funciones `/api` para convertir los `[ALERT]` en avisos reales por email/Slack.

### 🥇 Prioridad alta — Contenido

- [x] ~~Lengua Española 1ºESO~~ — completado
- [x] ~~Biología y Geología 1ºESO~~ — completado
- [ ] **Generar contenido 1ºESO resto de asignaturas** — GeografiaHistoria, Ingles, FisicaQuimica, Tecnologia, EdFisica (descargar PDFs, correr helper_toc.py o script Python si la ruta tiene `º`)
- [ ] **Crear vídeos Temas 2–13 de Matemáticas 1ºESO** con NotebookLM (copiar `guion_video` de Firestore → NotebookLM → subir a YouTube → añadir `video_url` en Firestore → publicar tema)
- [ ] **Publicar Temas 2–13** desde `/admin/publicar` a medida que tengan su vídeo listo

### 🥈 Prioridad media — Más cursos

- [ ] **Generar contenido 2ºESO** — descargar PDFs de Drive, correr `helper_toc.py`, crear bat y ejecutar
- [ ] **Generar contenido 3ºESO, 4ºESO, 1ºBACH, 2ºBACH** — misma secuencia
- [ ] **Script bulk `video_url`** — cuando haya varios vídeos listos, usar un script Python para actualizar los campos de golpe en Firestore en vez de hacerlo manualmente

### 🥉 Prioridad baja — Técnico

- [ ] **Custom claim admin** (opcional): `python scripts/set_admin_claim.py --email pacoalfair@hotmail.com` + logout/login para que el token incluya `admin: true` (el panel ya funciona sin esto)
- [ ] **Activar Stripe Live** (PAY-02): completar onboarding en Stripe Dashboard y reemplazar variables en Vercel
- [ ] **Plan Anual Stripe** (PAY-03): crear precio anual en Stripe y actualizar `create-checkout-session.ts`
- [ ] **Deploy índice chat** (PERF-03): `firebase deploy --only firestore:indexes`
