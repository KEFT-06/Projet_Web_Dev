<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use App\Http\Requests\StoreMenuItemRequest;
use App\Http\Requests\UpdateMenuItemRequest;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

/**
 * @OA\Tag(
 *     name="Menu",
 *     description="Opérations sur les articles du menu"
 * )
 */
class MenuItemController extends Controller
{
    use AuthorizesRequests;

    /**
     * @OA\Get(
     *     path="/api/menu-items",
     *     tags={"Menu"},
     *     summary="Lister tous les articles du menu",
     *     description="Retourne une liste paginée de tous les articles du menu. Peut être filtré par catégorie, disponibilité, etc.",
     *     operationId="getMenuItems",
     *     @OA\Parameter(name="category_id", in="query", description="Filtrer par ID de catégorie", @OA\Schema(type="integer")),
     *     @OA\Parameter(name="type", in="query", description="Filtrer par type (ex: déjeuné)", @OA\Schema(type="string")),
     *     @OA\Parameter(name="search", in="query", description="Rechercher par nom ou description", @OA\Schema(type="string")),
     *     @OA\Response(
     *         response=200,
     *         description="Liste des articles du menu",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(ref="#/components/schemas/MenuItem")
     *         )
     *     )
     * )
     */
    public function index(Request $request)
    {
        $query = MenuItem::query()->available();

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('is_available')) {
            $query->where('is_available', filter_var($request->is_available, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $menuItems = $query->popular()->paginate(20);

        return response()->json($menuItems);
    }

    /**
     * @OA\Post(
     *     path="/api/menu-items",
     *     tags={"Menu"},
     *     summary="Créer un nouvel article de menu",
     *     description="Crée un nouvel article. Requiert des permissions d'admin ou de gérant.",
     *     operationId="createMenuItem",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/StoreMenuItemRequest")
     *     ),
     *     @OA\Response(response=201, description="Article créé", @OA\JsonContent(ref="#/components/schemas/MenuItem")),
     *     @OA\Response(response=403, description="Accès refusé"),
     *     @OA\Response(response=422, description="Erreur de validation")
     * )
     */
    public function store(StoreMenuItemRequest $request)
    {
        $this->authorize('create', MenuItem::class); // Assumant une Policy
        $menuItem = MenuItem::create($request->validated());

        return response()->json($menuItem, 201);
    }

    /**
     * @OA\Get(
     *     path="/api/menu-items/{id}",
     *     tags={"Menu"},
     *     summary="Afficher un article de menu",
     *     description="Retourne les détails d'un article de menu spécifique.",
     *     operationId="getMenuItemById",
     *     @OA\Parameter(name="id", in="path", required=true, description="ID de l'article", @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Détails de l'article", @OA\JsonContent(ref="#/components/schemas/MenuItem")),
     *     @OA\Response(response=404, description="Article non trouvé")
     * )
     */
    public function show(MenuItem $menuItem)
    {
        return response()->json($menuItem);
    }

    /**
     * @OA\Put(
     *     path="/api/menu-items/{id}",
     *     tags={"Menu"},
     *     summary="Mettre à jour un article de menu",
     *     description="Met à jour un article existant. Requiert des permissions d'admin ou de gérant.",
     *     operationId="updateMenuItem",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, description="ID de l'article", @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/UpdateMenuItemRequest")
     *     ),
     *     @OA\Response(response=200, description="Article mis à jour", @OA\JsonContent(ref="#/components/schemas/MenuItem")),
     *     @OA\Response(response=403, description="Accès refusé"),
     *     @OA\Response(response=404, description="Article non trouvé")
     * )
     */
    public function update(UpdateMenuItemRequest $request, MenuItem $menuItem)
    {
        $this->authorize('update', $menuItem); // Assumant une Policy
        $menuItem->update($request->validated());

        return response()->json($menuItem);
    }

    /**
     * @OA\Delete(
     *     path="/api/menu-items/{id}",
     *     tags={"Menu"},
     *     summary="Supprimer un article de menu",
     *     description="Supprime (soft delete) un article de menu. Requiert des permissions d'admin ou de gérant.",
     *     operationId="deleteMenuItem",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, description="ID de l'article", @OA\Schema(type="integer")),
     *     @OA\Response(response=204, description="Article supprimé"),
     *     @OA\Response(response=403, description="Accès refusé"),
     *     @OA\Response(response=404, description="Article non trouvé")
     * )
     */
    public function destroy(MenuItem $menuItem)
    {
        $this->authorize('delete', $menuItem); // Assumant une Policy
        $menuItem->delete();

        return response()->json(null, 204);
    }
}