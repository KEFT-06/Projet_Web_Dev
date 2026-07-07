#!/bin/bash

echo "========================================"
echo "  Démarrage du Backend Laravel"
echo "========================================"
echo ""

cd Mon_Miam_Miam

echo "Vérification du fichier .env..."
if [ ! -f .env ]; then
    echo "ERREUR: Le fichier .env n'existe pas!"
    echo "Veuillez créer le fichier .env en suivant CONFIGURATION_ENV.md"
    exit 1
fi

echo "Installation des dépendances..."
composer install

echo "Génération de la clé d'application..."
php artisan key:generate --force

echo "Création de la base de données..."
if [ ! -f database/database.sqlite ]; then
    touch database/database.sqlite
fi

echo "Exécution des migrations..."
php artisan migrate --force

echo ""
echo "========================================"
echo "  Démarrage du serveur Laravel"
echo "  URL: http://localhost:8000"
echo "========================================"
echo ""

php artisan serve

