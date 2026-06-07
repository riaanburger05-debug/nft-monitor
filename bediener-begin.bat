@echo off
echo =====================================================
echo  GroeiWys — Plaaslike Bediener
echo =====================================================
echo.
echo  Lêers word bedien vanaf hierdie gids.
echo.
echo  Maak op die FOON oop (dieselfde WiFi):
echo  http://192.168.222.246:8080/tenk-monitor-leerder.html
echo.
echo  Druk Ctrl+C om te stop.
echo =====================================================
cd /d "%~dp0"
python -m http.server 8080
pause
