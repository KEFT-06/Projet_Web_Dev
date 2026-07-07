<?php
namespace App\Traits;

trait HasRoles
{
    /**
     * Vérifier si l'utilisateur est un rôle spécifique
     */
    public function isStudent(): bool
    {
        return $this->hasRole('student');
    }

    public function isEmployee(): bool
    {
        return $this->hasRole('employee');
    }

    public function isManager(): bool
    {
        return $this->hasRole('manager');
    }

    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    /**
     * Vérifier si l'utilisateur est une personne interne (non étudiant)
     */
    public function isStaff(): bool
    {
        return $this->hasAnyRole(['employee', 'manager', 'admin']);
    }

    /**
     * Vérifier si l'utilisateur peut gérer un utilisateur
     */
    public function canManageUser($user): bool
    {
        // Admin peut manager tout le monde
        if ($this->isAdmin()) {
            return true;
        }

        // Manager peut manager les employés
        if ($this->isManager() && $user->isEmployee()) {
            return true;
        }

        return false;
    }

    /**
     * Vérifier si l'utilisateur peut voir une commande
     */
    public function canViewOrder($order): bool
    {
        // L'étudiant peut voir ses propres commandes
        if ($this->isStudent()) {
            return $order->user_id === $this->id;
        }

        // Les staff peuvent voir toutes les commandes
        if ($this->isStaff()) {
            return true;
        }

        return false;
    }

    /**
     * Vérifier si l'utilisateur peut modifier une commande
     */
    public function canUpdateOrder($order): bool
    {
        // Admin peut tout faire
        if ($this->isAdmin()) {
            return true;
        }

        // Manager et employé peuvent modifier les statuts
        if ($this->isStaff() && !$order->completed) {
            return true;
        }

        return false;
    }

    /**
     * Obtenir toutes les permissions de l'utilisateur (via Spatie Permission)
     * Cette méthode est redéfinie pour éviter les conflits
     */
    public function getUserPermissions(): array
    {
        return $this->getPermissionNames()->toArray();
    }
}
?>