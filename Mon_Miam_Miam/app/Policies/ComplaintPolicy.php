<?php
namespace App\Policies;

use App\Models\Complaint;
use App\Models\User;

class ComplaintPolicy
{
    public function viewAny(User $user): bool
    {
        if ($user->isStudent()) {
            return $user->hasPermissionTo('complaints:view-own');
        }

        return $user->isStaff() && $user->hasPermissionTo('complaints:list');
    }

    public function view(User $user, Complaint $complaint): bool
    {
        // L'étudiant peut voir ses propres réclamations
        if ($user->isStudent() && $complaint->user_id === $user->id) {
            return true;
        }

        // Le staff peut voir toutes les réclamations
        if ($user->isStaff()) {
            return true;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->isStudent() && $user->hasPermissionTo('complaints:create');
    }

    public function update(User $user, Complaint $complaint): bool
    {
        // Les employés peuvent répondre
        if ($user->isEmployee()) {
            return $user->hasPermissionTo('complaints:update');
        }

        // Manager et admin peuvent résoudre
        if ($user->hasAnyRole(['manager', 'admin'])) {
            return $user->hasPermissionTo('complaints:resolve');
        }

        return false;
    }
}
?>
