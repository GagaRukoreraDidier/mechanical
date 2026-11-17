@echo off
title MHSG Rwanda - Full Stack Application
echo ====================================================
echo Starting MHSG Rwanda (FIX-IT-FAST CO. Ltd ^& GAMU)
echo Running Native SQLite Database Application
echo ====================================================

cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo Installing node dependencies...
    npm install --legacy-peer-deps
)

echo.
echo ====================================================
echo Application URL: http://localhost:3000
echo Login:
echo   - Main Admin: admin@mhsg.rw / Admin@Rwanda2026
echo   - Customer: Tel 0788220220 (or ID 1199580011223344)
echo   - Garage:   Tel 0788330330 (or ID 1198880022334455)
echo   - Mechanic: Tel 0788440440 (or ID 1199280033445566)
echo   - Seller:   Tel 0788550550 (or ID 1198580044556677)
echo   - Home Tech:Tel 0788660660 (or ID 1199080055667788)
echo ====================================================
echo.

npm run dev

pause
