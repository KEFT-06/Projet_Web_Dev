# 🚀 Démarrage Rapide

Ce guide vous permet de démarrer rapidement le projet Mon Miam Miam (Backend Laravel + Frontend React).

## ⚡ Installation Rapide (Première utilisation)

### 1. Créer les fichiers .env

#### Backend Laravel

Créez le fichier `Mon_Miam_Miam/.env` avec ce contenu minimal :

```env
APP_NAME="Mon Miam Miam"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite

CORS_ALLOWED_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
SANCTUM_STATEFUL_DOMAINS="localhost:3000,127.0.0.1:3000"
SESSION_DOMAIN=localhost
FRONTEND_URL=http://localhost:3000
```

#### Frontend React

Créez le fichier `frontend/.env` avec ce contenu :

```env
VITE_API_URL=http://localhost:8000
```

### 2. Lancer le Backend

**Windows :**
```bash
start-backend.bat
```

**Linux/Mac :**
```bash
chmod +x start-backend.sh
./start-backend.sh
```

Le backend sera accessible sur : `http://localhost:8000`

### 3. Lancer le Frontend (dans un autre terminal)

**Windows :**
```bash
start-frontend.bat
```

**Linux/Mac :**
```bash
chmod +x start-frontend.sh
./start-frontend.sh
```

Le frontend sera accessible sur : `http://localhost:3000`

## 🎯 Utilisation Quotidienne

Une fois l'installation initiale terminée, vous devez simplement :

1. **Terminal 1** : Lancer le backend avec `start-backend.bat` ou `./start-backend.sh`
2. **Terminal 2** : Lancer le frontend avec `start-frontend.bat` ou `./start-frontend.sh`

## 📝 Commandes Manuelles

Si vous préférez lancer manuellement :

### Backend
```bash
cd Mon_Miam_Miam
php artisan serve
```

### Frontend
```bash
cd frontend
npm run dev
```

## 🔑 Créer un Compte Administrateur

Pour créer un compte admin initial, exécutez dans le terminal Laravel :

```bash
cd Mon_Miam_Miam
php artisan tinker
```

Puis dans la console Tinker :

```php
$user = App\Models\User::create([
    'first_name' => 'Admin',
    'last_name' => 'System',
    'email' => 'admin@monmiammiam.com',
    'password' => bcrypt('admin123'),
    'role' => 'admin'
]);

// Assigner le rôle admin
$adminRole = App\Models\Role::where('name', 'admin')->first();
if ($adminRole) {
    $user->roles()->attach($adminRole->id);
}

echo "Utilisateur admin créé avec succès!\n";
echo "Email: admin@monmiammiam.com\n";
echo "Mot de passe: admin123\n";

exit
```

## 🧪 Tester la Connexion

Ouvrez votre navigateur et allez sur :

- Frontend : http://localhost:3000
- Backend API : http://localhost:8000/api/public

La route `/api/public` devrait retourner : `"Route publique 👋"`

## 📚 Documentation Complète

Pour plus de détails, consultez :
- `GUIDE_CONNEXION_LARAVEL_REACT.md` - Guide complet
- `CONFIGURATION_ENV.md` - Configuration détaillée des .env

## ⚠️ Résolution des Problèmes

### Le backend ne démarre pas
- Vérifiez que PHP 8.2+ est installé : `php -v`
- Vérifiez que Composer est installé : `composer -V`
- Vérifiez que le fichier `.env` existe dans `Mon_Miam_Miam/`

### Le frontend ne démarre pas
- Vérifiez que Node.js 18+ est installé : `node -v`
- Vérifiez que npm est installé : `npm -v`
- Vérifiez que le fichier `.env` existe dans `frontend/`

### Erreur de connexion API
- Assurez-vous que les deux serveurs sont démarrés
- Vérifiez que les URLs dans les fichiers `.env` correspondent aux ports utilisés
- Vérifiez les logs Laravel : `Mon_Miam_Miam/storage/logs/laravel.log`

### Erreur CORS
- Vérifiez que `CORS_ALLOWED_ORIGINS` dans `Mon_Miam_Miam/.env` contient `http://localhost:3000`
- Redémarrez le serveur Laravel après modification du `.env`

## 🛠️ Commandes Utiles

### Backend Laravel

```bash
# Réinitialiser la base de données
php artisan migrate:fresh --seed

# Vider le cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Voir toutes les routes API
php artisan route:list --path=api
```

### Frontend React

```bash
# Construire pour la production
npm run build

# Prévisualiser le build de production
npm run preview
```

---

**Bon développement ! 🎉**

