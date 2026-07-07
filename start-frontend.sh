#!/bin/bash

echo "========================================"
echo "  Démarrage du Frontend React"
echo "========================================"
echo ""

cd frontend

echo "Vérification du fichier .env..."
if [ ! -f .env ]; then
    echo "ERREUR: Le fichier .env n'existe pas!"
    echo "Veuillez créer le fichier .env en suivant CONFIGURATION_ENV.md"
    exit 1
fi

echo "Installation des dépendances..."
npm install

echo ""
echo "========================================"
echo "  Démarrage du serveur Vite"
echo "  URL: http://localhost:3000"
echo "========================================"
echo ""

npm run dev

