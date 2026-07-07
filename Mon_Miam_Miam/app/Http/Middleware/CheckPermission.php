<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Exceptions\UnauthorizedException as PermissionUnauthorizedException;

class CheckPermission
{
    /**
     * Traiter la requête et vérifier les permissions utilisateur
     * 
     * Utilisation dans les routes :
     * 
     * // Une seule permission
     * Route::middleware('permission:orders:create')->group(function () {
     *     Route::post('/orders', [OrderController::class, 'store']);
     * });
     * 
     * // Plusieurs permissions (toutes requises)
     * Route::middleware('permission:orders:view,orders:edit')->group(function () {
     *     Route::get('/orders', [OrderController::class, 'index']);
     * });
     * 
     * // Sur une seule route
     * Route::delete('/orders/{id}', [OrderController::class, 'destroy'])
     *     ->middleware('permission:orders:delete');
     * 
     * Utilisation avec trait HasRoles :
     * - $user->hasPermissionTo('orders:create')
     * - $user->hasAnyPermission(['orders:view', 'orders:edit'])
     * - $user->hasAllPermissions(['orders:view', 'orders:edit'])
     * 
     * @param Request $request
     * @param Closure $next
     * @param string ...$permissions Permissions requises (séparées par des virgules)
     * @return Response
     * @throws \Symfony\Component\HttpKernel\Exception\HttpException
     */
    public function handle(Request $request, Closure $next, ...$permissions): Response
    {
        // Vérifier que l'utilisateur est authentifié
        if (!$request->user()) {
            Log::warning('Tentative d\'accès sans authentification', [
                'ip' => $request->ip(),
                'path' => $request->path(),
                'permissions_requises' => $permissions,
            ]);

            return response()->json([
                'message' => 'Non authentifié. Veuillez vous connecter.',
                'error' => 'unauthenticated',
            ], 401);
        }

        $user = $request->user();

        // Si aucune permission spécifiée, autoriser l'accès
        if (empty($permissions)) {
            return $next($request);
        }

        try {
            // Vérifier si l'utilisateur possède TOUTES les permissions requises
            if ($user->hasAllPermissions($permissions)) {
                // Log de l'accès autorisé
                Log::info('Accès autorisé par permission', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'permissions_requises' => $permissions,
                    'permissions_utilisateur' => $user->getAllPermissions()
                        ->pluck('name')
                        ->toArray(),
                    'path' => $request->path(),
                    'method' => $request->method(),
                ]);

                return $next($request);
            }

            // Log de l'accès refusé
            Log::warning('Accès refusé - Permission insuffisante', [
                'user_id' => $user->id,
                'email' => $user->email,
                'permissions_requises' => $permissions,
                'permissions_utilisateur' => $user->getAllPermissions()
                    ->pluck('name')
                    ->toArray(),
                'path' => $request->path(),
                'method' => $request->method(),
                'ip' => $request->ip(),
            ]);

            // Répondre avec erreur 403 Forbidden
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Vous n\'avez pas les permissions nécessaires pour accéder à cette ressource.',
                    'error' => 'forbidden',
                    'required_permissions' => $permissions,
                    'user_permissions' => $user->getAllPermissions()
                        ->pluck('name')
                        ->toArray(),
                ], 403);
            }

            // Pour les requêtes web (redirect)
            return redirect('/')
                ->with('error', 'Accès refusé. Vous n\'avez pas les permissions nécessaires.');

        } catch (PermissionUnauthorizedException $e) {
            Log::error('Permission non trouvée en base de données', [
                'permissions_requises' => $permissions,
                'erreur' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Erreur de configuration : Permission non trouvée.',
                'error' => 'permission_not_found',
            ], 500);
        }
    }

    /**
     * Helper : Vérifier si un utilisateur a une permission spécifique
     * 
     * @param \App\Models\User $user
     * @param string|array $permission
     * @return bool
     */
    public static function userHasPermission($user, $permission): bool
    {
        return $user->hasPermissionTo($permission);
    }

    /**
     * Helper : Vérifier si un utilisateur a au moins une permission
     * 
     * @param \App\Models\User $user
     * @param array $permissions
     * @return bool
     */
    public static function userHasAnyPermission($user, array $permissions): bool
    {
        return $user->hasAnyPermission($permissions);
    }

    /**
     * Helper : Vérifier si un utilisateur a toutes les permissions
     * 
     * @param \App\Models\User $user
     * @param array $permissions
     * @return bool
     */
    public static function userHasAllPermissions($user, array $permissions): bool
    {
        return $user->hasAllPermissions($permissions);
    }

    /**
     * Helper : Obtenir toutes les permissions disponibles
     * 
     * @return array
     */
    public static function getAllAvailablePermissions(): array
    {
        return [
            // Authentification
            'auth:register' => 'S\'inscrire',
            'auth:login' => 'Se connecter',
            'auth:logout' => 'Se déconnecter',

            // Profil
            'profile:view' => 'Voir son profil',
            'profile:edit' => 'Modifier son profil',
            'profile:delete' => 'Supprimer son compte',

            // Commandes
            'orders:create' => 'Créer une commande',
            'orders:view' => 'Voir toutes les commandes',
            'orders:view-own' => 'Voir ses propres commandes',
            'orders:list' => 'Lister les commandes',
            'orders:update' => 'Modifier une commande',
            'orders:cancel' => 'Annuler une commande',

            // Menu
            'menu:view' => 'Consulter le menu',
            'menu:create' => 'Créer un item menu',
            'menu:edit' => 'Modifier un item menu',
            'menu:delete' => 'Supprimer un item menu',
            'menu:toggle-availability' => 'Changer disponibilité menu',

            // Fidélité
            'loyalty:view' => 'Voir ses points fidélité',
            'loyalty:redeem' => 'Utiliser ses points',

            // Parrainage
            'referral:generate-code' => 'Générer code parrainage',
            'referral:use-code' => 'Utiliser code parrainage',
            'referral:view-stats' => 'Voir statistiques parrainage',

            // Réclamations
            'complaints:create' => 'Créer une réclamation',
            'complaints:view-own' => 'Voir ses propres réclamations',
            'complaints:list' => 'Lister toutes les réclamations',
            'complaints:update' => 'Mettre à jour une réclamation',
            'complaints:resolve' => 'Résoudre une réclamation',

            // Employés
            'employees:create' => 'Créer un employé',
            'employees:list' => 'Lister les employés',
            'employees:edit' => 'Modifier un employé',
            'employees:delete' => 'Supprimer un employé',

            // Statistiques
            'statistics:view' => 'Consulter les statistiques',
            'statistics:export' => 'Exporter les statistiques',

            // Promotions
            'promotions:create' => 'Créer une promotion',
            'promotions:list' => 'Lister les promotions',
            'promotions:edit' => 'Modifier une promotion',
            'promotions:delete' => 'Supprimer une promotion',

            // Paramètres
            'settings:view' => 'Consulter les paramètres',
            'settings:edit' => 'Modifier les paramètres',
        ];
    }

    /**
     * Helper : Obtenir les permissions par catégorie
     * 
     * @return array
     */
    public static function getPermissionsByCategory(): array
    {
        return [
            'Authentification' => [
                'auth:register',
                'auth:login',
                'auth:logout',
            ],
            'Profil' => [
                'profile:view',
                'profile:edit',
                'profile:delete',
            ],
            'Commandes' => [
                'orders:create',
                'orders:view',
                'orders:view-own',
                'orders:list',
                'orders:update',
                'orders:cancel',
            ],
            'Menu' => [
                'menu:view',
                'menu:create',
                'menu:edit',
                'menu:delete',
                'menu:toggle-availability',
            ],
            'Fidélité & Parrainage' => [
                'loyalty:view',
                'loyalty:redeem',
                'referral:generate-code',
                'referral:use-code',
                'referral:view-stats',
            ],
            'Réclamations' => [
                'complaints:create',
                'complaints:view-own',
                'complaints:list',
                'complaints:update',
                'complaints:resolve',
            ],
            'Gestion RH' => [
                'employees:create',
                'employees:list',
                'employees:edit',
                'employees:delete',
            ],
            'Statistiques & Paramètres' => [
                'statistics:view',
                'statistics:export',
                'promotions:create',
                'promotions:list',
                'promotions:edit',
                'promotions:delete',
                'settings:view',
                'settings:edit',
            ],
        ];
    }

    /**
     * Helper : Valider qu'une permission existe
     * 
     * @param string $permission
     * @return bool
     */
    public static function isValidPermission(string $permission): bool
    {
        $available = self::getAllAvailablePermissions();
        return isset($available[$permission]);
    }
}