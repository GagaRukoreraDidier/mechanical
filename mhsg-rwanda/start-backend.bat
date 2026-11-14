@echo off
title MHSG Rwanda - Backend Server
echo ====================================================
echo Starting MHSG Rwanda Django Backend (Python)
echo ====================================================

cd /d "%~dp0backend"

if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat

echo Installing/checking dependencies...
pip install -r requirements\base.txt

echo Applying database migrations...
python manage.py migrate

echo Seeding baseline Rwanda data (admin, categories, fees)...
python manage.py seed_mhsg_data

echo Starting Django REST Framework server on port 8000...
echo API Swagger Docs: http://localhost:8000/api/v1/schema/swagger/
echo Admin Panel:      http://localhost:8000/admin/
python manage.py runserver 0.0.0.0:8000

pause
