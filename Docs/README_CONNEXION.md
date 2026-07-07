# 🔗 Connexion Backend Laravel + Frontend React

Ce document résume la configuration de connexion entre le backend Laravel et le frontend React de Mon Miam Miam.

## 📁 Structure du Projet

```
Project-DEV-WEB/
├── Mon_Miam_Miam/          # Backend Laravel
│   ├── app/
│   ├── config/
│   │   ├── cors.php        # ✅ Configuration CORS
│   │   └── sanctum.php     # ✅ Configuration Sanctum
│   ├── routes/
│   │   └── api.php         # Routes API
│   └── .env                # ⚠️ À créer
│
├── frontend/               # Frontend React
│   ├── src/
│   │   └── lib/
│   │       └── api.ts      # ✅ Client API configuré
│   └── .env                # ⚠️ À créer
│
├── setup-env.ps1           # Script Windows pour créer les .env
├── setup-env.sh            # Script Linux/Mac pour créer les .env
├── start-backend.bat       # Lancer le backend (Windows)
├── start-backend.sh        # Lancer le backend (Linux/Mac)
├── start-frontend.bat      # Lancer le frontend (Windows)
├── start-frontend.sh       # Lancer le frontend (Linux/Mac)
├── DEMARRAGE_RAPIDE.md     # Guide de démarrage rapide
└── GUIDE_CONNEXION_LARAVEL_REACT.md  # Guide complet
```

## 🚀 Démarrage en 3 Étapes

### 1️⃣ Créer les fichiers .env

**Windows (PowerShell) :**
```powershell
.\setup-env.ps1
```

**Linux/Mac :**
```bash
chmod +x setup-env.sh
./setup-env.sh
```

### 2️⃣ Lancer le Backend

**Windows :**
```bash
start-backend.bat
```

**Linux/Mac :**
```bash
chmod +x start-backend.sh
./start-backend.sh
```

### 3️⃣ Lancer le Frontend (nouveau terminal)

**Windows :**
```bash
start-frontend.bat
```

**Linux/Mac :**
```bash
chmod +x start-frontend.sh
./start-frontend.sh
```

## ✅ Configuration Effectuée

### Backend Laravel

1. ✅ **CORS configuré** - `Mon_Miam_Miam/config/cors.php`
   - Accepte les requêtes depuis `http://localhost:3000`
   - Support des credentials (cookies/tokens)

2. ✅ **Sanctum configuré** - `Mon_Miam_Miam/config/sanctum.php`
   - Domaines stateful : `localhost:3000`, `127.0.0.1:3000`
   - Authentification par token Bearer

3. ✅ **Routes API** - `Mon_Miam_Miam/routes/api.php`
   - Routes publiques : `/api/auth/register`, `/api/auth/login`
   - Routes protégées : nécessitent un token `auth:sanctum`

4. ✅ **Middleware configuré** - `Mon_Miam_Miam/bootstrap/app.php`
   - CORS middleware activé
   - Sanctum middleware pour les requêtes stateful

### Frontend React

1. ✅ **Client API** - `frontend/src/lib/api.ts`
   - Base URL configurée via `VITE_API_URL`
   - Fonctions d'authentification : `apiLogin()`, `apiSignup()`
   - Gestion automatique du token Bearer
   - Fonctions pour les commandes, utilisateurs, stats, etc.

2. ✅ **Variables d'environnement**
   - `VITE_API_URL=http://localhost:8000`

## 🔐 Flux d'Authentification

```
┌─────────────┐                    ┌─────────────┐
│   Frontend  │                    │   Backend   │
│   React     │                    │   Laravel   │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │  POST /api/auth/login            │
       │  { email, password }             │
       ├─────────────────────────────────>│
       │                                  │
       │  { user, token }                 │
       │<─────────────────────────────────┤
       │                                  │
       │  Stocke le token                 │
       │  (localStorage/cookie)           │
       │                                  │
       │  GET /api/orders                 │
       │  Authorization: Bearer {token}   │
       ├─────────────────────────────────>│
       │                                  │
       │  Vérifie le token (Sanctum)      │
       │                                  │
       │  { orders: [...] }               │
       │<─────────────────────────────────┤
       │                                  │
```

## 📡 Exemple d'Utilisation de l'API

### Connexion

```typescript
import { apiLogin } from '@/lib/api';

const login = async () => {
  try {
    const { user, token } = await apiLogin('email@example.com', 'password');
    
    // Stocker le token
    localStorage.setItem('token', token);
    
    console.log('Connecté:', user);
  } catch (error) {
    console.error('Erreur de connexion:', error);
  }
};
```

### Récupérer les commandes

```typescript
import { apiListOrders } from '@/lib/api';

const fetchOrders = async () => {
  const token = localStorage.getItem('token');
  
  try {
    const { orders } = await apiListOrders(token);
    console.log('Commandes:', orders);
  } catch (error) {
    console.error('Erreur:', error);
  }
};
```

## 🔧 URLs par Défaut

| Service | URL | Description |
|---------|-----|-------------|
| Frontend React | http://localhost:3000 | Interface utilisateur |
| Backend Laravel | http://localhost:8000 | API REST |
| API Routes | http://localhost:8000/api/* | Endpoints API |
| Test API | http://localhost:8000/api/public | Route publique de test |

## 📚 Documentation

- **[DEMARRAGE_RAPIDE.md](DEMARRAGE_RAPIDE.md)** - Pour démarrer rapidement
- **[GUIDE_CONNEXION_LARAVEL_REACT.md](GUIDE_CONNEXION_LARAVEL_REACT.md)** - Guide détaillé complet
- **[CONFIGURATION_ENV.md](Mon_Miam_Miam/CONFIGURATION_ENV.md)** - Détails des variables d'environnement

## ⚠️ Points Importants

1. **Les deux serveurs doivent être lancés** pour que l'application fonctionne
2. **Le backend doit démarrer en premier** (port 8000)
3. **Ne committez jamais les fichiers .env** dans Git (déjà dans .gitignore)
4. **Tokens Sanctum** : stockés côté frontend, validés côté backend
5. **CORS** : configuré pour accepter uniquement localhost:3000

## 🆘 Problèmes Courants

### Erreur CORS
```
Access to fetch at 'http://localhost:8000/api/...' has been blocked by CORS policy
```
**Solution :** Vérifiez que `CORS_ALLOWED_ORIGINS` dans `Mon_Miam_Miam/.env` contient `http://localhost:3000`

### Token non reconnu
```
401 Unauthorized
```
**Solution :** 
1. Vérifiez que le token est bien envoyé dans l'en-tête `Authorization: Bearer {token}`
2. Vérifiez que la route est protégée par `auth:sanctum`
3. Reconnectez-vous pour obtenir un nouveau token

### Connection Refused
```
Failed to fetch
```
**Solution :** Assurez-vous que le serveur Laravel tourne sur http://localhost:8000

## 🎯 Technologies Utilisées

- **Backend :** Laravel 12, Sanctum, SQLite
- **Frontend :** React 18, TypeScript, Vite
- **Authentification :** Laravel Sanctum (Token-based)
- **API :** RESTful API

---

**Besoin d'aide ?** Consultez les logs Laravel dans `Mon_Miam_Miam/storage/logs/laravel.log`

