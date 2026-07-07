# 🚀 Guide de Connexion Backend Laravel + Frontend React

Ce guide vous explique comment connecter votre backend Laravel (dans `Mon_Miam_Miam/`) avec votre frontend React (dans `frontend/`).

## 📋 Prérequis

- PHP 8.2 ou supérieur
- Composer
- Node.js 18+ et npm
- SQLite (ou autre base de données)

## 🔧 Configuration Étape par Étape

### 1️⃣ Configuration du Backend Laravel

#### A. Créer le fichier .env

Créez un fichier `.env` dans le dossier `Mon_Miam_Miam/` :

```bash
cd Mon_Miam_Miam
```

Copiez le contenu depuis `CONFIGURATION_ENV.md` ou créez-le avec ces variables essentielles :

```env
APP_NAME="Mon Miam Miam"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql

# CORS Configuration
CORS_ALLOWED_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"

# Sanctum Configuration
SANCTUM_STATEFUL_DOMAINS="localhost:3000,127.0.0.1:3000"
SESSION_DOMAIN=localhost

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

#### B. Installer les dépendances et configurer Laravel

```bash
# Installer les dépendances PHP
composer install

# Générer la clé d'application
php artisan key:generate

# Créer la base de données SQLite si elle n'existe pas
touch database/database.sqlite

# Exécuter les migrations
php artisan migrate

# Exécuter les seeders (pour créer les rôles et permissions)
php artisan db:seed
```

#### C. Vérifier la configuration Sanctum

Le fichier `config/sanctum.php` doit inclure vos domaines frontend dans les domaines stateful.
Les domaines sont déjà configurés via le fichier `.env`.

### 2️⃣ Configuration du Frontend React

#### A. Créer le fichier .env

Créez un fichier `.env` dans le dossier `frontend/` :

```bash
cd frontend
```

Avec le contenu suivant :

```env
VITE_API_URL=http://localhost:8000
```

#### B. Installer les dépendances

```bash
npm install
```

## 🚀 Démarrage des Serveurs

### Terminal 1 : Backend Laravel

```bash
cd Mon_Miam_Miam
php artisan serve
```

Le serveur Laravel démarrera sur `http://localhost:8000`

### Terminal 2 : Frontend React

```bash
cd frontend
npm run dev
```

Le serveur Vite démarrera sur `http://localhost:3000`

## 🔐 Authentification avec Sanctum

### Comment fonctionne l'authentification ?

1. **Inscription/Connexion** : L'utilisateur s'inscrit ou se connecte via `/api/auth/register` ou `/api/auth/login`
2. **Token** : Laravel Sanctum retourne un token d'authentification
3. **Requêtes authentifiées** : Le frontend envoie ce token dans l'en-tête `Authorization: Bearer {token}`

### Routes API Disponibles

#### Routes Publiques

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

#### Routes Protégées (nécessitent un token)

- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Obtenir les infos de l'utilisateur connecté
- `GET /api/orders` - Liste des commandes
- `POST /api/orders` - Créer une commande
- Et bien d'autres... (voir `Mon_Miam_Miam/routes/api.php`)

## 🔍 Vérification de la Connexion

### 1. Tester l'API

Ouvrez votre navigateur ou Postman et testez :

```
GET http://localhost:8000/api/public
```

Vous devriez recevoir : `"Route publique 👋"`

### 2. Tester depuis le Frontend

Dans votre application React, la connexion API se fait via `frontend/src/lib/api.ts`.

Exemple de connexion :

```typescript
import { apiLogin } from '@/lib/api';

const handleLogin = async () => {
  try {
    const response = await apiLogin('email@example.com', 'password');
    console.log('Connexion réussie:', response);
    // Stockez le token : response.token
  } catch (error) {
    console.error('Erreur de connexion:', error);
  }
};
```

## ⚠️ Problèmes Courants

### Erreur CORS

Si vous rencontrez des erreurs CORS :

1. Vérifiez que `CORS_ALLOWED_ORIGINS` dans `.env` contient l'URL de votre frontend
2. Vérifiez que `SANCTUM_STATEFUL_DOMAINS` est correctement configuré
3. Assurez-vous que le fichier `config/cors.php` existe et est correctement configuré

### Token non reconnu

1. Vérifiez que vous envoyez le token dans l'en-tête : `Authorization: Bearer {token}`
2. Vérifiez que le middleware `auth:sanctum` est appliqué aux routes protégées
3. Vérifiez que le token n'a pas expiré

### Base de données

Si les migrations échouent :

```bash
# Réinitialiser la base de données
php artisan migrate:fresh --seed
```

## 📝 Structure des Requêtes

### Exemple de requête avec token

```typescript
const token = 'votre-token-ici';

fetch('http://localhost:8000/api/orders', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
  }
})
  .then(response => response.json())
  .then(data => console.log(data));
```

### Exemple avec la fonction api.ts

```typescript
import { apiCreateOrder } from '@/lib/api';

const createOrder = async () => {
  const token = localStorage.getItem('token'); // ou votre système de stockage
  
  try {
    const order = await apiCreateOrder({
      items: [
        { id: '1', name: 'Pizza', price: 12.99, quantity: 1 }
      ],
      deliveryMode: 'delivery',
      comment: 'Extra fromage'
    }, token);
    
    console.log('Commande créée:', order);
  } catch (error) {
    console.error('Erreur:', error);
  }
};
```

## 🎯 Prochaines Étapes

1. ✅ Créer un compte utilisateur via l'interface
2. ✅ Tester la connexion
3. ✅ Créer une commande
4. ✅ Vérifier les différents rôles (student, employee, admin)

## 📚 Ressources

- [Documentation Laravel](https://laravel.com/docs)
- [Documentation Sanctum](https://laravel.com/docs/sanctum)
- [Documentation Vite](https://vitejs.dev/)
- [Documentation React](https://react.dev/)

---

**Besoin d'aide ?** Vérifiez les logs Laravel dans `Mon_Miam_Miam/storage/logs/laravel.log`

