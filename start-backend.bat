@echo off
echo ========================================
echo   Demarrage du Backend Laravel
echo ========================================
echo.

cd Mon_Miam_Miam

echo Verification du fichier .env...
if not exist .env (
    echo ERREUR: Le fichier .env n'existe pas!
    echo Veuillez creer le fichier .env en suivant CONFIGURATION_ENV.md
    pause
    exit /b 1
)

rem Vérifier si la clé d'application est déjà définie pour éviter de l'écraser
findstr /C:"APP_KEY=base64:" .env >nul
if %errorlevel% neq 0 (
    echo Generation de la cle d'application...
    php artisan key:generate
) else (
    echo Cle d'application deja existante.
)

echo Creation de la base de donnees...
if not exist database\database.sqlite (
    echo Fichier database.sqlite non trouve. Initialisation complete...
    type nul > database\database.sqlite
    php artisan migrate:fresh --seed
) else (
    echo Base de donnees existante. Execution des migrations...
    php artisan migrate
)

echo.
echo ========================================
echo   Demarrage du serveur Laravel
echo   URL: http://localhost:8000
echo ========================================
echo.

php artisan serve
