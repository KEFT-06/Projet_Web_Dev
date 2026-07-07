<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
/**
 * @OA\Tag(
 *     name="Complaints",
 *     description="Endpoints pour la gestion des réclamations"
 * )
 */
class ComplaintController extends Controller
{
    use AuthorizesRequests;

    /**
     * @OA\Get(
     *     path="/api/complaints",
     *     tags={"Complaints"},
     *     summary="Lister les réclamations (pour le personnel)",
     *     description="Retourne une liste paginée des réclamations. Accessible par les employés, managers et admins.",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="status",
     *         in="query",
     *         description="Filtrer par statut (pending, in_progress, resolved, rejected)",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(response=200, description="Liste des réclamations"),
     *     @OA\Response(response=403, description="Accès refusé")
     * )
     * Affiche la liste des réclamations pour le personnel (employés, managers, admins).
     * Permet le filtrage par statut.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Complaint::class);

        $request->validate([
            'status' => 'sometimes|in:pending,in_progress,resolved,rejected',
        ]);

        $query = Complaint::with(['user:id,name,email', 'handledBy:id,name']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $complaints = $query->latest()->paginate(20);

        return response()->json($complaints);
    }

    /**
     * @OA\Get(
     *     path="/api/complaints/my",
     *     tags={"Complaints"},
     *     summary="Lister mes réclamations (étudiant)",
     *     description="Retourne la liste paginée des réclamations de l'utilisateur authentifié.",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Liste de mes réclamations")
     * )
     * Affiche les réclamations de l'étudiant authentifié.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function myComplaints()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $complaints = $user->complaints()
            ->with('handledBy:id,name')
            ->latest()
            ->paginate(15);

        return response()->json($complaints);
    }

    /**
     * @OA\Get(
     *     path="/api/complaints/{complaint}",
     *     tags={"Complaints"},
     *     summary="Afficher les détails d'une réclamation",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="complaint",
     *         in="path",
     *         required=true,
     *         description="ID de la réclamation",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Détails de la réclamation"),
     *     @OA\Response(response=403, description="Accès refusé"),
     *     @OA\Response(response=404, description="Réclamation non trouvée")
     * )
     * Affiche les détails d'une réclamation spécifique.
     *
     * @param \App\Models\Complaint $complaint
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Complaint $complaint)
    {
        $this->authorize('view', $complaint);

        $complaint->load(['user:id,name,email', 'order', 'handledBy:id,name']);

        return response()->json($complaint);
    }

    /**
     * @OA\Post(
     *     path="/api/complaints",
     *     tags={"Complaints"},
     *     summary="Créer une nouvelle réclamation (étudiant)",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"order_id", "description"},
     *             @OA\Property(property="order_id", type="integer", description="ID de la commande concernée", example=1),
     *             @OA\Property(property="description", type="string", description="Description détaillée de la réclamation", example="Le plat était froid.")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Réclamation créée avec succès"),
     *     @OA\Response(response=403, description="Accès refusé"),
     *     @OA\Response(response=422, description="Erreur de validation")
     * )
     * Crée une nouvelle réclamation pour l'étudiant authentifié.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $this->authorize('create', Complaint::class);

        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'description' => 'required|string|min:10|max:2000',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Vérifier que la commande appartient bien à l'utilisateur
        $order = $user->orders()->findOrFail($validated['order_id']);

        $complaint = $user->complaints()->create([
            'order_id' => $order->id,
            'description' => $validated['description'],
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Réclamation envoyée avec succès.',
            'complaint' => $complaint,
        ], 201);
    }

    /**
     * @OA\Post(
     *     path="/api/complaints/{complaint}/respond",
     *     tags={"Complaints"},
     *     summary="Répondre à une réclamation (employé/manager)",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="complaint", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"response"},
     *             @OA\Property(property="response", type="string", description="Réponse de l'employé", example="Nous sommes désolés pour ce désagrément.")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Réponse enregistrée"),
     *     @OA\Response(response=403, description="Accès refusé"),
     *     @OA\Response(response=422, description="Erreur de validation")
     * )
     * Permet à un employé de répondre à une réclamation.
     *
     * @param \Illuminate\Http\Request $request
     * @param \App\Models\Complaint $complaint
     * @return \Illuminate\Http\JsonResponse
     */
    public function respond(Request $request, Complaint $complaint)
    {
        $this->authorize('update', $complaint);

        $validated = $request->validate([
            'response' => 'required|string|min:10|max:2000',
        ]);

        $complaint->update([
            'employee_response' => $validated['response'],
            'handled_by' => Auth::id(),
            'status' => 'in_progress', // Passe en "en cours" après une réponse
        ]);

        return response()->json([
            'message' => 'Réponse enregistrée avec succès.',
            'complaint' => $complaint->fresh(['user', 'handledBy']),
        ]);
    }

    /**
     * @OA\Patch(
     *     path="/api/complaints/{complaint}/resolve",
     *     tags={"Complaints"},
     *     summary="Résoudre ou rejeter une réclamation (admin/manager)",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="complaint", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"status"},
     *             @OA\Property(property="status", type="string", description="Nouveau statut", enum={"resolved", "rejected"}),
     *             @OA\Property(property="response", type="string", description="Réponse finale (optionnelle si déjà présente)", example="La réclamation a été traitée.")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Réclamation mise à jour"),
     *     @OA\Response(response=403, description="Accès refusé"),
     *     @OA\Response(response=422, description="Erreur de validation")
     * )
     * Permet à un admin de résoudre une réclamation.
     *
     * @param \Illuminate\Http\Request $request
     * @param \App\Models\Complaint $complaint
     * @return \Illuminate\Http\JsonResponse
     */
    public function resolve(Request $request, Complaint $complaint)
    {
        $this->authorize('update', $complaint); // La policy gère déjà les rôles

        $validated = $request->validate([
            'status' => 'required|in:resolved,rejected',
            'response' => 'sometimes|string|min:10|max:2000',
        ]);

        $complaint->markAsResolved(
            $validated['response'] ?? $complaint->employee_response ?? 'Réclamation traitée.',
            Auth::id()
        );

        // Mettre à jour le statut si c'est un rejet
        if ($validated['status'] === 'rejected') {
            $complaint->update(['status' => 'rejected']);
        }

        return response()->json([
            'message' => 'La réclamation a été marquée comme résolue.',
            'complaint' => $complaint->fresh(['user', 'handledBy']),
        ]);
    }
}