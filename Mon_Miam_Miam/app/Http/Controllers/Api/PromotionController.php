<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

/**
 * @OA\Tag(
 *     name="Promotions",
 *     description="Endpoints pour la gestion des promotions et événements"
 * )
 *
 * @OA\Schema(
 *     schema="Promotion",
 *     title="Promotion",
 *     description="Modèle Promotion",
 *     @OA\Property(property="id", type="integer", description="ID de la promotion"),
 *     @OA\Property(property="title", type="string", description="Titre de la promotion"),
 *     @OA\Property(property="description", type="string", description="Description de la promotion"),
 *     @OA\Property(property="image", type="string", description="URL de l'image de la promotion"),
 *     @OA\Property(property="start_date", type="string", format="date-time", description="Date de début"),
 *     @OA\Property(property="end_date", type="string", format="date-time", description="Date de fin"),
 *     @OA\Property(property="is_active", type="boolean", description="Statut actif/inactif"),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 */
class PromotionController extends Controller
{
    use AuthorizesRequests;

    /**
     * @OA\Get(
     *     path="/api/promotions",
     *     tags={"Promotions"},
     *     summary="Lister les promotions",
     *     description="Retourne une liste paginée des promotions. Accessible à tous. Peut être filtré.",
     *     @OA\Parameter(name="status", in="query", description="Filtrer par statut (active, upcoming, expired)", @OA\Schema(type="string")),
     *     @OA\Parameter(name="search", in="query", description="Rechercher par titre ou description", @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Liste des promotions", @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/Promotion")))
     * )
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Promotion::class);

        $query = Promotion::query();

        // Filter by status (active, upcoming, expired)
        if ($request->has('status')) {
            switch ($request->status) {
                case 'active':
                    $query->active();
                    break;
                case 'upcoming':
                    $query->upcoming();
                    break;
                case 'expired':
                    $query->expired();
                    break;
                default:
                    // No specific status filter, return all
                    break;
            }
        }

        // Filter by active status explicitly
        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        // Search by title or description
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $promotions = $query->latest()->paginate(15);

        return response()->json($promotions);
    }

    /**
     * @OA\Post(
     *     path="/api/promotions",
     *     tags={"Promotions"},
     *     summary="Créer une nouvelle promotion (Admin)",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"title", "start_date", "end_date"},
     *             @OA\Property(property="title", type="string", example="Offre Spéciale Pizza"),
     *             @OA\Property(property="description", type="string", example="Deux pizzas pour le prix d'une !"),
     *             @OA\Property(property="start_date", type="string", format="date", example="2024-10-01"),
     *             @OA\Property(property="end_date", type="string", format="date", example="2024-10-15"),
     *             @OA\Property(property="is_active", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Promotion créée avec succès", @OA\JsonContent(ref="#/components/schemas/Promotion")),
     *     @OA\Response(response=403, description="Accès refusé")
     * )
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $this->authorize('create', Promotion::class);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string', // Assuming image is a URL or path for now
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'is_active' => 'boolean',
        ]);

        $promotion = Promotion::create($validated);

        return response()->json([
            'message' => 'Promotion créée avec succès.',
            'promotion' => $promotion,
        ], 201);
    }

    /**
     * @OA\Get(
     *     path="/api/promotions/{promotion}",
     *     tags={"Promotions"},
     *     summary="Afficher les détails d'une promotion",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="promotion", in="path", required=true, description="ID de la promotion", @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Détails de la promotion", @OA\JsonContent(ref="#/components/schemas/Promotion")),
     *     @OA\Response(response=404, description="Promotion non trouvée")
     * )
     *
     * @param  \App\Models\Promotion  $promotion
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Promotion $promotion)
    {
        $this->authorize('view', $promotion);

        return response()->json($promotion);
    }

    /**
     * @OA\Put(
     *     path="/api/promotions/{promotion}",
     *     tags={"Promotions"},
     *     summary="Mettre à jour une promotion (Admin)",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="promotion", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             @OA\Property(property="title", type="string"),
     *             @OA\Property(property="description", type="string"),
     *             @OA\Property(property="is_active", type="boolean")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Promotion mise à jour", @OA\JsonContent(ref="#/components/schemas/Promotion"))
     * )
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Promotion  $promotion
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Promotion $promotion)
    {
        $this->authorize('update', $promotion);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'is_active' => 'sometimes|boolean',
        ]);

        $promotion->update($validated);

        return response()->json([
            'message' => 'Promotion mise à jour avec succès.',
            'promotion' => $promotion,
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/promotions/{promotion}",
     *     tags={"Promotions"},
     *     summary="Supprimer une promotion (Admin)",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="promotion", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=204, description="Promotion supprimée avec succès")
     * )
     *
     * @param  \App\Models\Promotion  $promotion
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Promotion $promotion)
    {
        $this->authorize('delete', $promotion);

        $promotion->delete();

        return response()->json([
            'message' => 'Promotion supprimée avec succès.'
        ], 204);
    }
}
