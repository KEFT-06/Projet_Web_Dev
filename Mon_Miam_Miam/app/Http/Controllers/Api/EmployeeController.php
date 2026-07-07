<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

/**
 * @OA\Tag(
 *     name="Employees",
 *     description="Endpoints pour la gestion des employés"
 * )
 */
class EmployeeController extends Controller
{
    use AuthorizesRequests;

    /**
     * @OA\Get(
     *     path="/api/employees",
     *     tags={"Employees"},
     *     summary="Lister les employés",
     *     description="Retourne une liste paginée des employés. Accessible par les managers et admins.",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="status", in="query", description="Filtrer par statut (active, inactive)", @OA\Schema(type="string")),
     *     @OA\Parameter(name="role", in="query", description="Filtrer par rôle (employee, manager)", @OA\Schema(type="string")),
     *     @OA\Parameter(name="search", in="query", description="Rechercher par nom, email ou téléphone", @OA\Schema(type="string")),
     *     @OA\Parameter(name="sort", in="query", description="Champ de tri (ex: name, hire_date)", @OA\Schema(type="string")),
     *     @OA\Parameter(name="order", in="query", description="Ordre de tri (asc, desc)", @OA\Schema(type="string")),
     *     @OA\Parameter(name="per_page", in="query", description="Nombre d'éléments par page", @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Liste paginée des employés",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Employee"))
     *         )
     *     ),
     *     @OA\Response(response=403, description="Accès refusé")
     * )
     *
     * Liste tous les employés (avec filtres et recherche)
     * 
     * GET /api/employees?status=active&role=employee&search=jean&sort=name&order=asc
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Employee::class);

        $query = Employee::with(['user.roles'])
            ->whereHas('user'); // S'assurer que l'utilisateur existe

        // Filtre par statut
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filtre par rôle
        if ($request->has('role')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->whereHas('roles', function ($r) use ($request) {
                    $r->where('name', $request->role);
                });
            });
        }

        // Recherche (nom ou email)
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Tri
        $sortField = $request->get('sort', 'created_at');
        $sortOrder = $request->get('order', 'desc');

        if ($sortField === 'name') {
            // Tri par nom d'utilisateur
            $query->join('users', 'employees.user_id', '=', 'users.id')
                  ->select('employees.*')
                  ->orderBy('users.name', $sortOrder);
        } else {
            $query->orderBy($sortField, $sortOrder);
        }

        // Pagination
        $perPage = min($request->get('per_page', 20), 100);
        $employees = $query->paginate($perPage);

        // Formater la réponse
        $employees->getCollection()->transform(function ($employee) {
            return $this->formatEmployeeResponse($employee);
        });

        return response()->json($employees);
    }

    /**
     * @OA\Get(
     *     path="/api/employees/{employee}",
     *     tags={"Employees"},
     *     summary="Afficher les détails d'un employé",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="employee",
     *         in="path",
     *         required=true,
     *         description="ID de l'employé",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Détails de l'employé", @OA\JsonContent(ref="#/components/schemas/Employee")),
     *     @OA\Response(response=404, description="Employé non trouvé")
     * )
     * Afficher les détails d'un employé
     * 
     * GET /api/employees/{id}
     * 
     * @param Employee $employee
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Employee $employee)
    {
        $this->authorize('view', $employee);

        $employee->load(['user.roles']);

        return response()->json([
            'employee' => $this->formatEmployeeResponse($employee),
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/employees",
     *     tags={"Employees"},
     *     summary="Créer un nouvel employé",
     *     description="Crée un nouvel utilisateur et un profil employé associé. Accessible par les managers (pour créer des employés) et les admins (pour créer employés et managers).",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "email", "phone", "password", "role", "position"},
     *             @OA\Property(property="name", type="string", example="John Doe"),
     *             @OA\Property(property="email", type="string", format="email", example="john.doe@example.com"),
     *             @OA\Property(property="phone", type="string", example="+237699887766"),
     *             @OA\Property(property="password", type="string", format="password", example="Password123"),
     *             @OA\Property(property="role", type="string", enum={"employee", "manager"}),
     *             @OA\Property(property="position", type="string", example="Serveur"),
     *             @OA\Property(property="hire_date", type="string", format="date", example="2024-01-15"),
     *             @OA\Property(property="salary", type="number", format="float", example=50000)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Employé créé avec succès", @OA\JsonContent(ref="#/components/schemas/Employee")),
     *     @OA\Response(response=403, description="Accès refusé"),
     *     @OA\Response(response=422, description="Erreur de validation")
     * )
     * Créer un nouvel employé
     * 
     * POST /api/employees
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $this->authorize('create', Employee::class);

        // Validation
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|unique:users,phone',
            'password' => [
                'required',
                'string',
                'min:8',
                'regex:/[A-Z]/', // Au moins une majuscule
                'regex:/[0-9]/', // Au moins un chiffre
            ],
            'role' => 'required|in:employee,manager',
            'position' => 'required|string|max:100',
            'hire_date' => 'nullable|date|before_or_equal:today',
            'salary' => 'nullable|numeric|min:0',
        ], [
            'password.regex' => 'Le mot de passe doit contenir au moins une majuscule et un chiffre',
            'email.unique' => 'Cette adresse email est déjà utilisée',
            'phone.unique' => 'Ce numéro de téléphone est déjà utilisé',
        ]);

        try {
            DB::beginTransaction();

            // Vérifier que le manager ne crée pas un autre manager (sauf si admin)
            if ($validated['role'] === 'manager' && !$request->user()->isAdmin()) {
                return response()->json([
                    'message' => 'Seul un administrateur peut créer un manager',
                ], 403);
            }

            // Créer l'utilisateur
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'password' => Hash::make($validated['password']),
                'referral_code' => 'EMP_' . strtoupper(substr(md5($validated['email']), 0, 8)),
            ]);

            // Assigner le rôle
            $user->assignRole($validated['role']);

            // Créer l'employé
            $employee = Employee::create([
                'user_id' => $user->id,
                'status' => 'active',
                'position' => $validated['position'],
                'hire_date' => $validated['hire_date'] ?? now(),
                'salary' => $validated['salary'] ?? null,
            ]);

            DB::commit();

            // Logger l'action
            Log::info('Employee created', [
                'employee_id' => $employee->id,
                'user_id' => $user->id,
                'role' => $validated['role'],
                'created_by' => $request->user()->id,
            ]);

            // Charger les relations
            $employee->load(['user.roles']);

            return response()->json([
                'message' => 'Employé créé avec succès',
                'employee' => $this->formatEmployeeResponse($employee),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Employee creation failed', [
                'error' => $e->getMessage(),
                'data' => $request->except(['password']),
            ]);

            return response()->json([
                'message' => 'Erreur lors de la création de l\'employé',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/employees/{employee}",
     *     tags={"Employees"},
     *     summary="Mettre à jour un employé",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="employee", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="phone", type="string"),
     *             @OA\Property(property="password", type="string", format="password", description="Nouveau mot de passe (optionnel)"),
     *             @OA\Property(property="position", type="string"),
     *             @OA\Property(property="status", type="string", enum={"active", "inactive"}),
     *             @OA\Property(property="salary", type="number", format="float")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Employé mis à jour", @OA\JsonContent(ref="#/components/schemas/Employee")),
     *     @OA\Response(response=403, description="Accès refusé"),
     *     @OA\Response(response=422, description="Erreur de validation")
     * )
     * Mettre à jour un employé
     * 
     * PUT /api/employees/{id}
     * 
     * @param Request $request
     * @param Employee $employee
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Employee $employee)
    {
        $this->authorize('update', $employee);

        // Validation
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => [
                'sometimes',
                'email',
                Rule::unique('users')->ignore($employee->user_id),
            ],
            'phone' => [
                'sometimes',
                'string',
                Rule::unique('users')->ignore($employee->user_id),
            ],
            'password' => [
                'sometimes',
                'string',
                'min:8',
                'regex:/[A-Z]/',
                'regex:/[0-9]/',
            ],
            'position' => 'sometimes|string|max:100',
            'status' => 'sometimes|in:active,inactive',
            'salary' => 'nullable|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            // Mettre à jour l'utilisateur si nécessaire
            $userUpdates = array_intersect_key($validated, array_flip(['name', 'email', 'phone', 'password']));
            
            if (!empty($userUpdates)) {
                if (isset($userUpdates['password'])) {
                    $userUpdates['password'] = Hash::make($userUpdates['password']);
                }
                $employee->user->update($userUpdates);
            }

            // Mettre à jour l'employé
            $employeeUpdates = array_intersect_key($validated, array_flip(['position', 'status', 'salary']));
            
            if (!empty($employeeUpdates)) {
                $employee->update($employeeUpdates);
            }

            DB::commit();

            // Logger l'action
            Log::info('Employee updated', [
                'employee_id' => $employee->id,
                'updated_fields' => array_keys($validated),
                'updated_by' => $request->user()->id,
            ]);

            // Recharger les relations
            $employee->refresh()->load(['user.roles']);

            return response()->json([
                'message' => 'Employé mis à jour avec succès',
                'employee' => $this->formatEmployeeResponse($employee),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Employee update failed', [
                'employee_id' => $employee->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Erreur lors de la mise à jour de l\'employé',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/employees/{employee}",
     *     tags={"Employees"},
     *     summary="Supprimer un employé (Admin seulement)",
     *     description="Effectue une suppression logique (soft delete) de l'employé et de son utilisateur associé.",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="employee", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Employé supprimé avec succès"),
     *     @OA\Response(response=403, description="Accès refusé")
     * )
     * Supprimer un employé (soft delete)
     * 
     * DELETE /api/employees/{id}
     * 
     * @param Request $request
     * @param Employee $employee
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request, Employee $employee)
    {
        $this->authorize('delete', $employee);

        // Empêcher la suppression de soi-même
        if ($employee->user_id === $request->user()->id) {
            return response()->json([
                'message' => 'Vous ne pouvez pas vous supprimer vous-même',
            ], 403);
        }

        try {
            // Soft delete
            $employee->delete();

            // Désactiver l'utilisateur
            $employee->user->update(['deleted_at' => now()]);

            // Logger l'action
            Log::warning('Employee deleted', [
                'employee_id' => $employee->id,
                'user_id' => $employee->user_id,
                'deleted_by' => $request->user()->id,
            ]);

            return response()->json([
                'message' => 'Employé supprimé avec succès',
            ]);

        } catch (\Exception $e) {
            Log::error('Employee deletion failed', [
                'employee_id' => $employee->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Erreur lors de la suppression de l\'employé',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * @OA\Patch(
     *     path="/api/employees/{employee}/status",
     *     tags={"Employees"},
     *     summary="Changer le statut d'un employé",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="employee", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"status"},
     *             @OA\Property(property="status", type="string", enum={"active", "inactive"})
     *         )
     *     ),
     *     @OA\Response(response=200, description="Statut modifié avec succès")
     * )
     * Changer le statut d'un employé (activer/désactiver)
     * 
     * PATCH /api/employees/{id}/status
     * 
     * @param Request $request
     * @param Employee $employee
     * @return \Illuminate\Http\JsonResponse
     */
    public function toggleStatus(Request $request, Employee $employee)
    {
        $this->authorize('update', $employee);

        $validated = $request->validate([
            'status' => 'required|in:active,inactive',
        ]);

        $employee->update(['status' => $validated['status']]);

        Log::info('Employee status changed', [
            'employee_id' => $employee->id,
            'new_status' => $validated['status'],
            'changed_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Statut modifié avec succès',
            'employee' => $this->formatEmployeeResponse($employee->fresh(['user.roles'])),
        ]);
    }

    /**
     * @OA\Patch(
     *     path="/api/employees/{employee}/role",
     *     tags={"Employees"},
     *     summary="Changer le rôle d'un employé (Admin seulement)",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="employee", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"role"},
     *             @OA\Property(property="role", type="string", enum={"employee", "manager"})
     *         )
     *     ),
     *     @OA\Response(response=200, description="Rôle modifié avec succès")
     * )
     * Changer le rôle d'un employé (Admin uniquement)
     * 
     * PATCH /api/employees/{id}/role
     * 
     * @param Request $request
     * @param Employee $employee
     * @return \Illuminate\Http\JsonResponse
     */
    public function changeRole(Request $request, Employee $employee)
    {
        // Seul l'admin peut changer les rôles
        if (!$request->user()->isAdmin()) {
            return response()->json([
                'message' => 'Seul un administrateur peut changer les rôles',
            ], 403);
        }

        $validated = $request->validate([
            'role' => 'required|in:employee,manager',
        ]);

        $employee->user->syncRoles([$validated['role']]);

        Log::info('Employee role changed', [
            'employee_id' => $employee->id,
            'new_role' => $validated['role'],
            'changed_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Rôle modifié avec succès',
            'employee' => $this->formatEmployeeResponse($employee->fresh(['user.roles'])),
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/employees/stats",
     *     tags={"Employees"},
     *     summary="Obtenir les statistiques des employés",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Statistiques des employés")
     * )
     * Obtenir les statistiques des employés
     * 
     * GET /api/employees/stats
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function stats()
    {
        $this->authorize('viewAny', Employee::class);

        $total = Employee::count();
        $active = Employee::where('status', 'active')->count();
        $inactive = Employee::where('status', 'inactive')->count();

        // Par rôle
        $byRole = User::role(['employee', 'manager'])
            ->whereHas('employee')
            ->get()
            ->groupBy(function ($user) {
                return $user->getRoleNames()->first();
            })
            ->map->count();

        // Par poste
        $byPosition = Employee::select('position', DB::raw('count(*) as count'))
            ->groupBy('position')
            ->pluck('count', 'position');

        // Nouvelles embauches (30 derniers jours)
        $recentHires = Employee::where('hire_date', '>=', now()->subDays(30))->count();

        // Ancienneté moyenne (en jours)
        $averageTenure = Employee::selectRaw('AVG(DATEDIFF(NOW(), hire_date)) as avg_days')
            ->first()
            ->avg_days ?? 0;

        return response()->json([
            'total' => $total,
            'active' => $active,
            'inactive' => $inactive,
            'by_role' => $byRole,
            'by_position' => $byPosition,
            'recent_hires' => $recentHires,
            'average_tenure_days' => (int) $averageTenure,
        ]);
    }

    /**
     * @OA\Schema(
     *     schema="Employee",
     *     title="Employee",
     *     description="Modèle Employé",
     *     @OA\Property(property="id", type="integer", description="ID de l'employé"),
     *     @OA\Property(property="user", type="object", ref="#/components/schemas/User"),
     *     @OA\Property(property="role", type="string", description="Rôle de l'employé"),
     *     @OA\Property(property="position", type="string", description="Poste de l'employé"),
     *     @OA\Property(property="status", type="string", description="Statut (active/inactive)"),
     *     @OA\Property(property="hire_date", type="string", format="date", description="Date d'embauche"),
     *     @OA\Property(property="tenure_days", type="integer", description="Ancienneté en jours"),
     *     @OA\Property(property="created_at", type="string", format="date-time"),
     *     @OA\Property(property="updated_at", type="string", format="date-time")
     * )
     *
     * Formater la réponse d'un employé
     * 
     * @param Employee $employee
     * @return array
     */
    protected function formatEmployeeResponse(Employee $employee): array
    {
        return [
            'id' => $employee->id,
            'user' => [
                'id' => $employee->user->id,
                'name' => $employee->user->name,
                'email' => $employee->user->email,
                'phone' => $employee->user->phone,
            ],
            'role' => $employee->user->getRoleNames()->first() ?? 'employee',
            'position' => $employee->position,
            'status' => $employee->status,
            'hire_date' => $employee->hire_date?->format('Y-m-d'),
            'tenure_days' => $employee->hire_date ? now()->diffInDays($employee->hire_date) : 0,
            'created_at' => $employee->created_at?->toIso8601String(),
            'updated_at' => $employee->updated_at?->toIso8601String(),
        ];
    }
}