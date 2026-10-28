@echo off
echo ========================================================
echo       PLANORA AI - ADAPTIVE EVENT INTELLIGENCE
echo ========================================================
echo.
echo Starting FastAPI Backend on http://localhost:8000 ...
start "Planora Backend (FastAPI)" cmd /k "cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 2 /nobreak >nul

echo Starting React + Vite Frontend on http://localhost:5173 ...
start "Planora Frontend (Vite)" cmd /k "cd frontend && npm run dev"

echo.
echo Planora AI is launching!
echo Backend:  http://localhost:8000 (API Docs: http://localhost:8000/docs)
echo Frontend: http://localhost:5173
echo ========================================================
pause
