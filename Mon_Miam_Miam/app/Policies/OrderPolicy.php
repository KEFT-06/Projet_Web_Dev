<?php
namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('orders:list');
    }

    public function view(User $user, Order $order): bool
    {
        // L'étudiant peut voir ses propres commandes
        if ($user->isStudent() && $order->user_id === $user->id) {
            return true;
        }

        // Le staff peut voir toutes les commandes
        if ($user->isStaff()) {
            return true;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('orders:create');
    }

    public function update(User $user, Order $order): bool
    {
        // Admin peut tout faire
        if ($user->isAdmin()) {
            return true;
        }

        // Manager et employé peuvent modifier les statuts (sauf complétées)
        if ($user->isStaff() && $order->status !== 'completed') {
            return $user->hasPermissionTo('orders:update');
        }

        return false;
    }

    public function cancel(User $user, Order $order): bool
    {
        // L'étudiant peut annuler ses propres commandes (sauf si en préparation)
        if ($user->isStudent() && $order->user_id === $user->id) {
            return $order->status === 'pending' && $user->hasPermissionTo('orders:cancel');
        }

        // Admin peut annuler n'importe quelle commande
        if ($user->isAdmin()) {
            return true;
        }

        return false;
    }
}
?>
