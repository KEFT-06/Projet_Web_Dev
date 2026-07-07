<?php
namespace App\Policies;

use App\Models\MenuItem;
use App\Models\User;

class MenuItemPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('menu:view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('menu:create');
    }

    public function update(User $user, MenuItem $menuItem): bool
    {
        return $user->hasPermissionTo('menu:edit');
    }

    public function delete(User $user, MenuItem $menuItem): bool
    {
        return $user->hasPermissionTo('menu:delete');
    }

    public function toggleAvailability(User $user, MenuItem $menuItem): bool
    {
        return $user->hasPermissionTo('menu:toggle-availability');
    }
}
?>