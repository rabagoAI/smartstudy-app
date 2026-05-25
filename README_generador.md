# SmartStudIA — Generador de Contenido Educativo

Script de línea de comandos para generar contenido educativo estructurado a partir
de un PDF y subirlo automáticamente a Firestore.

---

## Requisitos

- Python 3.10+
- Una clave de API de [Anthropic](https://console.anthropic.com/)
- Credenciales de Firebase Admin SDK (archivo JSON)

---

## Instalación

```bash
# Crear entorno virtual (recomendado)
python -m venv venv
source venv/bin/activate   # Linux/macOS
# venv\Scripts\activate    # Windows

# Instalar dependencias
pip install -r requirements.txt
```

---

## Configuración

Copia `.env.example` a `.env` y rellena las variables del bloque *Generador*:

```bash
cp .env.example .env
```

Variables necesarias para el script:

| Variable | Descripción |
|---|---|
| `ANTHROPIC_API_KEY` | Clave API de Anthropic (sk-ant-...) |
| `FIREBASE_CREDENTIALS_PATH` | Ruta al JSON de credenciales Admin SDK |
| `FIREBASE_PROJECT_ID` | ID del proyecto Firebase |

Para obtener las credenciales de Firebase:
1. Ve a **Firebase Console → Project Settings → Service Accounts**
2. Haz clic en **Generate new private key**
3. Guarda el JSON descargado en `scripts/serviceAccountKey.json`
4. ⚠️ **Nunca lo commitees** — añade `scripts/serviceAccountKey.json` a `.gitignore`

---

## Uso

```bash
python generar_tema.py \
  --pdf "pdfs/1ESO/matematicas/tema3.pdf" \
  --pagina_inicio 12 \
  --pagina_fin 28 \
  --curso "1ESO" \
  --asignatura "Matematicas" \
  --tema "Números enteros" \
  --numero_tema 3
```

### Parámetros

| Parámetro | Tipo | Descripción |
|---|---|---|
| `--pdf` | string | Ruta al archivo PDF |
| `--pagina_inicio` | int | Primera página a extraer (1-based) |
| `--pagina_fin` | int | Última página a extraer (incluida) |
| `--curso` | string | Identificador del curso: `1ESO`, `2ESO`, `3ESO`, `4ESO`, `1BAC`, `2BAC` |
| `--asignatura` | string | Nombre de la asignatura (debe coincidir exactamente con el ID en Firestore) |
| `--tema` | string | Nombre descriptivo del tema |
| `--numero_tema` | int | Número del tema (se usa como ID del documento en Firestore) |
| `--no-firestore` | flag | Solo genera el JSON, no guarda en Firestore |
| `--output FILE` | string | Guarda el JSON generado en un archivo local |

---

## Contenido generado

El script genera 4 secciones por tema:

| Sección | Contenido |
|---|---|
| **Resumen** | 4–8 apartados con subtítulo y explicación |
| **Cuestionario** | 10 preguntas tipo test con 4 opciones y explicación |
| **Tarjetas** | 10–15 flashcards (frente/reverso) |
| **Guión de vídeo** | Guión narrado de 5–7 minutos |

---

## Estructura Firestore

Los documentos se guardan en:

```
contenido/{curso}/asignaturas/{asignatura}/temas/{numero_tema}
```

Con el campo `publicado: false` por defecto.

Para publicar el contenido, usa el panel de administración en:
```
https://tu-dominio.com/admin/publicar
```

---

## Salida del script

```
═══════════════════════════════════════════════════════════
  SmartStudIA — Generador de Contenido Educativo
═══════════════════════════════════════════════════════════
  📚 Tema:         Números enteros
  🏫 Curso:        1ESO
  📖 Asignatura:   Matematicas
  📄 PDF:          pdfs/1ESO/matematicas/tema3.pdf
  📃 Páginas:      12 → 28
═══════════════════════════════════════════════════════════

📄 Extrayendo texto del PDF...
   ✅ 18.432 caracteres extraídos (17 páginas)
🤖 Llamando a Claude Haiku 4.5...

───────────────────────────────────────────────────────────
  ✅ Contenido generado:
     • Resumen:      6 apartados
     • Cuestionario: 10 preguntas
     • Tarjetas:     13 tarjetas
     • Guión vídeo:  Sí
───────────────────────────────────────────────────────────
  📊 Tokens utilizados:
     • Input:        5.231
     • Output:       2.847
     • Cache write:  1.204
  💶 Coste estimado:  0.0191 €
───────────────────────────────────────────────────────────

🔥 Guardando en Firestore...
   ✅ Documento guardado:  contenido/1ESO/asignaturas/Matematicas/temas/3
   ⚠️  publicado: false — actívalo desde /admin/publicar
```

---

## Notas

- Los PDFs escaneados (imágenes) no funcionan con pymupdf — necesitan OCR previo.
- El prompt del sistema está cacheado: llamadas repetidas al mismo tema son ~10x más baratas en tokens de sistema.
- El campo `asignatura` en Firestore debe coincidir exactamente con el valor pasado en `--asignatura`. Usa siempre la misma capitalización (ej: `Matematicas`, no `matematicas`).
