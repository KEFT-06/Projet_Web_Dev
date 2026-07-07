<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class CheckRole
{
    /**
     * Traiter la requête et vérifier les rôles utilisateur
     * 
     * Utilisation dans les routes :
     * 
     * // Un seul rôle
     * Route::middleware('role:admin')->group(function () {
     *     Route::get('/dashboard', [DashboardController::class, 'index']);
     * });
     * 
     * // Plusieurs rôles (au moins un requis)
     * Route::middleware('role:manager,admin')->group(function () {
     *     Route::get('/statistics', [StatisticsController::class, 'index']);
     * });
     * 
     * // Sur une seule route
     * Route::post('/users', [UserController::class, 'store'])
     *     ->middleware('role:admin');
     * 
     * @param Request $request
     * @param Closure $next
     * @param string ...$roles Rôles autorisés (séparés par des virgules)
     * @return Response
     * @throws \Symfony\Component\HttpKernel\Exception\HttpException
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // Vérifier que l'utilisateur est authentifié
        if (!$request->user()) {
            Log::warning('Tentative d\'accès sans authentification', [
                'ip' => $request->ip(),
                'path' => $request->path(),
            ]);

            throw new \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException('Non authentifié. Veuillez vous connecter.');
        }

        $user = $request->user();

        // Si aucun rôle spécifié, autoriser l'accès
        if (empty($roles)) {
            return $next($request);
        }

        // Donner accès complet aux administrateurs
        if ($user->hasRole('admin')) {
            Log::info('Accès autorisé pour administrateur', [
                'user_id' => $user->id,
                'email' => $user->email,
                'roles_requis' => $roles,
                'path' => $request->path(),
                'method' => $request->method(),
            ]);
            return $next($request);
        }

        // Vérifier si l'utilisateur possède au moins un des rôles requis
        if ($user->hasAnyRole($roles)) {
            // Log de l'accès autorisé
            Log::info('Accès autorisé par rôle', [
                'user_id' => $user->id,
                'email' => $user->email,
                'roles_requis' => $roles,
                'roles_utilisateur' => $user->getRoleNames()->toArray(),
                'path' => $request->path(),
                'method' => $request->method(),
            ]);

            return $next($request);
        }

        // Log de l'accès refusé
        Log::warning('Accès refusé - Rôle insuffisant', [
            'user_id' => $user->id,
            'email' => $user->email,
            'roles_requis' => $roles,
            'roles_utilisateur' => $user->getRoleNames()->toArray(),
            'path' => $request->path(),
            'method' => $request->method(),
            'ip' => $request->ip(),
        ]);

        throw new \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException(
            'Vous n\'avez pas les permissions nécessaires pour accéder à cette ressource.'
        );
    }

    /**
     * Helper : Vérifier si un utilisateur a un rôle spécifique
     * Utilisation : CheckRole::userHasRole($user, 'admin')
     * 
     * @param \App\Models\User $user
     * @param string|array $roles
     * @return bool
     */
    public static function userHasRole($user, $roles): bool
    {
        return $user->hasAnyRole($roles);
    }

    /**
     * Helper : Obtenir les rôles autorisés
     * 
     * @return array
     */
    public static function getAvailableRoles(): array
    {
        return [
            'student' => 'Étudiant',
            'employee' => 'Employé',
            'manager' => 'Gérant',
            'admin' => 'Administrateur',
        ];
    }

    /**
     * Helper : Obtenir la hiérarchie des rôles
     * 
     * @return array
     */
    public static function getRoleHierarchy(): array
    {
        return [
            'student' => 0,      // Accès basique
            'employee' => 1,     // Accès intermédiaire
            'manager' => 2,      // Accès avancé
            'admin' => 3,        // Accès complet
        ];
    }

    /**
     * Helper : Vérifier si un rôle est supérieur à un autre
     * 
     * @param string $role1
     * @param string $role2
     * @return bool
     */
    public static function isRoleSuperior(string $role1, string $role2): bool
    {
        $hierarchy = self::getRoleHierarchy();
        
        if (!isset($hierarchy[$role1]) || !isset($hierarchy[$role2])) {
            return false;
        }

        return $hierarchy[$role1] > $hierarchy[$role2];
    }
}