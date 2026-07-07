# Script de vérification de la configuration

Write-Host "╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                                  ║" -ForegroundColor Cyan
Write-Host "║           🔍 Vérification de la Configuration                    ║" -ForegroundColor Cyan
Write-Host "║                                                                  ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Vérifier PHP
Write-Host "📦 Vérification de PHP..." -ForegroundColor Yellow
try {
    $phpVersion = php -v 2>&1 | Select-String -Pattern "PHP (\d+\.\d+)"
    if ($phpVersion -match "PHP (\d+\.\d+)") {
        $version = [version]$matches[1]
        if ($version -ge [version]"8.2") {
            Write-Host "   ✅ PHP $($matches[1]) installé" -ForegroundColor Green
        } else {
            Write-Host "   ❌ PHP $($matches[1]) détecté (version 8.2+ requise)" -ForegroundColor Red
            $allGood = $false
        }
    }
} catch {
    Write-Host "   ❌ PHP non installé ou non accessible" -ForegroundColor Red
    $allGood = $false
}

# Vérifier Composer
Write-Host "📦 Vérification de Composer..." -ForegroundColor Yellow
try {
    $composerVersion = composer -V 2>&1 | Select-String -Pattern "Composer"
    if ($composerVersion) {
        Write-Host "   ✅ Composer installé" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Composer non installé ou non accessible" -ForegroundColor Red
    $allGood = $false
}

# Vérifier Node.js
Write-Host "📦 Vérification de Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node -v 2>&1
    if ($nodeVersion -match "v(\d+)\.") {
        $version = [int]$matches[1]
        if ($version -ge 18) {
            Write-Host "   ✅ Node.js $nodeVersion installé" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Node.js $nodeVersion détecté (version 18+ requise)" -ForegroundColor Red
            $allGood = $false
        }
    }
} catch {
    Write-Host "   ❌ Node.js non installé ou non accessible" -ForegroundColor Red
    $allGood = $false
}

# Vérifier npm
Write-Host "📦 Vérification de npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm -v 2>&1
    if ($npmVersion) {
        Write-Host "   ✅ npm $npmVersion installé" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ npm non installé ou non accessible" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""
Write-Host "══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Vérifier les fichiers de configuration
Write-Host "📁 Vérification des fichiers de configuration..." -ForegroundColor Yellow

# Backend .env
if (Test-Path "Mon_Miam_Miam\.env") {
    Write-Host "   ✅ Mon_Miam_Miam\.env existe" -ForegroundColor Green
    
    # Vérifier les variables importantes
    $envContent = Get-Content "Mon_Miam_Miam\.env" -Raw
    
    if ($envContent -match "CORS_ALLOWED_ORIGINS") {
        Write-Host "      ✓ CORS_ALLOWED_ORIGINS configuré" -ForegroundColor Gray
    } else {
        Write-Host "      ⚠ CORS_ALLOWED_ORIGINS manquant" -ForegroundColor Yellow
    }
    
    if ($envContent -match "SANCTUM_STATEFUL_DOMAINS") {
        Write-Host "      ✓ SANCTUM_STATEFUL_DOMAINS configuré" -ForegroundColor Gray
    } else {
        Write-Host "      ⚠ SANCTUM_STATEFUL_DOMAINS manquant" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Mon_Miam_Miam\.env n'existe pas" -ForegroundColor Red
    Write-Host "      → Exécutez: .\setup-env.ps1" -ForegroundColor Yellow
    $allGood = $false
}

# Frontend .env
if (Test-Path "frontend\.env") {
    Write-Host "   ✅ frontend\.env existe" -ForegroundColor Green
    
    $envContent = Get-Content "frontend\.env" -Raw
    if ($envContent -match "VITE_API_URL") {
        Write-Host "      ✓ VITE_API_URL configuré" -ForegroundColor Gray
    } else {
        Write-Host "      ⚠ VITE_API_URL manquant" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ frontend\.env n'existe pas" -ForegroundColor Red
    Write-Host "      → Exécutez: .\setup-env.ps1" -ForegroundColor Yellow
    $allGood = $false
}

# Vérifier les fichiers de configuration Laravel
if (Test-Path "Mon_Miam_Miam\config\cors.php") {
    Write-Host "   ✅ config\cors.php existe" -ForegroundColor Green
} else {
    Write-Host "   ❌ config\cors.php manquant" -ForegroundColor Red
    $allGood = $false
}

# Vérifier la base de données
if (Test-Path "Mon_Miam_Miam\database\database.sqlite") {
    Write-Host "   ✅ Base de données SQLite existe" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Base de données SQLite n'existe pas encore" -ForegroundColor Yellow
    Write-Host "      → Elle sera créée au premier démarrage" -ForegroundColor Gray
}

Write-Host ""
Write-Host "══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Résultat final
if ($allGood) {
    Write-Host "✨ Configuration valide ! Vous pouvez démarrer l'application ✨" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines étapes :" -ForegroundColor Yellow
    Write-Host "  1. Terminal 1: .\start-backend.bat" -ForegroundColor White
    Write-Host "  2. Terminal 2: .\start-frontend.bat" -ForegroundColor White
} else {
    Write-Host "❌ Certains problèmes doivent être résolus" -ForegroundColor Red
    Write-Host ""
    Write-Host "Consultez la documentation :" -ForegroundColor Yellow
    Write-Host "  - INSTRUCTIONS_DEMARRAGE.txt" -ForegroundColor White
    Write-Host "  - DEMARRAGE_RAPIDE.md" -ForegroundColor White
}

Write-Host ""
Write-Host "══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Pause

