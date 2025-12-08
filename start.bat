@echo off
REM Startup script for AI Chatbot (Windows)

echo ====================================
echo   CC4E Chatbot - Electron Desktop
echo ====================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
)

echo Starting CC4E Chatbot...
echo.
call npm start

if errorlevel 1 (
    echo.
    echo Error: Failed to start application
    pause
    exit /b 1
)
