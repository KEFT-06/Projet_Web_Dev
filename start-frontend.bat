@echo off
echo ========================================
echo   Demarrage du Frontend React
echo ========================================
echo.

cd frontend

echo Verification du fichier .env...
if not exist .env (
    echo ERREUR: Le fichier .env n'existe pas!
    echo Veuillez creer le fichier .env en suivant CONFIGURATION_ENV.md
    pause
    exit /b 1
)

echo Installation des dependances...
call npm install

echo.
echo ========================================
echo   Demarrage du serveur Vite
echo   URL: http://localhost:3000
echo ========================================
echo.

npm run dev

