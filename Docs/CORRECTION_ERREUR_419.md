# Correction de l'erreur 419 - CSRF Token

## Problème identifié
L'erreur **419 Page Expired** était causée par le middleware Sanctum `EnsureFrontendRequestsAreStateful` qui activait la vérification CSRF pour toutes les routes API, y compris les routes publiques comme `/api/auth/login` et `/api/auth/register`.

## Solution appliquée

### 1. Modification de `bootstrap/app.php`
- ✅ **Retiré** le middleware `EnsureFrontendRequestsAreStateful`
- ✅ **Retiré** `statefulApi()` qui forçait l'utilisation de cookies/session
- ✅ Conservé uniquement l'alias pour le middleware `role`

**Raison** : Votre application utilise une authentification **token-based** (Bearer token), pas une authentification session-based avec cookies. Le middleware CSRF n'est donc pas nécessaire pour les routes API.

### 2. Configuration CORS ajoutée
- ✅ Ajouté `CORS_ALLOWED_ORIGINS` dans le fichier `.env` du backend
- ✅ Valeur : `http://localhost:3000,http://127.0.0.1:3000`

### 3. Améliorations supplémentaires effectuées

#### Frontend - api.ts
- ✅ Ajout de logs console pour déboguer les requêtes
- ✅ Affichage du code d'erreur HTTP dans les messages d'erreur

#### Frontend - LoginPage.tsx
- ✅ Suppression du champ `username` inutilisé
- ✅ Meilleure gestion des erreurs de validation
- ✅ Messages d'erreur plus détaillés avec code HTTP

#### Frontend - SignupPage.tsx
- ✅ **Correction des labels inversés** (firstName/lastName)
- ✅ Correction des placeholders
- ✅ Meilleure gestion des erreurs de validation

#### Backend - AuthController.php
- ✅ Accepte maintenant `firstName` et `lastName` séparément
- ✅ Combine automatiquement en `name` pour la base de données
- ✅ Renvoie `firstName` et `lastName` dans les réponses

### 4. Types de rôle corrigés
- ✅ Changement de `'customer'` en `'student'` dans tout le frontend
- ✅ Cohérence entre frontend et backend

## Test de la solution

### Étape 1 : Vérifier que le backend est lancé
Le backend devrait être en cours d'exécution sur `http://localhost:8000`

### Étape 2 : Tester l'inscription
1. Ouvrez l'application frontend sur `http://localhost:3000`
2. Cliquez sur "Créer un compte"
3. Remplissez le formulaire avec :
   - **Prénom** : Jean
   - **Nom** : Dupont
   - **Email** : test@example.com
   - **Mot de passe** : Test123@ (minimum 8 caractères, 1 majuscule, 1 chiffre)
4. Acceptez les cookies et conditions
5. Cliquez sur "Créer un compte"

### Étape 3 : Vérifier les logs
Ouvrez la console du navigateur (F12) et vérifiez :
- `API Request:` doit afficher l'URL et les données
- `API Response:` doit afficher le statut 200 ou 201 (succès)
- Si erreur, `API Error:` affiche les détails

## Erreurs possibles et solutions

### Erreur 422 - Validation
**Cause** : Les données ne respectent pas les critères de validation
**Solution** : 
- Mot de passe : minimum 8 caractères, au moins 1 majuscule et 1 chiffre
- Email : doit être unique et valide
- Tous les champs requis doivent être remplis

### Erreur 419 - CSRF (si elle revient)
**Cause** : Le backend n'a pas été redémarré
**Solution** : Redémarrer le backend avec `.\start-backend.bat`

### Erreur de connexion
**Cause** : Le backend n'est pas démarré ou sur le mauvais port
**Solution** : 
- Vérifier que `php artisan serve` tourne sur le port 8000
- Vérifier le fichier `.env` du frontend : `VITE_API_URL=http://localhost:8000`

## Récapitulatif des modifications

### Fichiers modifiés dans le backend
1. `bootstrap/app.php` - Configuration middleware simplifiée
2. `app/Http/Controllers/Api/AuthController.php` - Support firstName/lastName
3. `.env` - Ajout de CORS_ALLOWED_ORIGINS

### Fichiers modifiés dans le frontend
1. `src/lib/api.ts` - Logging et types mis à jour
2. `src/components/auth/LoginPage.tsx` - Suppression username, meilleure gestion erreurs
3. `src/components/auth/SignupPage.tsx` - Labels corrigés, meilleure gestion erreurs
4. `src/lib/mockData.ts` - Type User : 'customer' → 'student'
5. `src/App.tsx` - Type Role : 'customer' → 'student'
6. `src/components/Header.tsx` - Type role : 'customer' → 'student'
7. `src/lib/permissions.ts` - Type Role : 'customer' → 'student'

## Notes importantes

- **L'authentification est maintenant token-based** : Après connexion/inscription, le token est stocké dans `localStorage` et utilisé pour les requêtes authentifiées
- **Pas de CSRF** : Les routes API publiques ne nécessitent pas de token CSRF
- **CORS configuré** : Le backend accepte les requêtes depuis `localhost:3000`

## Prochaines étapes

Si l'erreur persiste :
1. Vérifiez les logs dans la console du navigateur (F12)
2. Vérifiez que le backend répond : ouvrez `http://localhost:8000/api/auth/login` dans le navigateur
3. Partagez les logs console pour diagnostic supplémentaire
