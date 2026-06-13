@echo off
setlocal
cd /d "%~dp0"

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0nuwe-laptop-begin.ps1"

if errorlevel 1 (
  echo.
  echo Die opstelling kon nie voltooi word nie.
  pause
)
