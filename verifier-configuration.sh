#!/bin/bash

# Script de vérification de la configuration

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                                                                  ║"
echo "║           🔍 Vérification de la Configuration                    ║"
echo "║                                                                  ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

allGood=true

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# Vérifier PHP
echo -e "${YELLOW}📦 Vérification de PHP...${NC}"
if command -v php &> /dev/null; then
    phpVersion=$(php -v | grep -oP 'PHP \K[0-9]+\.[0-9]+' | head -1)
    majorVersion=$(echo $phpVersion | cut -d'.' -f1)
    minorVersion=$(echo $phpVersion | cut -d'.' -f2)
    
    if [ "$majorVersion" -ge 8 ] && [ "$minorVersion" -ge 2 ]; then
        echo -e "   ${GREEN}✅ PHP $phpVersion installé${NC}"
    else
        echo -e "   ${RED}❌ PHP $phpVersion détecté (version 8.2+ requise)${NC}"
        allGood=false
    fi
else
    echo -e "   ${RED}❌ PHP non installé ou non accessible${NC}"
    allGood=false
fi

# Vérifier Composer
echo -e "${YELLOW}📦 Vérification de Composer...${NC}"
if command -v composer &> /dev/null; then
    echo -e "   ${GREEN}✅ Composer installé${NC}"
else
    echo -e "   ${RED}❌ Composer non installé ou non accessible${NC}"
    allGood=false
fi

# Vérifier Node.js
echo -e "${YELLOW}📦 Vérification de Node.js...${NC}"
if command -v node &> /dev/null; then
    nodeVersion=$(node -v)
    majorVersion=$(echo $nodeVersion | cut -d'.' -f1 | sed 's/v//')
    
    if [ "$majorVersion" -ge 18 ]; then
        echo -e "   ${GREEN}✅ Node.js $nodeVersion installé${NC}"
    else
        echo -e "   ${RED}❌ Node.js $nodeVersion détecté (version 18+ requise)${NC}"
        allGood=false
    fi
else
    echo -e "   ${RED}❌ Node.js non installé ou non accessible${NC}"
    allGood=false
fi

# Vérifier npm
echo -e "${YELLOW}📦 Vérification de npm...${NC}"
if command -v npm &> /dev/null; then
    npmVersion=$(npm -v)
    echo -e "   ${GREEN}✅ npm $npmVersion installé${NC}"
else
    echo -e "   ${RED}❌ npm non installé ou non accessible${NC}"
    allGood=false
fi

echo ""
echo "══════════════════════════════════════════════════════════════════"
echo ""

# Vérifier les fichiers de configuration
echo -e "${YELLOW}📁 Vérification des fichiers de configuration...${NC}"

# Backend .env
if [ -f "Mon_Miam_Miam/.env" ]; then
    echo -e "   ${GREEN}✅ Mon_Miam_Miam/.env existe${NC}"
    
    if grep -q "CORS_ALLOWED_ORIGINS" "Mon_Miam_Miam/.env"; then
        echo -e "      ${GRAY}✓ CORS_ALLOWED_ORIGINS configuré${NC}"
    else
        echo -e "      ${YELLOW}⚠ CORS_ALLOWED_ORIGINS manquant${NC}"
    fi
    
    if grep -q "SANCTUM_STATEFUL_DOMAINS" "Mon_Miam_Miam/.env"; then
        echo -e "      ${GRAY}✓ SANCTUM_STATEFUL_DOMAINS configuré${NC}"
    else
        echo -e "      ${YELLOW}⚠ SANCTUM_STATEFUL_DOMAINS manquant${NC}"
    fi
else
    echo -e "   ${RED}❌ Mon_Miam_Miam/.env n'existe pas${NC}"
    echo -e "      ${YELLOW}→ Exécutez: ./setup-env.sh${NC}"
    allGood=false
fi

# Frontend .env
if [ -f "frontend/.env" ]; then
    echo -e "   ${GREEN}✅ frontend/.env existe${NC}"
    
    if grep -q "VITE_API_URL" "frontend/.env"; then
        echo -e "      ${GRAY}✓ VITE_API_URL configuré${NC}"
    else
        echo -e "      ${YELLOW}⚠ VITE_API_URL manquant${NC}"
    fi
else
    echo -e "   ${RED}❌ frontend/.env n'existe pas${NC}"
    echo -e "      ${YELLOW}→ Exécutez: ./setup-env.sh${NC}"
    allGood=false
fi

# Vérifier les fichiers de configuration Laravel
if [ -f "Mon_Miam_Miam/config/cors.php" ]; then
    echo -e "   ${GREEN}✅ config/cors.php existe${NC}"
else
    echo -e "   ${RED}❌ config/cors.php manquant${NC}"
    allGood=false
fi

# Vérifier la base de données
if [ -f "Mon_Miam_Miam/database/database.sqlite" ]; then
    echo -e "   ${GREEN}✅ Base de données SQLite existe${NC}"
else
    echo -e "   ${YELLOW}⚠ Base de données SQLite n'existe pas encore${NC}"
    echo -e "      ${GRAY}→ Elle sera créée au premier démarrage${NC}"
fi

echo ""
echo "══════════════════════════════════════════════════════════════════"
echo ""

# Résultat final
if [ "$allGood" = true ]; then
    echo -e "${GREEN}✨ Configuration valide ! Vous pouvez démarrer l'application ✨${NC}"
    echo ""
    echo -e "${YELLOW}Prochaines étapes :${NC}"
    echo -e "  ${NC}1. Terminal 1: ./start-backend.sh${NC}"
    echo -e "  ${NC}2. Terminal 2: ./start-frontend.sh${NC}"
else
    echo -e "${RED}❌ Certains problèmes doivent être résolus${NC}"
    echo ""
    echo -e "${YELLOW}Consultez la documentation :${NC}"
    echo -e "  ${NC}- INSTRUCTIONS_DEMARRAGE.txt${NC}"
    echo -e "  ${NC}- DEMARRAGE_RAPIDE.md${NC}"
fi

echo ""
echo "══════════════════════════════════════════════════════════════════"
echo ""

