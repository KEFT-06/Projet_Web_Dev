# 📋 Résumé de la Configuration - Connexion Backend Laravel ↔️ Frontend React

## ✅ Ce qui a été configuré

### 🔧 Fichiers Créés/Modifiés

| Fichier | Description | Statut |
|---------|-------------|--------|
| `Mon_Miam_Miam/bootstrap/app.php` | Middleware CORS et Sanctum configurés | ✅ Modifié |
| `Mon_Miam_Miam/config/cors.php` | Configuration CORS pour accepter le frontend | ✅ Créé |
| `Mon_Miam_Miam/config/sanctum.php` | Domaines stateful Sanctum mis à jour | ✅ Modifié |
| `setup-env.ps1` | Script PowerShell pour créer les .env (Windows) | ✅ Créé |
| `setup-env.sh` | Script Bash pour créer les .env (Linux/Mac) | ✅ Créé |
| `start-backend.bat` | Script de démarrage backend (Windows) | ✅ Créé |
| `start-backend.sh` | Script de démarrage backend (Linux/Mac) | ✅ Créé |
| `start-frontend.bat` | Script de démarrage frontend (Windows) | ✅ Créé |
| `start-frontend.sh` | Script de démarrage frontend (Linux/Mac) | ✅ Créé |
| `GUIDE_CONNEXION_LARAVEL_REACT.md` | Guide complet de connexion | ✅ Créé |
| `DEMARRAGE_RAPIDE.md` | Guide de démarrage rapide | ✅ Créé |
| `CONFIGURATION_ENV.md` | Documentation des variables .env | ✅ Créé |
| `README_CONNEXION.md` | Vue d'ensemble de la configuration | ✅ Créé |
| `INSTRUCTIONS_DEMARRAGE.txt` | Instructions de démarrage rapide | ✅ Créé |

### 🔐 Configuration Backend (Laravel)

```php
// Mon_Miam_Miam/bootstrap/app.php
✅ Routes API configurées
✅ Middleware CORS activé
✅ Middleware Sanctum pour requêtes stateful
✅ Alias pour middleware 'role'

// Mon_Miam_Miam/config/cors.php
✅ Chemins autorisés : api/*, sanctum/csrf-cookie
✅ Origines autorisées : http://localhost:3000
✅ Support des credentials : activé
✅ Méthodes : toutes autorisées

// Mon_Miam_Miam/config/sanctum.php
✅ Domaines stateful : localhost:3000, 127.0.0.1:3000
✅ Guards : web
✅ Expiration : null (pas d'expiration)
```

### 🎨 Configuration Frontend (React)

```typescript
// frontend/src/lib/api.ts
✅ BASE_URL configurée : VITE_API_URL || http://localhost:4000
✅ Fonctions d'authentification : apiLogin, apiSignup, apiMe
✅ Gestion automatique du token Bearer
✅ Fonctions pour commandes, utilisateurs, stats
```

## 📁 Architecture de la Connexion

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                           │
│                   http://localhost:3000                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  frontend/src/lib/api.ts                                        │
│  ├─ apiLogin(email, password)                                   │
│  ├─ apiSignup(userData)                                         │
│  ├─ apiCreateOrder(orderData, token)                            │
│  └─ ... autres fonctions API                                    │
│                                                                 │
│  Envoie des requêtes avec :                                     │
│  • Authorization: Bearer {token}                                │
│  • Content-Type: application/json                               │
│                                                                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ HTTP Requests
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Laravel)                          │
│                   http://localhost:8000                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Mon_Miam_Miam/routes/api.php                                   │
│  ├─ POST /api/auth/register (public)                            │
│  ├─ POST /api/auth/login (public)                               │
│  ├─ GET  /api/auth/me (protégé)                                 │
│  ├─ GET  /api/orders (protégé)                                  │
│  └─ ... autres routes                                           │
│                                                                 │
│  Middleware :                                                   │
│  ├─ CORS (accepte localhost:3000)                               │
│  ├─ Sanctum (vérifie le token)                                  │
│  └─ Role/Permission (vérifie les autorisations)                 │
│                                                                 │
│  Base de données : SQLite                                       │
│  └─ database/database.sqlite                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Étapes pour Démarrer

### 1️⃣ Première Installation

```bash
# 1. Créer les fichiers .env
Windows:    .\setup-env.ps1
Linux/Mac:  chmod +x setup-env.sh && ./setup-env.sh

# 2. Le script créera automatiquement :
#    ✓ Mon_Miam_Miam/.env
#    ✓ frontend/.env
```

### 2️⃣ Démarrage des Serveurs

**Terminal 1 - Backend :**
```bash
Windows:    start-backend.bat
Linux/Mac:  chmod +x start-backend.sh && ./start-backend.sh

# Le script va :
# ✓ Installer les dépendances Composer
# ✓ Générer la clé d'application
# ✓ Créer la base de données SQLite
# ✓ Exécuter les migrations
# ✓ Démarrer le serveur sur http://localhost:8000
```

**Terminal 2 - Frontend :**
```bash
Windows:    start-frontend.bat
Linux/Mac:  chmod +x start-frontend.sh && ./start-frontend.sh

# Le script va :
# ✓ Installer les dépendances npm
# ✓ Démarrer Vite sur http://localhost:3000
```

## 🔑 Variables d'Environnement Essentielles

### Backend (`Mon_Miam_Miam/.env`)

```env
APP_URL=http://localhost:8000
CORS_ALLOWED_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
SANCTUM_STATEFUL_DOMAINS="localhost:3000,127.0.0.1:3000"
FRONTEND_URL=http://localhost:3000
DB_CONNECTION=sqlite
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:8000
```

## 🔄 Flux d'Authentification

```
1. Utilisateur se connecte via le frontend
   ↓
2. Frontend envoie POST /api/auth/login { email, password }
   ↓
3. Backend vérifie les credentials
   ↓
4. Backend retourne { user, token }
   ↓
5. Frontend stocke le token (localStorage/state)
   ↓
6. Frontend envoie toutes les requêtes avec :
   Authorization: Bearer {token}
   ↓
7. Middleware Sanctum vérifie le token
   ↓
8. Middleware Role/Permission vérifie les autorisations
   ↓
9. Contrôleur traite la requête
   ↓
10. Backend retourne la réponse
```

## 📡 Routes API Disponibles

### Routes Publiques (pas de token requis)

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/public` - Test de connexion

### Routes Protégées (token requis)

#### Authentification
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Profil utilisateur

#### Commandes (Student)
- `GET /api/orders` - Liste des commandes
- `POST /api/orders` - Créer une commande
- `POST /api/orders/{id}/cancel` - Annuler une commande

#### Employés (Employee)
- `GET /api/orders/pending` - Commandes en attente
- `PATCH /api/orders/{id}/prepare` - Préparer une commande
- `PATCH /api/orders/{id}/complete` - Terminer une commande

#### Administration (Admin)
- `GET /api/menu` - Liste du menu
- `POST /api/menu` - Ajouter un item
- `GET /api/statistics/dashboard` - Tableau de bord
- `GET /api/employees` - Liste des employés

## 🧪 Tests de Connexion

### Test 1 : API Backend

```bash
# Dans un navigateur ou avec curl
curl http://localhost:8000/api/public

# Réponse attendue :
"Route publique 👋"
```

### Test 2 : Connexion depuis le Frontend

```typescript
import { apiLogin } from '@/lib/api';

const test = async () => {
  const { user, token } = await apiLogin('email@test.com', 'password');
  console.log('Token:', token);
  console.log('User:', user);
};
```

### Test 3 : Requête Protégée

```typescript
import { apiListOrders } from '@/lib/api';

const test = async () => {
  const token = 'your-token-here';
  const { orders } = await apiListOrders(token);
  console.log('Commandes:', orders);
};
```

## ⚠️ Dépannage

### ❌ Erreur CORS

**Symptôme :**
```
Access to fetch at 'http://localhost:8000/api/...' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Solution :**
1. Vérifiez `Mon_Miam_Miam/.env` :
   ```env
   CORS_ALLOWED_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
   ```
2. Redémarrez le serveur Laravel
3. Videz le cache : `php artisan config:clear`

### ❌ Token Non Reconnu

**Symptôme :**
```
401 Unauthorized
```

**Solution :**
1. Vérifiez que le token est dans l'en-tête :
   ```
   Authorization: Bearer {token}
   ```
2. Vérifiez que la route est protégée par `auth:sanctum`
3. Reconnectez-vous pour un nouveau token

### ❌ Connection Refused

**Symptôme :**
```
Failed to fetch
net::ERR_CONNECTION_REFUSED
```

**Solution :**
1. Assurez-vous que le backend tourne sur port 8000
2. Vérifiez `VITE_API_URL` dans `frontend/.env`
3. Vérifiez qu'aucun firewall ne bloque les connexions

## 📚 Documentation

| Document | Description |
|----------|-------------|
| `INSTRUCTIONS_DEMARRAGE.txt` | Instructions visuelles rapides |
| `DEMARRAGE_RAPIDE.md` | Guide de démarrage rapide |
| `README_CONNEXION.md` | Vue d'ensemble complète |
| `GUIDE_CONNEXION_LARAVEL_REACT.md` | Guide technique détaillé |
| `CONFIGURATION_ENV.md` | Configuration des variables d'environnement |

## ✨ Prochaines Étapes

1. ✅ Créer les fichiers .env
2. ✅ Démarrer le backend
3. ✅ Démarrer le frontend
4. ⏳ Créer un compte utilisateur
5. ⏳ Se connecter
6. ⏳ Tester les fonctionnalités

## 🎯 Résumé Technique

- **Backend :** Laravel 12 + Sanctum
- **Frontend :** React 18 + TypeScript + Vite
- **Base de données :** SQLite
- **Authentification :** Token Bearer (Sanctum)
- **CORS :** Configuré et fonctionnel
- **Routes API :** Toutes disponibles et protégées

---

✨ **Configuration terminée avec succès !** ✨

Pour démarrer, exécutez simplement :
1. `start-backend.bat` ou `./start-backend.sh`
2. `start-frontend.bat` ou `./start-frontend.sh`

