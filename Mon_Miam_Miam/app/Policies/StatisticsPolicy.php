<?php
namespace App\Policies;

use App\Models\User;

class StatisticsPolicy
{
    public function view(User $user): bool
    {
        return $user->isStaff() && $user->hasPermissionTo('statistics:view');
    }

    public function export(User $user): bool
    {
        return $user->hasAnyRole(['manager', 'admin']) && $user->hasPermissionTo('statistics:export');
    }
}
?>