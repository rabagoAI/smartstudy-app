@echo off
setlocal
rem Ejecutar siempre desde la raiz del repo para que las rutas relativas
rem (FIREBASE_CREDENTIALS_PATH=scripts/serviceAccountKey.json) resuelvan bien.
cd /d "%~dp0.."
set PDF=C:\Users\Paco\Desktop\pdf\1ESO_Matematicas.pdf
set CURSO=1ESO
set ASIG=Matematicas
echo ============================================================
echo  Generando contenido 1ESO Matematicas (13 temas)
echo ============================================================
echo.
echo [1/13] Resolucion de problemas...
python "%~dp0generar_tema.py" --pdf "%PDF%" --pagina_inicio 5  --pagina_fin 21  --curso %CURSO% --asignatura %ASIG% --tema "Resolucion de problemas"          --numero_tema 1
echo.
echo [2/13] Numeros Naturales. Divisibilidad...
python "%~dp0generar_tema.py" --pdf "%PDF%" --pagina_inicio 22 --pagina_fin 52  --curso %CURSO% --asignatura %ASIG% --tema "Numeros naturales. Divisibilidad"  --numero_tema 2
echo.
echo [3/13] Potencias y raices...
python "%~dp0generar_tema.py" --pdf "%PDF%" --pagina_inicio 53 --pagina_fin 68  --curso %CURSO% --asignatura %ASIG% --tema "Potencias y raices"                 --numero_tema 3
echo.
echo [4/13] Numeros Enteros...
python "%~dp0generar_tema.py" --pdf "%PDF%" --pagina_inicio 69 --pagina_fin 86  --curso %CURSO% --asignatura %ASIG% --tema "Numeros enteros"                    --numero_tema 4
echo.
echo [5/13] Fracciones...
python "%~dp0generar_tema.py" --pdf "%PDF%" --pagina_inicio 87 --pagina_fin 113 --curso %CURSO% --asignatura %ASIG% --tema "Fracciones"                         --numero_tema 5
echo.
echo [6/13] Numeros decimales...
python "%~dp0generar_tema.py" --pdf "%PDF%" --pagina_inicio 114 --pagina_fin 143 --curso %CURSO% --asignatura %ASIG% --tema "Numeros decimales"                 --numero_tema 6
echo.
echo [7/13] Sistemas de Medida...
python "%~dp0generar_tema.py" --pdf "%PDF%" --pagina_inicio 144 --pagina_fin 166 --curso %CURSO% --asignatura %ASIG% --tema "Sistemas de medida"                --numero_tema 7
echo.
echo [8/13] Figuras Planas...
python "%~dp0generar_tema.py" --pdf "%PDF%" --pagina_inicio 167 --pagina_fin 201 --curso %CURSO% --asignatura %ASIG% --tema "Figuras planas"                    --numero_tema 8
echo.
echo [9/13] Longitudes y areas...
python "%~dp0generar_tema.py" --pdf "%PDF%" --pagina_inicio 202 --pagina_fin 222 --curso %CURSO% --asignatura %ASIG% --tema "Longitudes y areas"                --numero_tema 9
echo.
echo [10/13] Magnitudes proporcionales. Porcentajes...
python "%~dp0generar_tema.py" --pdf "%PDF%" --pagina_inicio 223 --pagina_fin 246 --curso %CURSO% --asignatura %ASIG% --tema "Magnitudes proporcionales. Porcentajes" --numero_tema 10
echo.
echo [11/13] Algebra...
python "%~dp0generar_tema.py" --pdf "%PDF%" --pagina_inicio 247 --pagina_fin 265 --curso %CURSO% --asignatura %ASIG% --tema "Algebra"                           --numero_tema 11
echo.
echo [12/13] Tablas y graficas. El plano...
python "%~dp0generar_tema.py" --pdf "%PDF%" --pagina_inicio 266 --pagina_fin 296 --curso %CURSO% --asignatura %ASIG% --tema "Tablas y graficas. El plano"       --numero_tema 12
echo.
echo [13/13] Estadistica y Probabilidad...
python "%~dp0generar_tema.py" --pdf "%PDF%" --pagina_inicio 297 --pagina_fin 316 --curso %CURSO% --asignatura %ASIG% --tema "Estadistica y probabilidad"        --numero_tema 13
echo.
echo ============================================================
echo  Generacion completada. Revisa Firestore para publicar.
echo ============================================================
endlocal