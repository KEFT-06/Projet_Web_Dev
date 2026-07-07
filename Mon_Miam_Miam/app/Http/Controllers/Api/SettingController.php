<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Setting;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

/**
 * @OA\Tag(
 *     name="Settings",
 *     description="Gestion des paramètres de l'application (Admin)"
 * )
 */
class SettingController extends Controller
{
    use AuthorizesRequests;

    /**
     * @OA\Get(
     *     path="/api/settings",
     *     tags={"Settings"},
     *     summary="Lister tous les paramètres",
     *     description="Retourne tous les paramètres de l'application sous forme d'objet clé/valeur. Requiert les droits d'administrateur.",
     *     security={{"sanctum": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Liste des paramètres",
     *         @OA\JsonContent(
     *             type="object",
     *             example={"referral.reward_points": "5", "app.name": "Mon Miam Miam"}
     *         )
     *     ),
     *     @OA\Response(response=403, description="Accès refusé")
     * )
     */
    public function index()
    {
        // Assumant une SettingPolicy pour la vérification des permissions
        $this->authorize('viewAny', Setting::class);

        // Retourne les paramètres sous forme de clé => valeur pour une utilisation facile côté client
        $settings = Setting::all()->pluck('value', 'key');

        return response()->json($settings);
    }

    /**
     * @OA\Post(
     *     path="/api/settings",
     *     tags={"Settings"},
     *     summary="Mettre à jour plusieurs paramètres",
     *     description="Crée ou met à jour un ou plusieurs paramètres. Le corps de la requête doit être un objet où les clés sont les noms des paramètres. Requiert les droits d'administrateur.",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             type="object",
     *             example={"referral.reward_points": "10", "maintenance_mode": "false"}
     *         )
     *     ),
     *     @OA\Response(response=200, description="Paramètres mis à jour"),
     *     @OA\Response(response=403, description="Accès refusé"),
     *     @OA\Response(response=422, description="Erreur de validation")
     * )
     */
    public function store(Request $request)
    {
        $this->authorize('create', Setting::class);

        // Valide que l'entrée est un tableau associatif (objet JSON)
        $settings = $request->validate([
            '*' => 'nullable|string|max:255',
        ]);

        foreach ($settings as $key => $value) {
            Setting::set($key, $value);
        }

        return response()->json([
            'message' => 'Les paramètres ont été mis à jour avec succès.',
            'settings' => Setting::all()->pluck('value', 'key') // Retourne les nouvelles valeurs
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/settings/{key}",
     *     tags={"Settings"},
     *     summary="Afficher un paramètre spécifique",
     *     description="Retourne la valeur d'un paramètre spécifique. Requiert les droits d'administrateur.",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="key", in="path", required=true, description="Clé du paramètre (ex: referral.reward_points)", @OA\Schema(type="string")),
     *     @OA\Response(
     *         response=200,
     *         description="Détails du paramètre",
     *         @OA\JsonContent(ref="#/components/schemas/Setting")
     *     ),
     *     @OA\Response(response=404, description="Paramètre non trouvé")
     * )
     */
    public function show(Setting $setting)
    {
        $this->authorize('view', $setting);

        return response()->json($setting);
    }

    /**
     * @OA\Put(
     *     path="/api/settings/{key}",
     *     tags={"Settings"},
     *     summary="Mettre à jour un paramètre spécifique",
     *     description="Met à jour la valeur d'un paramètre existant. Requiert les droits d'administrateur.",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="key", in="path", required=true, description="Clé du paramètre", @OA\Schema(type="string")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"value"},
     *             @OA\Property(property="value", type="string", description="Nouvelle valeur du paramètre")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Paramètre mis à jour"),
     *     @OA\Response(response=404, description="Paramètre non trouvé")
     * )
     */
    public function update(Request $request, Setting $setting)
    {
        $this->authorize('update', $setting);

        $validated = $request->validate([
            'value' => 'nullable|string|max:255',
        ]);

        $setting->update($validated);

        return response()->json([
            'message' => 'Le paramètre a été mis à jour avec succès.',
            'setting' => $setting,
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/settings/{key}",
     *     tags={"Settings"},
     *     summary="Supprimer un paramètre",
     *     description="Supprime un paramètre de la base de données. Requiert les droits d'administrateur.",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="key", in="path", required=true, description="Clé du paramètre", @OA\Schema(type="string")),
     *     @OA\Response(response=204, description="Paramètre supprimé"),
     *     @OA\Response(response=404, description="Paramètre non trouvé")
     * )
     */
    public function destroy(Setting $setting)
    {
        $this->authorize('delete', $setting);

        $setting->delete();

        return response()->json(null, 204);
    }
}
