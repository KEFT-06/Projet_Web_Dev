<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Referral;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ReferralController extends Controller
{
    /**
     * Récupère le code de parrainage de l'utilisateur authentifié.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCode()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        return response()->json([
            'referral_code' => $user->referral_code,
        ]);
    }

    /**
     * Applique un code de parrainage à l'utilisateur authentifié.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function applyCode(Request $request)
    {
        $validated = $request->validate([
            'referral_code' => ['required', 'string', 'exists:users,referral_code'],
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        // 1. Vérifier que l'utilisateur n'a pas déjà un parrain
        if ($user->referrer_id) {
            return response()->json(['message' => 'Vous avez déjà utilisé un code de parrainage.'], 422);
        }

        // 2. Trouver le parrain
        $referrer = User::where('referral_code', $validated['referral_code'])->first();

        // 3. Vérifier que l'utilisateur ne s'auto-parraine pas
        if ($referrer && $referrer->id === $user->id) {
            return response()->json(['message' => 'Vous ne pouvez pas utiliser votre propre code de parrainage.'], 422);
        }

        // 4. Appliquer le parrainage
        DB::transaction(function () use ($user, $referrer) {
            $user->update(['referrer_id' => $referrer->id]);

            // Créer l'enregistrement de parrainage
            Referral::create([
                'referrer_id' => $referrer->id,
                'referee_id' => $user->id,
                'reward_points' => Setting::get('referral.reward_points', 5), // Utilise un paramètre
                'status' => 'pending',
            ]);
        });

        return response()->json([
            'message' => 'Code de parrainage appliqué avec succès !',
        ]);
    }

    /**
     * Affiche les statistiques de parrainage pour l'utilisateur authentifié.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function stats()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $referrals = $user->referrals(); // Relation hasMany

        $totalReferrals = $referrals->count();
        $completedReferrals = $referrals->clone()->completed()->count();
        $pendingReferrals = $referrals->clone()->pending()->count();
        $totalPointsEarned = $referrals->clone()->completed()->sum('reward_points');

        return response()->json([
            'total_referrals' => $totalReferrals,
            'completed_referrals' => $completedReferrals,
            'pending_referrals' => $pendingReferrals,
            'total_points_earned' => (int) $totalPointsEarned,
        ]);
    }

    /**
     * Liste les filleuls de l'utilisateur authentifié.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function myReferrals()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $referrals = $user->referrals()->with('referee:id,name,email,created_at')->latest()->paginate(15);

        return response()->json($referrals);
    }
}