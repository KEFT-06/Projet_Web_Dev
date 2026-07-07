<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LoyaltyTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Authenticatable;

/*
 * @OA\Tag(
 *     name="Loyalty",
 *     description="Opérations sur les points de fidélité des utilisateurs"
 * )
 *
 * @OA\Schema(
 *     schema="LoyaltyBalance",
 *     title="Loyalty Balance",
 *     description="Solde des points de fidélité d'un utilisateur",
 *     @OA\Property(property="balance", type="integer", description="Solde actuel des points"),
 *     @OA\Property(property="total_earned", type="integer", description="Total des points gagnés"),
 *     @OA\Property(property="total_redeemed", type="integer", description="Total des points dépensés")
 * )
 *
 * @OA\Schema(
 *     schema="RedeemPointsRequest",
 *     title="Redeem Points Request",
 *     description="Corps de la requête pour échanger des points",
 *     type="object",
 *     required={"points"},
 *     @OA\Property(property="points", type="integer", description="Nombre de points à échanger", example=15),
 *     @OA\Property(property="description", type="string", nullable=true, description="Description de l'échange"),
 *     @OA\Property(property="order_id", type="integer", nullable=true, description="ID de la commande associée")
 * )
 *
 * @OA\Schema(
 *     schema="RedeemPointsResponse",
 *     title="Redeem Points Response",
 *     description="Réponse après un échange de points réussi",
 *     type="object",
 *     @OA\Property(property="message", type="string", example="Points redeemed successfully"),
 *     @OA\Property(
 *         property="transaction",
 *         ref="#/components/schemas/LoyaltyTransaction"
 *     ),
 *     @OA\Property(property="new_balance", type="integer", description="Nouveau solde de points")
 * )
 */


class LoyaltyTransactionController extends Controller
{
    /**
     * Afficher une liste de ressources.
     */
    public function index()
    {
        $loyaltyTransactions = LoyaltyTransaction::all();
        return response()->json($loyaltyTransactions);
    }
    /**
     * Retourne le solde de points de l'utilisateur authentifié
     */
    public function balance() {
        /** @var User $user */
        $user = Auth::user();

        // Sommes utiles (note: les transactions 'redeemed' peuvent être stockées en négatif)
        // Utilise directement le modèle LoyaltyTransaction si la relation user->loyaltyTransactions() n'existe pas.
        $transactions = LoyaltyTransaction::where('user_id', $user->id);
        $totalEarned = (int) $transactions->whereIn('type', ['earned', 'bonus', 'referral'])->sum('points');
        $totalRedeemed = (int) abs($transactions->where('type', 'redeemed')->sum('points'));

        return response()->json([
            'balance' => (int) $user->loyalty_points,
            'total_earned' => $totalEarned,
            'total_redeemed' => $totalRedeemed,
        ]);
    }

    /**
     * Historique paginé des transactions de fidélité pour l'utilisateur
     */
    public function history(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        $data = $request->validate([
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:200'],
            'type' => ['sometimes', 'string'],
            'date_from' => ['sometimes', 'date'],
            'date_to' => ['sometimes', 'date'],
        ]);

        $perPage = $data['per_page'] ?? 15;

        $query = LoyaltyTransaction::where('user_id', $user->id)->orderBy('created_at', 'desc');

        if (!empty($data['type'])) {
            $query->where('type', $data['type']);
        }

        if (!empty($data['date_from'])) {
            $query->where('created_at', '>=', $data['date_from']);
        }

        if (!empty($data['date_to'])) {
            $query->where('created_at', '<=', $data['date_to']);
        }

        $page = $query->paginate($perPage);

        return response()->json($page);
    }

    /**
     * Échanger des points de fidélité (redeem)
     * Attendu : { points: int, description?: string, order_id?: int }
     */
    public function redeem(Request $request)
    {
        /** @var User|null $user */
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Utilisateur non authentifié'], 401);
        }

        $data = $request->validate([
            'points' => ['required', 'integer', 'min:1'],
            'description' => ['sometimes', 'string', 'max:1000'],
            'order_id' => ['sometimes', 'integer', 'exists:orders,id'],
        ]);

        $points = (int) $data['points'];
        $description = $data['description'] ?? 'Redeem via API';
        $orderId = $data['order_id'] ?? null;

        try {
            $transaction = $user->deductLoyaltyPoints($points, $description, $orderId);

            return response()->json([
                'message' => 'Points redeemed successfully',
                'transaction' => $transaction,
                'new_balance' => (int) $user->refresh()->loyalty_points,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 422);
        }
    }

}
