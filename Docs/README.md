# 🍴 Mon Miam Miam - Système de Restauration Universitaire

Application complète de gestion de restauration universitaire avec backend Laravel et frontend React.

## 📋 Vue d'ensemble

Mon Miam Miam est une plateforme permettant aux étudiants de commander des repas, de gérer leur programme de fidélité et de suivre leurs commandes en temps réel. Le système inclut également des interfaces pour les employés, managers et administrateurs.

### 🏗️ Architecture

```
Project-DEV-WEB/
├── Mon_Miam_Miam/          # Backend Laravel (API REST)
├── frontend/               # Frontend React (Interface utilisateur)
└── Documentation/          # Guides et scripts de démarrage
```

## 🚀 Démarrage Rapide

### 1️⃣ Vérifier les prérequis

**Windows :**
```powershell
.\verifier-configuration.ps1
```

**Linux/Mac :**
```bash
chmod +x verifier-configuration.sh
./verifier-configuration.sh
```

### 2️⃣ Configuration automatique

**Windows :**
```powershell
.\setup-env.ps1
```

**Linux/Mac :**
```bash
chmod +x setup-env.sh
./setup-env.sh
```

### 3️⃣ Lancer l'application

**Terminal 1 - Backend :**
```bash
# Windows
start-backend.bat

# Linux/Mac
chmod +x start-backend.sh && ./start-backend.sh
```

**Terminal 2 - Frontend :**
```bash
# Windows
start-frontend.bat

# Linux/Mac
chmod +x start-frontend.sh && ./start-frontend.sh
```

### 4️⃣ Accéder à l'application

- **Frontend :** http://localhost:3000
- **Backend API :** http://localhost:8000
- **Test API :** http://localhost:8000/api/public

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[INSTRUCTIONS_DEMARRAGE.txt](INSTRUCTIONS_DEMARRAGE.txt)** | 📄 Instructions visuelles rapides |
| **[DEMARRAGE_RAPIDE.md](DEMARRAGE_RAPIDE.md)** | 🚀 Guide de démarrage rapide |
| **[README_CONNEXION.md](README_CONNEXION.md)** | 🔗 Vue d'ensemble de la connexion |
| **[RESUME_CONFIGURATION.md](RESUME_CONFIGURATION.md)** | 📋 Résumé complet de la configuration |
| **[GUIDE_CONNEXION_LARAVEL_REACT.md](GUIDE_CONNEXION_LARAVEL_REACT.md)** | 📖 Guide technique détaillé |

## 🔧 Technologies Utilisées

### Backend
- **Laravel 12** - Framework PHP
- **Sanctum** - Authentification API par tokens
- **SQLite** - Base de données
- **Spatie Laravel Permission** - Gestion des rôles et permissions

### Frontend
- **React 18** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Vite** - Build tool
- **Tailwind CSS** - Framework CSS

## 👥 Rôles et Permissions

### 🎓 Étudiant (Student)
- Commander des repas
- Voir l'historique des commandes
- Gérer les points de fidélité
- Parrainer d'autres étudiants
- Soumettre des réclamations

### 👨‍🍳 Employé (Employee)
- Voir les commandes en attente
- Préparer les commandes
- Marquer les commandes comme terminées
- Gérer la disponibilité des items du menu
- Répondre aux réclamations

### 👨‍💼 Manager
- Toutes les fonctions d'employé
- Gérer les employés
- Voir les statistiques
- Gérer les promotions

### 👑 Administrateur (Admin)
- Toutes les fonctions manager
- Gérer le menu complet
- Gérer les catégories
- Configurer les paramètres système
- Accès complet aux statistiques
- Gérer tous les utilisateurs

## 🔑 Créer un Compte Administrateur

Après avoir démarré le backend, créez un compte admin :

```bash
cd Mon_Miam_Miam
php artisan tinker
```

Dans la console Tinker :

```php
$user = App\Models\User::create([
    'first_name' => 'Admin',
    'last_name' => 'System',
    'email' => 'admin@monmiammiam.com',
    'password' => bcrypt('admin123'),
    'role' => 'admin'
]);

$adminRole = App\Models\Role::where('name', 'admin')->first();
if ($adminRole) $user->roles()->attach($adminRole->id);

echo "Compte admin créé !\n";
echo "Email: admin@monmiammiam.com\n";
echo "Mot de passe: admin123\n";
exit
```

## 🔐 Authentification

L'application utilise Laravel Sanctum pour l'authentification par tokens :

1. L'utilisateur se connecte via `/api/auth/login`
2. Le backend retourne un token Bearer
3. Le frontend envoie ce token dans chaque requête : `Authorization: Bearer {token}`
4. Le middleware Sanctum vérifie le token et l'utilisateur

## 📡 Routes API Principales

### Routes Publiques
```
POST /api/auth/register    - Inscription
POST /api/auth/login       - Connexion
GET  /api/public           - Test de connexion
```

### Routes Protégées (nécessitent authentification)
```
POST /api/auth/logout      - Déconnexion
GET  /api/auth/me          - Profil utilisateur
GET  /api/orders           - Liste des commandes
POST /api/orders           - Créer une commande
GET  /api/menu             - Menu
GET  /api/statistics/*     - Statistiques
```

Voir `Mon_Miam_Miam/routes/api.php` pour toutes les routes.

## 🗃️ Base de Données

Le projet utilise SQLite pour simplifier le développement :

```bash
# Réinitialiser la base de données
cd Mon_Miam_Miam
php artisan migrate:fresh --seed

# Voir les tables
php artisan db:show

# Exécuter les seeders
php artisan db:seed
```

### Schéma Principal

- **users** - Utilisateurs (étudiants, employés, managers, admins)
- **roles** - Rôles système
- **permissions** - Permissions système
- **menu_items** - Items du menu
- **categories** - Catégories de menu
- **orders** - Commandes
- **order_items** - Items de commande
- **loyalty_transactions** - Transactions de fidélité
- **referrals** - Parrainages
- **complaints** - Réclamations
- **promotions** - Promotions et réductions
- **settings** - Paramètres système

## 🔄 Workflow de Commande

```
1. Étudiant sélectionne des items → Ajoute au panier
2. Étudiant passe commande → Status: pending
3. Employé voit la commande → Prépare
4. Status: in-preparation
5. Employé termine → Status: ready
6. Livraison/Récupération → Status: delivered
```

## 🎯 Programme de Fidélité

- Les étudiants gagnent des points à chaque commande
- Points = 10% du montant total
- Les points peuvent être échangés contre des réductions
- Système de parrainage pour bonus supplémentaires

## 🛠️ Commandes Utiles

### Backend (Laravel)

```bash
# Voir toutes les routes API
php artisan route:list --path=api

# Vider le cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Lancer les tests
php artisan test

# Voir les logs
tail -f storage/logs/laravel.log
```

### Frontend (React)

```bash
# Construire pour la production
npm run build

# Prévisualiser le build
npm run preview

# Lancer les tests
npm test

# Linter
npm run lint
```

## ⚠️ Dépannage

### Erreur CORS
```
Access to fetch has been blocked by CORS policy
```
**Solution :** Vérifiez `Mon_Miam_Miam/.env` contient :
```env
CORS_ALLOWED_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
```

### 401 Unauthorized
```
Unauthenticated
```
**Solution :** 
- Vérifiez que le token est bien envoyé
- Reconnectez-vous pour obtenir un nouveau token
- Vérifiez que Sanctum est configuré correctement

### Connection Refused
```
Failed to fetch
```
**Solution :**
- Vérifiez que les deux serveurs sont démarrés
- Backend sur port 8000, Frontend sur port 3000
- Vérifiez les variables .env

## 📦 Scripts Disponibles

| Script | Description |
|--------|-------------|
| `setup-env.ps1` / `.sh` | Créer les fichiers .env automatiquement |
| `start-backend.bat` / `.sh` | Démarrer le backend Laravel |
| `start-frontend.bat` / `.sh` | Démarrer le frontend React |
| `verifier-configuration.ps1` / `.sh` | Vérifier la configuration système |

## 📊 Développement

### Structure du Backend

```
Mon_Miam_Miam/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/    # Contrôleurs API
│   │   ├── Middleware/         # Middleware personnalisé
│   │   └── Requests/           # Form requests
│   ├── Models/                 # Modèles Eloquent
│   ├── Policies/               # Politiques d'autorisation
│   └── Providers/              # Service providers
├── config/                     # Configuration
├── database/
│   ├── migrations/             # Migrations
│   └── seeders/                # Seeders
└── routes/
    └── api.php                 # Routes API
```

### Structure du Frontend

```
frontend/
├── src/
│   ├── components/
│   │   ├── admin/              # Composants admin
│   │   ├── auth/               # Composants authentification
│   │   ├── customer/           # Composants client
│   │   ├── employee/           # Composants employé
│   │   ├── manager/            # Composants manager
│   │   └── shared/             # Composants partagés
│   ├── lib/
│   │   ├── api.ts              # Client API
│   │   ├── AppContext.tsx      # Context React
│   │   └── utils.ts            # Utilitaires
│   └── App.tsx                 # Composant principal
└── public/                     # Assets statiques
```

## 🧪 Tests

### Backend (PHPUnit)

```bash
cd Mon_Miam_Miam
php artisan test

# Tests spécifiques
php artisan test --filter=OrderApiTest
php artisan test --testsuite=Feature
```

### Frontend (Vitest)

```bash
cd frontend
npm test

# Mode watch
npm test -- --watch
```

## 📝 Variables d'Environnement

### Backend (Mon_Miam_Miam/.env)

```env
APP_URL=http://localhost:8000
DB_CONNECTION=mysql
CORS_ALLOWED_ORIGINS="http://localhost:3000"
SANCTUM_STATEFUL_DOMAINS="localhost:3000"
FRONTEND_URL=http://localhost:3000
```

### Frontend (frontend/.env)

```env
VITE_API_URL=http://localhost:8000
```

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteurs

- Équipe Mon Miam Miam

## 🙏 Remerciements

- Laravel Framework
- React
- Tous les contributeurs open-source

---

Pour plus de détails, consultez la [documentation complète](GUIDE_CONNEXION_LARAVEL_REACT.md).

**Questions ?** Consultez les logs Laravel : `Mon_Miam_Miam/storage/logs/laravel.log`

