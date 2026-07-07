# 📖 Documentation du Projet "Mon Miam Miam"

**Version:** 1.0.2  
**Date:** Octobre 2024  
**Propriétaire:** ZeDuc@Space  
**Type:** Application Web de Gestion de Restaurant

---

## 📋 Table des Matières

1. [Introduction](#introduction)
2. [Architecture Technique](#architecture-technique)
3. [Structure du Projet](#structure-du-projet)
4. [Fonctionnalités Principales](#fonctionnalités-principales)
5. [API et Endpoints](#api-et-endpoints)
6. [Système de Permissions et Rôles](#système-de-permissions-et-rôles)
7. [Modèles et Base de Données](#modèles-et-base-de-données)
8. [Installation et Configuration](#installation-et-configuration)
9. [Tests](#tests)
10. [Déploiement](#déploiement)
11. [Charte Graphique](#charte-graphique)

---

## 1. Introduction {#introduction}

### 1.1 Contexte

**Mon Miam Miam** est une application web de gestion de restaurant développée pour le restaurant **ZeDuc@Space**, situé au sommet de la résidence la Terrasse à l'institut UCAC-ICAM de Yaoundé. Cette application vise à moderniser le processus de commande et de gestion du restaurant, tout en offrant une expérience utilisateur améliorée aux étudiants.

### 1.2 Objectifs

- ✅ Améliorer le suivi des commandes en temps réel
- ✅ Optimiser la gestion des livraisons et du service sur place
- ✅ Assurer la traçabilité des ventes
- ✅ Offrir une vue en temps réel des statistiques
- ✅ Mettre en place un programme de fidélité et de parrainage
- ✅ Permettre la création de promotions et d'événements

### 1.3 Parties Prenantes

- **La direction du restaurant** : supervise toutes les opérations
- **Le gérant** : gestion quotidienne et supervision des commandes
- **Les employés** : préparation et validation des commandes
- **Les étudiants** : clients du restaurant utilisant l'application

---

## 2. Architecture Technique {#architecture-technique}

### 2.1 Stack Technologique

#### Backend
- **Framework:** Laravel 12.x
- **Langage:** PHP 8.2+
- **Authentification:** Laravel Sanctum
- **Permissions:** Spatie Laravel Permission
- **Base de données:** MySQL
- **API Documentation:** L5-Swagger/OpenAPI

#### Frontend
- **Framework:** À définir (React/Vue.js/Angular)
- **Build Tool:** Vite
- **CSS:** Framework moderne (Tailwind/Bootstrap)

#### Outils de Développement
- **Versioning:** Git/GitHub
- **Tests:** PHPUnit 11.x
- **Gestion de projet:** Jira
- **CI/CD:** GitHub Actions (recommandé)

### 2.2 Architecture du Projet

Le projet suit une **architecture MVC (Modèle-Vue-Contrôleur)** avec une séparation claire entre le backend API (Laravel) et le frontend.

```
Mon_Miam_Miam/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/    # Contrôleurs API
│   │   ├── Middleware/          # Middlewares personnalisés
│   │   └── Requests/            # Form Requests (validation)
│   ├── Models/                  # Modèles Eloquent
│   ├── Policies/                # Politiques d'autorisation
│   └── Traits/                  # Traits réutilisables
├── routes/
│   └── api.php                  # Définition des routes API
├── database/
│   ├── migrations/              # Migrations de base de données
│   └── seeders/                 # Seeders pour données initiales
└── tests/                       # Tests automatisés
```

---

## 3. Structure du Projet {#structure-du-projet}

### 3.1 Contrôleurs API

| Contrôleur | Description | Routes |
|------------|-------------|--------|
| `AuthController` | Authentification (register, login, logout) | `/api/auth/*` |
| `OrderController` | Gestion des commandes | `/api/orders/*` |
| `MenuItemController` | Gestion du menu | `/api/menu/*` |
| `EmployeeController` | Gestion des employés | `/api/employees/*` |
| `LoyaltyTransactionController` | Points de fidélité | `/api/loyalty/*` |
| `ComplaintController` | Gestion des réclamations | `/api/complaints/*` |
| `StatisticsController` | Statistiques | `/api/statistics/*` |
| `PromotionController` | Promotions et événements | `/api/promotions/*` |
| `ReferralController` | Système de parrainage | `/api/referral/*` |
| `SettingController` | Paramètres de l'application | `/api/settings/*` |

### 3.2 Modèles Eloquent

| Modèle | Description | Relations |
|--------|-------------|-----------|
| `User` | Utilisateurs (students, employees, admins) | orders, loyaltyTransactions, complaints |
| `Order` | Commandes | user, items, payment |
| `OrderItem` | Articles de commande | order, menuItem |
| `MenuItem` | Éléments du menu | category, orders |
| `Category` | Catégories de menu | menuItems |
| `Employee` | Employés | user |
| `LoyaltyTransaction` | Transactions de fidélité | user, order |
| `Complaint` | Réclamations | user, order |
| `Promotion` | Promotions | - |
| `Referral` | Parrainages | referrer, referee |
| `Payment` | Paiements | order |

---

## 4. Fonctionnalités Principales {#fonctionnalités-principales}

### 4.1 Espace Étudiant 👨‍🎓

**Authentification :**
- Inscription avec validation (email, mot de passe fort avec majuscule et chiffre)
- Connexion sécurisée
- Numéro de téléphone, localisation
- Récupération de mot de passe

**Gestion des Commandes :**
- Visualisation du menu en temps réel
- Ajout d'articles au panier
- Choix entre livraison et service sur place
- Utilisation des points de fidélité pour réduction
- Commentaires sur les commandes

**Programme de Fidélité :**
- Accumulation de points : **1000 FCFA = 1 point**
- Utilisation : **15 points = 1000 FCFA de réduction**
- Historique des transactions
- Solde de points consultable

**Parrainage :**
- Code de parrainage unique généré automatiquement
- Partage du code avec d'autres étudiants
- Récompense : 5 points bonus au parrain lors de la première commande

**Réclamations :**
- Dépôt de réclamations
- Suivi du statut (pending, in_progress, resolved, rejected)
- Historique des réclamations

**Historique :**
- Consultation des commandes passées
- Détails de chaque transaction
- Filtres par date, statut

### 4.2 Espace Employé 👨‍🍳

**Gestion des Commandes :**
- Visualisation des commandes en attente
- Validation et préparation des commandes
- Marquage des commandes comme complétées
- Suivi en temps réel

**Gestion du Menu :**
- Consultation du menu
- Mise à jour de la disponibilité des articles
- Changements temporaires (épuisé, plat du jour)

**Réclamations :**
- Consultation des réclamations
- Répondre aux réclamations des clients
- Gestion du statut

**Statistiques :**
- Visualisation des stats de la semaine
- Commandes, ventes, top articles

### 4.3 Espace Gérant/Manager 👨‍💼

**Supervision :**
- Vue d'ensemble des commandes
- Statistiques détaillées
- Gestion des employés

**Gestion des Employés :**
- Création de comptes employés
- Attribution de rôles
- Modification du statut (actif/inactif)
- Changement de position ou salaire

**Statistiques :**
- Données globales sur les ventes
- Analyse du programme de fidélité
- Statistiques de parrainage

### 4.4 Espace Administrateur 👑

**Gestion Complète du Restaurant :**
- Menu complet (CRUD)
- Promotion et événements
- Statistiques exportables
- Paramètres de l'application

**Gestion des Employés :**
- Création, modification, suppression
- Changement de rôles
- Gestion des permissions

**Supervision :**
- Toutes les commandes
- Toutes les réclamations
- Statistiques complètes
- Export de données

---

## 5. API et Endpoints {#api-et-endpoints}

### 5.1 Authentification

```
POST   /api/auth/register      # Inscription
POST   /api/auth/login         # Connexion
POST   /api/auth/logout        # Déconnexion
GET    /api/auth/me            # Informations utilisateur
```

### 5.2 Commandes

```
GET    /api/orders              # Liste des commandes
POST   /api/orders              # Créer une commande
GET    /api/orders/{id}       # Détails d'une commande
PATCH  /api/orders/{id}/cancel  # Annuler une commande (étudiant)
PATCH  /api/orders/{id}/prepare # Préparer (employé)
PATCH  /api/orders/{id}/complete # Compléter (employé)
```

### 5.3 Menu

```
GET    /api/menu                # Liste des éléments
GET    /api/menu/{id}           # Détails
POST   /api/menu                # Créer (admin)
PUT    /api/menu/{id}           # Modifier (admin)
DELETE /api/menu/{id}           # Supprimer (admin)
PATCH  /api/menu/{id}/toggle-availability # Basculer disponibilité
```

### 5.4 Employés (Manager + Admin)

```
GET    /api/employees           # Liste avec filtres/recherche
GET    /api/employees/stats     # Statistiques
GET    /api/employees/{id}      # Détails
POST   /api/employees           # Créer
PUT    /api/employees/{id}      # Modifier
DELETE /api/employees/{id}      # Supprimer (admin)
PATCH  /api/employees/{id}/status  # Changer statut
PATCH  /api/employees/{id}/role   # Changer rôle (admin)
```

### 5.5 Points de Fidélité

```
GET    /api/loyalty/balance     # Solde
GET    /api/loyalty/history     # Historique
POST   /api/loyalty/redeem      # Utiliser des points
```

### 5.6 Parrainage

```
GET    /api/referral/code       # Obtenir mon code
POST   /api/referral/apply     # Utiliser un code
GET    /api/referral/stats     # Statistiques
GET    /api/referral/referrals # Mes filleuls
```

### 5.7 Réclamations

```
POST   /api/complaints          # Créer une réclamation (étudiant)
GET    /api/complaints          # Liste (employé/admin)
GET    /api/complaints/{id}    # Détails
POST   /api/complaints/{id}/respond # Répondre (employé)
PATCH  /api/complaints/{id}/resolve # Résoudre (admin)
```

### 5.8 Statistiques

```
GET    /api/statistics/dashboard # Tableau de bord (admin)
GET    /api/statistics/week     # Stats de la semaine (employé)
GET    /api/statistics/export   # Export (admin)
```

### 5.9 Promotions

```
GET    /api/promotions         # Liste
POST   /api/promotions         # Créer (admin)
PUT    /api/promotions/{id}    # Modifier (admin)
DELETE /api/promotions/{id}    # Supprimer (admin)
```

---

## 6. Système de Permissions et Rôles {#système-de-permissions-et-rôles}

### 6.1 Rôles

| Rôle | Description | Permissions |
|------|-------------|-------------|
| `admin` | Administrateur complet | Toutes les permissions |
| `manager` | Gérant du restaurant | Gestion employés, commandes, menu partiel |
| `employee` | Employé standard | Gestion commandes, menu visibility, réclamations |
| `student` | Étudiant/client | Commandes, fidélité, parrainage, réclamations |

### 6.2 Permissions Principales

**Commandes:**
- `orders:create` - Créer une commande
- `orders:list` - Voir toutes les commandes
- `orders:update` - Modifier une commande
- `orders:view-own` - Voir ses propres commandes
- `orders:cancel` - Annuler une commande

**Menu:**
- `menu:view` - Voir le menu
- `menu:toggle-availability` - Basculer disponibilité

**Employés:**
- `employee:create` - Créer un employé
- `employee:update` - Modifier un employé
- `employee:delete` - Supprimer un employé
- `employee:view` - Voir les employés

**Fidélité:**
- `loyalty:view` - Voir le solde
- `loyalty:redeem` - Utiliser des points

**Réclamations:**
- `complaints:create` - Créer une réclamation
- `complaints:list` - Voir toutes les réclamations
- `complaints:update` - Répondre
- `complaints:resolve` - Résoudre

**Statistiques:**
- `statistics:view` - Voir les statistiques
- `statistics:export` - Exporter les statistiques

---

## 7. Modèles et Base de Données {#modèles-et-base-de-données}

### 7.1 Structure de la Base de Données

**Tables principales :**

1. **users** - Utilisateurs
   - `id`, `name`, `email`, `password`, `phone`
   - `location`, `loyalty_points`, `referral_code`
   - `referrer_id` (parrain)

2. **orders** - Commandes
   - `id`, `user_id`, `order_number`
   - `delivery_type` (delivery/on_site)
   - `subtotal`, `discount_amount`, `total_amount`
   - `points_used`, `points_earned`
   - `status` (pending, preparing, completed, cancelled)

3. **order_items** - Articles de commande
   - `order_id`, `menu_item_id`
   - `item_name`, `quantity`, `unit_price`, `subtotal`

4. **menu_items** - Éléments du menu
   - `id`, `category_id`, `name`, `description`
   - `price`, `type` (boisson, dessert, petit-déjeuné, déjeuné)
   - `is_available`, `popularity_score`

5. **employees** - Employés
   - `id`, `user_id`, `position`, `status`
   - `hire_date`, `salary`

6. **loyalty_transactions** - Transactions de fidélité
   - `id`, `user_id`, `order_id`, `points`
   - `type` (earned, redeemed, bonus, referral)
   - `description`, `expires_at`

7. **referrals** - Parrainages
   - `referrer_id`, `referee_id`
   - `reward_points`, `status`, `completed_at`

8. **complaints** - Réclamations
   - `user_id`, `order_id`, `description`
   - `status`, `employee_response`
   - `handled_by`, `resolved_at`

9. **permissions** et **roles** - Gestion des accès (Spatie Permission)

### 7.2 Relations Clés

```
User:
  - hasMany Order
  - hasMany LoyaltyTransaction
  - hasMany Complaint
  - hasOne Employee
  - belongsTo User (referrer)

Order:
  - belongsTo User
  - hasMany OrderItem
  - hasOne Payment

Employee:
  - belongsTo User

LoyaltyTransaction:
  - belongsTo User
  - belongsTo Order
```

---

## 8. Installation et Configuration {#installation-et-configuration}

### 8.1 Prérequis

- PHP >= 8.2
- Composer
- MySQL >= 5.7
- Node.js >= 18.x et npm

### 8.2 Installation

```bash
# 1. Cloner le repository
git clone <repository-url>
cd Mon_Miam_Miam

# 2. Installer les dépendances
composer install
npm install

# 3. Configuration de l'environnement
cp .env.example .env
php artisan key:generate

# 4. Configurer la base de données dans .env
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=db_mmm
DB_USERNAME=root
DB_PASSWORD=

# 5. Exécuter les migrations
php artisan migrate

# 6. Seed des données initiales (rôles et permissions)
php artisan db:seed --class=RolePermissionSeeder

# 7. Générer la documentation API (Swagger)
php artisan l5-swagger:generate

# 8. Lancer le serveur
php artisan serve

# 9. Dans un autre terminal, lancer Vite
npm run dev
```

### 8.3 Configuration des Permissions

Les permissions et rôles sont automatiquement créés lors du seeding :

```bash
php artisan db:seed --class=RolePermissionSeeder
```

### 8.4 Configuration de la Documentation API

La documentation Swagger est accessible à :
```
http://localhost:8000/api/documentation
```

Générer/mettre à jour la doc :
```bash
php artisan l5-swagger:generate
```

---

## 9. Tests {#tests}

### 9.1 Structure des Tests

```
tests/
├── Feature/           # Tests fonctionnels
│   ├── Employee/
│   ├── OrderApiTest.php
│   └── MenuItemApiTest.php
└── Unit/             # Tests unitaires
```

### 9.2 Exécution des Tests

```bash
# Tous les tests
php artisan test

# Tests spécifiques
php artisan test tests/Feature/Employee/EmployeeFeatureTest.php

# Avec coverage
php artisan test --coverage
```

### 9.3 Tests Actuels

- ✅ Tests de création d'employé
- ✅ Tests de permissions (manager, admin)
- ✅ Tests de filtres et recherche
- ✅ Tests de pagination
- ✅ Tests de validation
- ✅ Tests de soft delete

---

## 10. Déploiement {#déploiement}

### 10.1 Environnement de Production

**Configuration requise :**
- Serveur web (Apache/Nginx)
- PHP 8.2+ avec extensions : mbstring, xml, json, curl, pdo_mysql
- MySQL 5.7+
- SSL/HTTPS (recommandé)

### 10.2 Étapes de Déploiement

```bash
# 1. Optimiser pour la production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 2. Build des assets frontend
npm run build

# 3. Migration en production
php artisan migrate --force

# 4. Seed des permissions
php artisan db:seed --class=RolePermissionSeeder --force
```

### 10.3 Variables d'Environnement en Production

```env
APP_ENV=production
APP_DEBUG=false
DB_CONNECTION=mysql
DB_HOST=<production-host>
DB_DATABASE=<production-db>
DB_USERNAME=<production-user>
DB_PASSWORD=<production-password>
```

### 10.4 CI/CD avec GitHub Actions

Un workflow GitHub Actions est recommandé pour :
- Exécution automatique des tests
- Build et déploiement automatique
- Validation du code (PHPStan, PHP CS Fixer)

---

## 11. Charte Graphique {#charte-graphique}

### 11.1 Couleurs

**Couleurs principales :**
- **Primary :** `#cfbd97` (Beige doré)
- **Secondary :** `#000000` (Noir)

**Palette complète :**
- Bleu : Pour les actions importantes
- Rouge : Pour les avertissements
- Vert : Pour les succès

### 11.2 Police

- **Titres :** Police moderne et lisible (Montserrat, Poppins, Inter)
- **Corps :** Police sans-serif propre (Roboto, Open Sans)

### 11.3 Interface Responsive

- Desktop : Layout complet avec sidebar
- Tablet : Layout adaptatif
- Mobile : Design mobile-first

---

## 12. Sécurité

### 12.1 Authentification

- **Laravel Sanctum** pour l'authentification API
- Tokens d'accès sécurisés
- Expiration automatique des tokens
- Middleware d'authentification sur toutes les routes protégées

### 12.2 Validation des Données

- Form Requests pour validation côté serveur
- Sanitization des entrées
- Protection CSRF
- Validation des uploads d'images

### 12.3 Permissions

- Système de rôles avec **Spatie Permission**
- Middleware de permissions sur toutes les routes sensibles
- Policies pour autorisation fine

---

## 13. Fonctionnalités Futures

### 13.1 Intégration Paiement

- Intégration CinetPay pour Mobile Money
- Support cartes bancaires
- Payement de commandes en ligne

### 13.2 Notifications en Temps Réel

- WebSockets pour mises à jour en temps réel
- Notifications push pour commandes
- Alertes pour promotions

### 13.3 Application Mobile

- Extension vers application mobile native
- React Native ou Flutter
- Synchronisation avec l'API existante

---

## 14. Support et Contributions

### 14.1 Documentation API

Swagger UI disponible à :
```
http://localhost:8000/api/documentation
```

### 14.2 Contact

- **Équipe:** UCAC-ICAM Yaoundé
- **Restaurant:** ZeDuc@Space
- **Emplacement:** Résidence la Terrasse, UCAC-ICAM

### 14.3 Licence

MIT License - Libre pour usage éducatif

---

**Version du document:** 1.0.2  
**Dernière mise à jour:** Octobre 2024

