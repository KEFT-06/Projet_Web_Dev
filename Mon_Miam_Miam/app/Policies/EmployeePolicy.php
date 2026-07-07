<?php

namespace App\Policies;

use App\Models\Employee;
use App\Models\User;

class EmployeePolicy
{
    /**
     * Voir la liste des employés
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['manager', 'admin']);
    }

    /**
     * Voir un employé spécifique
     */
    public function view(User $user, Employee $employee): bool
    {
        return $user->hasAnyRole(['manager', 'admin']);
    }

    /**
     * Créer un employé
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['manager', 'admin']) 
            && $user->hasPermissionTo('employees:create');
    }

    /**
     * Modifier un employé
     */
    public function update(User $user, Employee $employee): bool
    {
        // Admin peut tout modifier
        if ($user->isAdmin()) {
            return true;
        }

        // Manager peut modifier les employés (pas les autres managers)
        if ($user->isManager()) {
            $employeeRole = $employee->user->getRoleNames()->first();
            return $employeeRole === 'employee';
        }

        return false;
    }

    /**
     * Supprimer un employé (Admin uniquement)
     */
    public function delete(User $user, Employee $employee): bool
    {
        // Seul l'admin peut supprimer
        if (!$user->isAdmin()) {
            return false;
        }

        // Ne peut pas supprimer un autre admin
        if ($employee->user->isAdmin()) {
            return false;
        }

        // Ne peut pas se supprimer soi-même
        if ($employee->user_id === $user->id) {
            return false;
        }

        return true;
    }

    /**
     * Changer le statut (Manager + Admin)
     */
    public function toggleStatus(User $user, Employee $employee): bool
    {
        return $this->update($user, $employee);
    }

    /**
     * Changer le rôle (Admin uniquement)
     */
    public function changeRole(User $user): bool
    {
        return $user->isAdmin();
    }
}