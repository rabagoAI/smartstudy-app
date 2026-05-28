@echo off
setlocal
set DIR=C:\Users\Paco\Desktop\pdf\1ºESO\Ciencias Naturales
set CURSO=1ESO
set ASIG=BiologiaGeologia
echo ============================================================
echo  Generando contenido 1ESO Biologia y Geologia (10 temas)
echo ============================================================
echo.
echo [1/10] El Universo...
python generar_tema.py --pdf "%DIR%\1_Tema_01_Universo.pdf" --pagina_inicio 1 --pagina_fin 999 --curso %CURSO% --asignatura %ASIG% --tema "El Universo"                       --numero_tema 1
echo.
echo [2/10] La materia...
python generar_tema.py --pdf "%DIR%\1_Tema_02_La_materia.pdf" --pagina_inicio 1 --pagina_fin 999 --curso %CURSO% --asignatura %ASIG% --tema "La materia"                      --numero_tema 2
echo.
echo [3/10] La atmosfera...
python generar_tema.py --pdf "%DIR%\1_Tema_03_La_atmosfera.pdf" --pagina_inicio 1 --pagina_fin 999 --curso %CURSO% --asignatura %ASIG% --tema "La atmosfera"                  --numero_tema 3
echo.
echo [4/10] La hidrosfera...
python generar_tema.py --pdf "%DIR%\1_Tema_04_La_hidrosfera.pdf" --pagina_inicio 1 --pagina_fin 999 --curso %CURSO% --asignatura %ASIG% --tema "La hidrosfera"                --numero_tema 4
echo.
echo [5/10] La geosfera...
python generar_tema.py --pdf "%DIR%\1_Tema_05_La_geosfera.pdf" --pagina_inicio 1 --pagina_fin 999 --curso %CURSO% --asignatura %ASIG% --tema "La geosfera"                    --numero_tema 5
echo.
echo [6/10] Los seres vivos - diversidad...
python generar_tema.py --pdf "%DIR%\1_Tema_06_Los_SSVV_diversidad.pdf" --pagina_inicio 1 --pagina_fin 999 --curso %CURSO% --asignatura %ASIG% --tema "Los seres vivos. Diversidad" --numero_tema 6
echo.
echo [7/10] Clasificacion de los seres vivos...
python generar_tema.py --pdf "%DIR%\1_Tema_07_Clasificacion_SSVV.pdf" --pagina_inicio 1 --pagina_fin 999 --curso %CURSO% --asignatura %ASIG% --tema "Clasificacion de los seres vivos" --numero_tema 7
echo.
echo [8/10] Reino plantas...
python generar_tema.py --pdf "%DIR%\1_Tema_08_Reino_plantas.pdf" --pagina_inicio 1 --pagina_fin 999 --curso %CURSO% --asignatura %ASIG% --tema "El reino de las plantas"      --numero_tema 8
echo.
echo [9/10] Invertebrados...
python generar_tema.py --pdf "%DIR%\1_Tema_09_Invertebrados.pdf" --pagina_inicio 1 --pagina_fin 999 --curso %CURSO% --asignatura %ASIG% --tema "Los invertebrados"            --numero_tema 9
echo.
echo [10/10] Vertebrados...
python generar_tema.py --pdf "%DIR%\1_Tema_10_Vertebrados.pdf" --pagina_inicio 1 --pagina_fin 999 --curso %CURSO% --asignatura %ASIG% --tema "Los vertebrados"               --numero_tema 10
echo.
echo ============================================================
echo  Generacion completada. Revisa Firestore para publicar.
echo ============================================================
endlocal