@echo off
chcp 65001 >nul
echo ========================================
echo   Smart-Sciences — Starting...
echo ========================================

:: Check npm dependencies
if not exist node_modules (
    echo [1/2] Installing npm dependencies...
    call npm install
)

:: Start everything with concurrently
echo [2/2] Starting Backend + Frontend...
echo   Backend  : http://127.0.0.1:8000
echo   Frontend : http://localhost:5173
echo   Docs API : http://127.0.0.1:8000/docs
echo ========================================
call npm run dev
