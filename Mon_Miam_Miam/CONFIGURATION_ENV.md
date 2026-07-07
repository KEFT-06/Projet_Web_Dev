# Configuration des fichiers .env

## Backend Laravel (.env)

Créez un fichier `.env` dans le dossier `Mon_Miam_Miam/` avec le contenu suivant :

```env
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
MAIL_FROM_NAME="${APP_NAME}"

# CORS Configuration
CORS_ALLOWED_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"

# Sanctum Configuration
SANCTUM_STATEFUL_DOMAINS="localhost:3000,127.0.0.1:3000"
SESSION_DOMAIN=localhost

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## Frontend React (.env)

Créez un fichier `.env` dans le dossier `frontend/` avec le contenu suivant :

```env
# URL de l'API Laravel
VITE_API_URL=http://localhost:8000
```

