@echo off
title MHSG Rwanda - Frontend Server
echo ====================================================
echo Starting MHSG Rwanda Next.js Frontend
echo ====================================================

cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo Installing node modules...
    npm install --legacy-peer-deps
)

echo Starting Next.js development server on port 3000...
echo Frontend Portal: http://localhost:3000
npm run dev

pause
