import fitz
import re
import sys

pdf = r'C:\Users\Paco\Desktop\pdf\1ESO_Matematicas.pdf'

try:
    doc = fitz.open(pdf)
except Exception as e:
    print(f"Error abriendo PDF: {e}")
    sys.exit(1)

total = len(doc)
print(f"Total paginas: {total}")
print("-" * 60)

capitulos = []   # lista de (numero, titulo, pagina_inicio)
cap_actual = None

for i, page in enumerate(doc):
    text = page.get_text()
    # Busca "Capítulo N" en el texto de la página
    m = re.search(r'Cap[ií]tulo\s+(\d+)[:\s–-]*([^\n]*)', text, re.IGNORECASE)
    if m:
        num = int(m.group(1))
        titulo = m.group(2).strip()[:70]
        if num != cap_actual:
            capitulos.append((num, titulo, i + 1))  # página 1-based
            cap_actual = num

doc.close()

# Imprimir con página de inicio y fin
for idx, (num, titulo, inicio) in enumerate(capitulos):
    fin = capitulos[idx + 1][2] - 1 if idx + 1 < len(capitulos) else total
    print(f"  Cap {num:2d}: pag {inicio:3d}–{fin:3d}  |  {titulo}")
