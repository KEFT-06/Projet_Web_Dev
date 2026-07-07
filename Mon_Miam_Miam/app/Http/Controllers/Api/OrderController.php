<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Models\Order;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

/**
 * @OA\Tag(
 *     name="Orders",
 *     description="Operations about orders"
 * )
 */
class OrderController extends Controller
{
    use AuthorizesRequests;
    /**
     * Display a listing of the resource.
     *
     * @OA\Get(
     *     path="/api/orders",
     *     tags={"Orders"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Page number",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="List of orders",
     *         @OA\JsonContent(type="object")
     *     )
     * )
     */
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // L'admin et le gérant voient toutes les commandes, l'étudiant ne voit que les siennes.
        if ($user->hasAnyRole(['admin', 'manager', 'employee'])) {
            $orders = Order::with('user', 'items.menuItem')->latest()->paginate(20);
        } else {
            $orders = $user->orders()->with('items.menuItem')->latest()->paginate(20);
        }

        return response()->json($orders);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @OA\Post(
     *     path="/api/orders",
     *     tags={"Orders"},
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             type="object",
     *             required={"items", "delivery_type"},
     *             @OA\Property(
     *                 property="items",
     *                 type="array",
     *                 @OA\Items(
     *                     type="object",
     *                     @OA\Property(property="menu_item_id", type="integer"),
     *                     @OA\Property(property="quantity", type="integer"),
     *                     @OA\Property(property="price", type="number", format="float")
     *                 )
     *             ),
     *             @OA\Property(property="delivery_type", type="string", example="on_site"),
     *             @OA\Property(property="delivery_address", type="string"),
     *             @OA\Property(property="delivery_time", type="string", format="date-time"),
     *             @OA\Property(property="points_to_use", type="integer"),
     *             @OA\Property(property="comment", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Order created",
     *         @OA\JsonContent(type="object")
     *     ),
     *     @OA\Response(response=403, description="Unauthorized"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(StoreOrderRequest $request)
    {
        $validated = $request->validated();
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Définir les taux de conversion (pourrait être dans un fichier de config)
        $frs_per_point = 1000;
        $points_per_discount_unit = 15;
        $discount_per_unit = 1000;

        $order = DB::transaction(function () use ($validated, $user, $frs_per_point, $points_per_discount_unit, $discount_per_unit) {
            $subtotal = 0;
            $orderItemsData = [];

            // 1. Calculer le sous-total à partir des articles du panier
            foreach ($validated['items'] as $item) {
                $menuItem = MenuItem::find($item['menu_item_id']);
                // Il est crucial de valider le prix côté serveur
                if ($menuItem->price != $item['price']) {
                    // Gérer l'erreur de prix si nécessaire, ici on force le prix de la BDD
                }
                $subtotal += $menuItem->price * $item['quantity'];
                $orderItemsData[] = [
                    'menu_item_id' => $menuItem->id,
                    'item_name' => $menuItem->name,
                    'quantity' => $item['quantity'],
                    'unit_price' => $menuItem->price,
                    'subtotal' => $menuItem->price * $item['quantity'],
                ];
            }

            // 2. Gérer la réduction par points de fidélité
            $points_used = 0;
            $discount_amount = 0;
            $points_to_use = $validated['points_to_use'] ?? 0;

            if ($points_to_use > 0) {
                // Vérifier si l'utilisateur a assez de points
                if ($user->loyalty_points >= $points_to_use) {
                    // S'assurer que les points utilisés sont un multiple de 15
                    $points_used = floor($points_to_use / $points_per_discount_unit) * $points_per_discount_unit;
                    $discount_amount = ($points_used / $points_per_discount_unit) * $discount_per_unit;
                }
            }

            // 3. Calculer le total final
            $total_amount = $subtotal - $discount_amount;
            if ($total_amount < 0) {
                $total_amount = 0; // Le total ne peut pas être négatif
            }

            // 4. Calculer les points gagnés sur cette commande (basé sur le montant payé)
            $points_earned = floor($total_amount / $frs_per_point);

            // 5. Créer la commande
            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => Order::generateOrderNumber(),
                'delivery_type' => $validated['delivery_type'],
                'delivery_address' => $validated['delivery_address'] ?? null,
                'delivery_time' => $validated['delivery_time'] ?? null,
                'comment' => $validated['comment'] ?? null,
                'subtotal' => $subtotal,
                'discount_amount' => $discount_amount,
                'total_amount' => $total_amount,
                'points_used' => $points_used,
                'points_earned' => $points_earned,
                'status' => 'pending', // Statut initial
            ]);

            // 6. Créer les articles de la commande et déduire les points
            $order->items()->createMany($orderItemsData);
            if ($points_used > 0) {
                $user->deductLoyaltyPoints($points_used, "Réduction commande #{$order->order_number}", $order->id);
            }

            $order->markAsCompleted();

            return $order;
        });

        return response()->json($order->load('items.menuItem'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        // S'assurer que l'utilisateur peut voir cette commande
        $this->authorize('view', $order);
        return response()->json($order->load('user', 'items.menuItem', 'payment', 'complaints'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateOrderRequest $request, Order $order)
    {
        $this->authorize('update', $order);
        $order->update($request->validated());
        return response()->json($order);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order)
    {
        $this->authorize('delete', $order);
        $order->delete();

        return response()->json(null, 204);
    }
}