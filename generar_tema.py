#!/usr/bin/env python3
"""
generar_tema.py — Genera contenido educativo estructurado desde un PDF
usando Claude Haiku 4.5 y lo sube a Firestore.

Uso:
    python generar_tema.py \
      --pdf "pdfs/1ESO/matematicas/tema3.pdf" \
      --pagina_inicio 12 \
      --pagina_fin 28 \
      --curso "1ESO" \
      --asignatura "Matematicas" \
      --tema "Números enteros" \
      --numero_tema 3

Opciones adicionales:
    --no-firestore    Solo genera el JSON, no guarda en Firestore
    --output FILE     Guarda el JSON generado en un archivo
"""

import argparse
import json
import os
import sys
from datetime import datetime, timezone

import anthropic
import fitz  # pymupdf
from dotenv import load_dotenv

# ── Cargar variables de entorno ────────────────────────────────────────────────
load_dotenv()

# ── Precios Claude Haiku 4.5 (€/token, ratio 1 USD ≈ 0.93 EUR) ──────────────
# $1.00/1M input · $5.00/1M output · $1.25/1M cache-write · $0.10/1M cache-read
_USD_EUR = 0.93
PRECIO = {
    "input":       1.00 * _USD_EUR / 1_000_000,
    "output":      5.00 * _USD_EUR / 1_000_000,
    "cache_write": 1.25 * _USD_EUR / 1_000_000,
    "cache_read":  0.10 * _USD_EUR / 1_000_000,
}

# ── System prompt (cacheado para evitar reenvío en cada llamada) ──────────────
SYSTEM_PROMPT = """Eres un experto en creación de contenido educativo estructurado para
estudiantes de secundaria y bachillerato en España.

Tu tarea es analizar el texto de un tema y generar un JSON con EXACTAMENTE esta estructura:

{
  "resumen": {
    "titulo": "Título descriptivo del tema",
    "apartados": [
      {
        "subtitulo": "Nombre del apartado",
        "contenido": "Explicación clara en 2-4 párrafos. Lenguaje apropiado para el nivel."
      }
    ]
  },
  "cuestionario": [
    {
      "pregunta": "Pregunta clara y concreta",
      "opciones": ["A) Texto", "B) Texto", "C) Texto", "D) Texto"],
      "correcta": 0,
      "explicacion": "Por qué es correcta y por qué las otras no."
    }
  ],
  "tarjetas": [
    {
      "frente": "Concepto o término clave",
      "reverso": "Definición o explicación breve"
    }
  ],
  "guion_video": "Guión completo para vídeo de 5-7 min. Tono cercano y dinámico."
}

REGLAS:
- Responde ÚNICAMENTE con el JSON. Sin markdown, sin bloques ```json, sin texto extra.
- "apartados": entre 4 y 8 entradas.
- "cuestionario": exactamente 10 preguntas, variedad de dificultad.
- "tarjetas": entre 10 y 15 tarjetas.
- "correcta": índice 0-3 de la opción correcta en "opciones".
- Las opciones deben empezar con "A) ", "B) ", "C) " o "D) ".
- Adapta el nivel de dificultad al curso indicado.
- El guión de vídeo debe sonar natural, como si lo narrase un profesor joven."""


# ──────────────────────────────────────────────────────────────────────────────
# 1. Extracción de texto desde PDF
# ──────────────────────────────────────────────────────────────────────────────

def extraer_texto_pdf(ruta_pdf: str, pagina_inicio: int, pagina_fin: int) -> str:
    """Extrae texto de un rango de páginas del PDF (1-based, ambos extremos incluidos)."""
    if not os.path.exists(ruta_pdf):
        print(f"❌ Error: No se encuentra el PDF en '{ruta_pdf}'")
        sys.exit(1)

    doc = fitz.open(ruta_pdf)
    total = doc.page_count

    inicio_idx = pagina_inicio - 1          # convertir a 0-based
    fin_idx    = min(pagina_fin, total)     # fin inclusivo → range lo excluye

    if inicio_idx < 0 or inicio_idx >= total:
        print(f"❌ Error: --pagina_inicio {pagina_inicio} fuera de rango "
              f"(el PDF tiene {total} páginas)")
        sys.exit(1)

    partes = [doc[i].get_text() for i in range(inicio_idx, fin_idx)]
    doc.close()

    texto = "\n".join(partes).strip()

    if len(texto) < 200:
        print(f"⚠️  Advertencia: solo se extrajeron {len(texto)} caracteres. "
              "¿Es el PDF escaneado o protegido?")

    return texto


# ──────────────────────────────────────────────────────────────────────────────
# 2. Generación de contenido con Claude
# ──────────────────────────────────────────────────────────────────────────────

def generar_contenido(
    texto: str, curso: str, asignatura: str, tema: str
) -> tuple[dict, dict]:
    """
    Llama a Claude Haiku 4.5 con prompt caching en el system prompt.
    Devuelve (contenido_dict, uso_tokens).
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("❌ Error: ANTHROPIC_API_KEY no está definida en .env")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)

    prompt_usuario = (
        f"Curso: {curso}\n"
        f"Asignatura: {asignatura}\n"
        f"Tema: {tema}\n\n"
        f"=== TEXTO DEL TEMA ===\n{texto}\n=== FIN DEL TEXTO ===\n\n"
        "Genera el JSON educativo completo para este tema."
    )

    print("🤖 Llamando a Claude Haiku 4.5...")

    response = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=8192,
        system=[
            {
                "type": "text",
                "text": SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},   # prompt caching
            }
        ],
        messages=[
            {"role": "user", "content": prompt_usuario}
        ],
    )

    raw = response.content[0].text.strip()

    # Limpiar posible bloque markdown que el modelo añada a veces
    if raw.startswith("```"):
        lines = raw.split("\n")
        raw = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

    try:
        contenido = json.loads(raw)
    except json.JSONDecodeError as e:
        print(f"❌ Error al parsear el JSON de Claude: {e}")
        print("── Primeros 500 caracteres de la respuesta ──")
        print(raw[:500])
        sys.exit(1)

    uso = {
        "input_tokens":               response.usage.input_tokens,
        "output_tokens":              response.usage.output_tokens,
        "cache_creation_input_tokens": getattr(response.usage, "cache_creation_input_tokens", 0) or 0,
        "cache_read_input_tokens":     getattr(response.usage, "cache_read_input_tokens", 0) or 0,
    }

    return contenido, uso


# ──────────────────────────────────────────────────────────────────────────────
# 3. Cálculo de coste
# ──────────────────────────────────────────────────────────────────────────────

def calcular_coste(uso: dict) -> float:
    return (
        uso["input_tokens"]               * PRECIO["input"]
        + uso["output_tokens"]            * PRECIO["output"]
        + uso["cache_creation_input_tokens"] * PRECIO["cache_write"]
        + uso["cache_read_input_tokens"]  * PRECIO["cache_read"]
    )


# ──────────────────────────────────────────────────────────────────────────────
# 4. Guardar en Firestore
# ──────────────────────────────────────────────────────────────────────────────

def guardar_en_firestore(
    contenido: dict,
    curso: str,
    asignatura: str,
    tema: str,
    numero_tema: int,
) -> str:
    """
    Guarda el contenido en:
      contenido/{curso}/asignaturas/{asignatura}/temas/{numero_tema}
    con publicado=false.
    Devuelve el path del documento.
    """
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore as fs
    except ImportError:
        print("❌ Error: firebase-admin no instalado. Ejecuta: pip install firebase-admin")
        sys.exit(1)

    credentials_path = os.environ.get("FIREBASE_CREDENTIALS_PATH")
    project_id       = os.environ.get("FIREBASE_PROJECT_ID")

    if not credentials_path or not project_id:
        print("❌ Error: FIREBASE_CREDENTIALS_PATH o FIREBASE_PROJECT_ID no "
              "están definidos en .env")
        sys.exit(1)

    if not os.path.exists(credentials_path):
        print(f"❌ Error: No se encuentra el archivo de credenciales "
              f"en '{credentials_path}'")
        sys.exit(1)

    if not firebase_admin._apps:
        cred = credentials.Certificate(credentials_path)
        firebase_admin.initialize_app(cred, {"projectId": project_id})

    db = fs.client()

    doc_data = {
        # Metadatos
        "titulo":       contenido["resumen"]["titulo"],
        "nombre_tema":  tema,
        "numero_tema":  numero_tema,
        "curso":        curso,
        "asignatura":   asignatura,
        "publicado":    False,
        "createdAt":    datetime.now(timezone.utc),
        # Contenido
        "resumen":      contenido["resumen"],
        "cuestionario": contenido["cuestionario"],
        "tarjetas":     contenido["tarjetas"],
        "guion_video":  contenido.get("guion_video", ""),
    }

    doc_id  = str(numero_tema)
    doc_ref = (
        db.collection("contenido")
          .document(curso)
          .collection("asignaturas")
          .document(asignatura)
          .collection("temas")
          .document(doc_id)
    )
    doc_ref.set(doc_data)

    return f"contenido/{curso}/asignaturas/{asignatura}/temas/{doc_id}"


# ──────────────────────────────────────────────────────────────────────────────
# 5. CLI principal
# ──────────────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Genera contenido educativo desde PDF con Claude Haiku 4.5",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("--pdf",            required=True,      help="Ruta al archivo PDF")
    parser.add_argument("--pagina_inicio",  type=int, required=True, help="Primera página (1-based)")
    parser.add_argument("--pagina_fin",     type=int, required=True, help="Última página (incluida)")
    parser.add_argument("--curso",          required=True,      help="Curso, ej: 1ESO")
    parser.add_argument("--asignatura",     required=True,      help="Asignatura, ej: Matematicas")
    parser.add_argument("--tema",           required=True,      help="Nombre del tema")
    parser.add_argument("--numero_tema",    type=int, required=True, help="Número del tema")
    parser.add_argument("--no-firestore",   action="store_true", help="No guardar en Firestore")
    parser.add_argument("--output",                             help="Guardar JSON en este archivo")

    args = parser.parse_args()

    BARRA = "═" * 57

    print(f"\n{BARRA}")
    print("  SmartStudIA — Generador de Contenido Educativo")
    print(BARRA)
    print(f"  📚 Tema:         {args.tema}")
    print(f"  🏫 Curso:        {args.curso}")
    print(f"  📖 Asignatura:   {args.asignatura}")
    print(f"  📄 PDF:          {args.pdf}")
    print(f"  📃 Páginas:      {args.pagina_inicio} → {args.pagina_fin}")
    print(BARRA)

    # ── Paso 1: Extraer texto ────────────────────────────────────────────────
    print("\n📄 Extrayendo texto del PDF...")
    texto = extraer_texto_pdf(args.pdf, args.pagina_inicio, args.pagina_fin)
    n_paginas = args.pagina_fin - args.pagina_inicio + 1
    print(f"   ✅ {len(texto):,} caracteres extraídos ({n_paginas} página{'s' if n_paginas != 1 else ''})")

    # ── Paso 2: Generar contenido con Claude ─────────────────────────────────
    contenido, uso = generar_contenido(texto, args.curso, args.asignatura, args.tema)

    # ── Paso 3: Estadísticas ─────────────────────────────────────────────────
    coste         = calcular_coste(uso)
    n_apartados   = len(contenido.get("resumen", {}).get("apartados", []))
    n_preguntas   = len(contenido.get("cuestionario", []))
    n_tarjetas    = len(contenido.get("tarjetas", []))
    tiene_guion   = bool(contenido.get("guion_video", "").strip())

    BARRA2 = "─" * 57
    print(f"\n{BARRA2}")
    print("  ✅ Contenido generado:")
    print(f"     • Resumen:      {n_apartados} apartados")
    print(f"     • Cuestionario: {n_preguntas} preguntas")
    print(f"     • Tarjetas:     {n_tarjetas} tarjetas")
    print(f"     • Guión vídeo:  {'Sí' if tiene_guion else 'No'}")
    print(f"{BARRA2}")
    print("  📊 Tokens utilizados:")
    print(f"     • Input:        {uso['input_tokens']:,}")
    print(f"     • Output:       {uso['output_tokens']:,}")
    if uso["cache_creation_input_tokens"]:
        print(f"     • Cache write:  {uso['cache_creation_input_tokens']:,}")
    if uso["cache_read_input_tokens"]:
        print(f"     • Cache read:   {uso['cache_read_input_tokens']:,}")
    print(f"  💶 Coste estimado:  {coste:.4f} €")
    print(BARRA2)

    # ── Paso 4: Guardar JSON local (opcional) ────────────────────────────────
    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            json.dump(contenido, f, ensure_ascii=False, indent=2)
        print(f"\n  💾 JSON guardado en: {args.output}")

    # ── Paso 5: Guardar en Firestore ─────────────────────────────────────────
    if not args.no_firestore:
        print("\n🔥 Guardando en Firestore...")
        path = guardar_en_firestore(
            contenido,
            args.curso,
            args.asignatura,
            args.tema,
            args.numero_tema,
        )
        print(f"   ✅ Documento guardado:  {path}")
        print("   ⚠️  publicado: false — actívalo desde /admin/publicar")
    else:
        print("\n   ℹ️  Firestore omitido (--no-firestore)")

    print(f"\n{BARRA}\n")


if __name__ == "__main__":
    main()
