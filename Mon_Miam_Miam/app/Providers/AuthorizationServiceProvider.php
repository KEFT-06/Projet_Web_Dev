<?php
namespace App\Providers;

use App\Models\Complaint;
use App\Models\Employee;
use App\Models\MenuItem;
use App\Models\Order;
use App\Policies\ComplaintPolicy;
use App\Policies\EmployeePolicy;
use App\Policies\MenuItemPolicy;
use App\Policies\OrderPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Order::class => OrderPolicy::class,
        MenuItem::class => MenuItemPolicy::class,
        Employee::class => EmployeePolicy::class,
        Complaint::class => ComplaintPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
?>