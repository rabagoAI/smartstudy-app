@echo off
setlocal
set PDF=C:\Users\Paco\Desktop\pdf\1ESO_LenguaEspanola.pdf
set CURSO=1ESO
set ASIG=LenguaEspanola
echo ============================================================
echo  Generando contenido 1ESO Lengua Espanola (9 unidades)
echo ============================================================
echo.
echo [1/9] Comunicacion no verbal y textos normativos...
python generar_tema.py --pdf "%PDF%" --pagina_inicio 3  --pagina_fin 16  --curso %CURSO% --asignatura %ASIG% --tema "Comunicacion no verbal y textos normativos" --numero_tema 1
echo.
echo [2/9] Textos descriptivos y narrativos...
python generar_tema.py --pdf "%PDF%" --pagina_inicio 17 --pagina_fin 28  --curso %CURSO% --asignatura %ASIG% --tema "Textos descriptivos y narrativos"           --numero_tema 2
echo.
echo [3/9] Textos formales y dialogados...
python generar_tema.py --pdf "%PDF%" --pagina_inicio 29 --pagina_fin 40  --curso %CURSO% --asignatura %ASIG% --tema "Textos formales y dialogados"                --numero_tema 3
echo.
echo [4/9] El genero lirico...
python generar_tema.py --pdf "%PDF%" --pagina_inicio 41 --pagina_fin 58  --curso %CURSO% --asignatura %ASIG% --tema "El genero lirico"                            --numero_tema 4
echo.
echo [5/9] El genero narrativo...
python generar_tema.py --pdf "%PDF%" --pagina_inicio 59 --pagina_fin 74  --curso %CURSO% --asignatura %ASIG% --tema "El genero narrativo"                         --numero_tema 5
echo.
echo [6/9] El genero teatral...
python generar_tema.py --pdf "%PDF%" --pagina_inicio 75 --pagina_fin 90  --curso %CURSO% --asignatura %ASIG% --tema "El genero teatral"                           --numero_tema 6
echo.
echo [7/9] Las palabras variables...
python generar_tema.py --pdf "%PDF%" --pagina_inicio 91 --pagina_fin 108 --curso %CURSO% --asignatura %ASIG% --tema "Las palabras variables"                      --numero_tema 7
echo.
echo [8/9] El verbo y las palabras invariables...
python generar_tema.py --pdf "%PDF%" --pagina_inicio 109 --pagina_fin 119 --curso %CURSO% --asignatura %ASIG% --tema "El verbo y las palabras invariables"        --numero_tema 8
echo.
echo [9/9] Ortografia y comunicacion...
python generar_tema.py --pdf "%PDF%" --pagina_inicio 120 --pagina_fin 151 --curso %CURSO% --asignatura %ASIG% --tema "Ortografia y comunicacion"                  --numero_tema 9
echo.
echo ============================================================
echo  Generacion completada. Revisa Firestore para publicar.
echo ============================================================
endlocal