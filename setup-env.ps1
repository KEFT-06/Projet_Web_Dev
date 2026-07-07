# Script PowerShell pour créer les fichiers .env

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configuration des fichiers .env" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Créer le fichier .env pour Laravel
$laravelEnvPath = "Mon_Miam_Miam\.env"
$laravelEnvContent = @"
APP_NAME="Mon Miam Miam"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_TIMEZONE=UTC
APP_URL=http://localhost:8000

APP_LOCALE=fr
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=fr_FR

APP_MAINTENANCE_DRIVER=file

PHP_CLI_SERVER_WORKERS=4

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=sqlite

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=database
CACHE_PREFIX=

MAIL_MAILER=log
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME=`"`${APP_NAME}`"

# CORS Configuration
CORS_ALLOWED_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"

# Sanctum Configuration
SANCTUM_STATEFUL_DOMAINS="localhost:3000,127.0.0.1:3000"
SESSION_DOMAIN=localhost

# Frontend URL
FRONTEND_URL=http://localhost:3000
"@

if (Test-Path $laravelEnvPath) {
    Write-Host "Le fichier $laravelEnvPath existe déjà." -ForegroundColor Yellow
    $overwrite = Read-Host "Voulez-vous le remplacer ? (O/N)"
    if ($overwrite -eq "O" -or $overwrite -eq "o") {
        $laravelEnvContent | Out-File -FilePath $laravelEnvPath -Encoding UTF8
        Write-Host "✓ Fichier $laravelEnvPath créé avec succès!" -ForegroundColor Green
    } else {
        Write-Host "× Fichier $laravelEnvPath non modifié." -ForegroundColor Yellow
    }
} else {
    $laravelEnvContent | Out-File -FilePath $laravelEnvPath -Encoding UTF8
    Write-Host "✓ Fichier $laravelEnvPath créé avec succès!" -ForegroundColor Green
}

Write-Host ""

# Créer le fichier .env pour React
$frontendEnvPath = "frontend\.env"
$frontendEnvContent = @"
# URL de l'API Laravel
VITE_API_URL=http://localhost:8000
"@

if (Test-Path $frontendEnvPath) {
    Write-Host "Le fichier $frontendEnvPath existe déjà." -ForegroundColor Yellow
    $overwrite = Read-Host "Voulez-vous le remplacer ? (O/N)"
    if ($overwrite -eq "O" -or $overwrite -eq "o") {
        $frontendEnvContent | Out-File -FilePath $frontendEnvPath -Encoding UTF8
        Write-Host "✓ Fichier $frontendEnvPath créé avec succès!" -ForegroundColor Green
    } else {
        Write-Host "× Fichier $frontendEnvPath non modifié." -ForegroundColor Yellow
    }
} else {
    $frontendEnvContent | Out-File -FilePath $frontendEnvPath -Encoding UTF8
    Write-Host "✓ Fichier $frontendEnvPath créé avec succès!" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configuration terminée!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prochaines étapes :" -ForegroundColor Yellow
Write-Host "1. Lancez le backend avec: .\start-backend.bat" -ForegroundColor White
Write-Host "2. Dans un autre terminal, lancez le frontend avec: .\start-frontend.bat" -ForegroundColor White
Write-Host ""
Write-Host "Consultez DEMARRAGE_RAPIDE.md pour plus d'informations." -ForegroundColor Cyan
Write-Host ""

Pause

