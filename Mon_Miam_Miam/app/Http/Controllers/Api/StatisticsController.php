<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * @OA\Tag(
 *     name="Statistics",
 *     description="Endpoints pour les statistiques de l'application"
 * )
 */
class StatisticsController extends Controller
{
    use AuthorizesRequests;

    /**
     * Affiche les statistiques du tableau de bord pour les admins/managers.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function dashboard(Request $request)
    {
        $this->authorize('view', 'statistics'); // Utilise StatisticsPolicy

        // Logique pour les statistiques du dashboard (à implémenter)
        $stats = [
            'total_sales' => Order::where('status', 'completed')->sum('total_amount'),
            'total_orders' => Order::count(),
            'new_users' => User::where('created_at', '>=', now()->subMonth())->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Affiche les statistiques de la semaine pour les employés.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function weekStats(Request $request)
    {
        $this->authorize('view', 'statistics'); // Utilise StatisticsPolicy

        // Logique pour les statistiques de la semaine (à implémenter)
        $stats = ['message' => "Statistiques de la semaine à implémenter."];
        return response()->json($stats);
    }

    public function export(Request $request)
    {
        $this->authorize('export', 'statistics'); // Utilise StatisticsPolicy
        return response()->json(['message' => 'Fonctionnalité d\'exportation à implémenter.']);
    }
}
