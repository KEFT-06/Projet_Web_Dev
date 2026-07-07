#!/bin/bash

# Script Bash pour créer les fichiers .env

echo "========================================"
echo "  Configuration des fichiers .env"
echo "========================================"
echo ""

# Créer le fichier .env pour Laravel
LARAVEL_ENV_PATH="Mon_Miam_Miam/.env"
LARAVEL_ENV_CONTENT='APP_NAME="Mon Miam Miam"
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
MAIL_FROM_NAME="${APP_NAME}"

# CORS Configuration
CORS_ALLOWED_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"

# Sanctum Configuration
SANCTUM_STATEFUL_DOMAINS="localhost:3000,127.0.0.1:3000"
SESSION_DOMAIN=localhost

# Frontend URL
FRONTEND_URL=http://localhost:3000'

if [ -f "$LARAVEL_ENV_PATH" ]; then
    echo "Le fichier $LARAVEL_ENV_PATH existe déjà."
    read -p "Voulez-vous le remplacer ? (O/N): " overwrite
    if [ "$overwrite" = "O" ] || [ "$overwrite" = "o" ]; then
        echo "$LARAVEL_ENV_CONTENT" > "$LARAVEL_ENV_PATH"
        echo "✓ Fichier $LARAVEL_ENV_PATH créé avec succès!"
    else
        echo "× Fichier $LARAVEL_ENV_PATH non modifié."
    fi
else
    echo "$LARAVEL_ENV_CONTENT" > "$LARAVEL_ENV_PATH"
    echo "✓ Fichier $LARAVEL_ENV_PATH créé avec succès!"
fi

echo ""

# Créer le fichier .env pour React
FRONTEND_ENV_PATH="frontend/.env"
FRONTEND_ENV_CONTENT='# URL de l'\''API Laravel
VITE_API_URL=http://localhost:8000'

if [ -f "$FRONTEND_ENV_PATH" ]; then
    echo "Le fichier $FRONTEND_ENV_PATH existe déjà."
    read -p "Voulez-vous le remplacer ? (O/N): " overwrite
    if [ "$overwrite" = "O" ] || [ "$overwrite" = "o" ]; then
        echo "$FRONTEND_ENV_CONTENT" > "$FRONTEND_ENV_PATH"
        echo "✓ Fichier $FRONTEND_ENV_PATH créé avec succès!"
    else
        echo "× Fichier $FRONTEND_ENV_PATH non modifié."
    fi
else
    echo "$FRONTEND_ENV_CONTENT" > "$FRONTEND_ENV_PATH"
    echo "✓ Fichier $FRONTEND_ENV_PATH créé avec succès!"
fi

echo ""
echo "========================================"
echo "  Configuration terminée!"
echo "========================================"
echo ""
echo "Prochaines étapes :"
echo "1. Lancez le backend avec: ./start-backend.sh"
echo "2. Dans un autre terminal, lancez le frontend avec: ./start-frontend.sh"
echo ""
echo "Consultez DEMARRAGE_RAPIDE.md pour plus d'informations."
echo ""

