import subprocess
import sys

DIR = r"C:\Users\Paco\Desktop\pdf\1ºESO\Ciencias Naturales"
CURSO = "1ESO"
ASIG = "BiologiaGeologia"

temas = [
    (1,  "El Universo",                      "1_Tema_01_Universo.pdf"),
    (2,  "La materia",                        "1_Tema_02_La_materia.pdf"),
    (3,  "La atmosfera",                      "1_Tema_03_La_atmosfera.pdf"),
    (4,  "La hidrosfera",                     "1_Tema_04_La_hidrosfera.pdf"),
    (5,  "La geosfera",                       "1_Tema_05_La_geosfera.pdf"),
    (6,  "Los seres vivos. Diversidad",       "1_Tema_06_Los_SSVV_diversidad.pdf"),
    (7,  "Clasificacion de los seres vivos",  "1_Tema_07_Clasificacion_SSVV.pdf"),
    (8,  "El reino de las plantas",           "1_Tema_08_Reino_plantas.pdf"),
    (9,  "Los invertebrados",                 "1_Tema_09_Invertebrados.pdf"),
    (10, "Los vertebrados",                   "1_Tema_10_Vertebrados.pdf"),
]

total = len(temas)
for numero, titulo, archivo in temas:
    pdf = f"{DIR}\\{archivo}"
    print(f"\n[{numero}/{total}] {titulo}...")
    cmd = [
        sys.executable, "generar_tema.py",
        "--pdf", pdf,
        "--pagina_inicio", "1",
        "--pagina_fin", "999",
        "--curso", CURSO,
        "--asignatura", ASIG,
        "--tema", titulo,
        "--numero_tema", str(numero),
    ]
    result = subprocess.run(cmd)
    if result.returncode != 0:
        print(f"ERROR en tema {numero}. Abortando.")
        sys.exit(1)

print("\n============================================================")
print(" Generacion completada. Revisa Firestore para publicar.")
print("============================================================")