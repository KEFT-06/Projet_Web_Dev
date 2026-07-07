<?php
namespace Tests\Unit\Employee;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;
use Spatie\Permission\Models\Permission;


class EmployeeUnitTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Seed les rôles et permissions
        $this->seed(\Database\Seeders\RolePermissionSeeder::class);

        Permission::firstOrCreate(['name' => 'orders:list']);
        Permission::firstOrCreate(['name' => 'orders:update']);
        Permission::firstOrCreate(['name' => 'menu:view']);
    }

    #[Test]
    // Test 1 : Création d'un employé
    public function test_can_create_employee()
    {
        // Créer un utilisateur
        $user = User::factory()->create([
            'name' => 'Jean Dupont',
            'email' => 'jean@example.com',
        ]);

        // Assigner le rôle
        $user->assignRole('employee');

        // Créer l'employé
        $employee = Employee::create([
            'user_id' => $user->id,
            'status' => 'active',
            'position' => 'Serveur',
            'hire_date' => now(),
        ]);

        // Assertions
        $this->assertInstanceOf(Employee::class, $employee);
        $this->assertEquals('Serveur', $employee->position);
        $this->assertEquals('active', $employee->status);
        $this->assertEquals($user->id, $employee->user_id);
        
        // Vérifier la relation
        $this->assertEquals('Jean Dupont', $employee->user->name);
    }


    #[Test]
    // Test 2 : Modification d'un employé
    public function test_can_update_employee()
    {
        $employee = Employee::factory()->create([
            'position' => 'Serveur',
            'status' => 'active',
        ]);

        // Modifier l'employé
        $employee->update([
            'position' => 'Chef Serveur',
            'status' => 'inactive',
        ]);

        // Recharger depuis la BD
        $employee->refresh();

        // Assertions
        $this->assertEquals('Chef Serveur', $employee->position);
        $this->assertEquals('inactive', $employee->status);
    }
    

    #[Test]
    // Test 3 : Suppression d'un employé (soft delete)
    public function test_can_soft_delete_employee()
    {
        $employee = Employee::factory()->create();
        $employeeId = $employee->id;

        // Supprimer (soft delete)
        $employee->delete();

        // Vérifier que l'employé n'est plus accessible normalement
        $this->assertNull(Employee::find($employeeId));

        // Vérifier que l'employé existe toujours avec les soft deleted
        $this->assertNotNull(Employee::withTrashed()->find($employeeId));
        
        // Vérifier que deleted_at est rempli
        $deletedEmployee = Employee::withTrashed()->find($employeeId);
        $this->assertNotNull($deletedEmployee->deleted_at);
    }

    #[Test]
    // Test 4 : Activation/Désactivation d'un employé
    public function test_can_toggle_employee_status()
    {
        $employee = Employee::factory()->create(['status' => 'active']);

        // Désactiver
        $employee->update(['status' => 'inactive']);
        $this->assertEquals('inactive', $employee->fresh()->status);

        // Réactiver
        $employee->update(['status' => 'active']);
        $this->assertEquals('active', $employee->fresh()->status);
    }

    #[Test]
    // Test 5 : Changement de rôle d'un employé
    public function test_can_change_employee_role()
    {
        $employee = Employee::factory()->create();
        $user = $employee->user;
        
        // Assigner rôle employee
        $user->assignRole('employee');
        $this->assertTrue($user->hasRole('employee'));

        // Changer en manager
        $user->syncRoles(['manager']);
        $this->assertTrue($user->hasRole('manager'));
        $this->assertFalse($user->hasRole('employee'));

        // Revenir à employee
        $user->syncRoles(['employee']);
        $this->assertTrue($user->hasRole('employee'));
        $this->assertFalse($user->hasRole('manager'));
    }

    #[Test]
    // Test 6 : Validation des données
    public function test_employee_requires_user_id()
    {
        $this->expectException(\Illuminate\Database\QueryException::class);

        // Tenter de créer un employé sans user_id
        Employee::create([
            'status' => 'active',
            'position' => 'Serveur',
        ]);
    }

    #[Test]
    // Test 7 : Test des permissions
    public function test_employee_has_correct_permissions()
    {
        $user = User::factory()->create();
        $user->assignRole('employee');
        $employee = Employee::factory()->create(['user_id' => $user->id]);

        // Vérifier les permissions de l'employé
        $this->assertTrue($user->hasPermissionTo('orders:list'));
        $this->assertTrue($user->hasPermissionTo('orders:update'));
        $this->assertTrue($user->hasPermissionTo('menu:view'));
        
        // Vérifier qu'il n'a pas certaines permissions
        $this->assertFalse($user->hasPermissionTo('employee.create'));
        $this->assertFalse($user->hasPermissionTo('employee.delete'));

    }

    #[Test]
    // Test 8 : Test soft delete avec restauration
    public function test_soft_deleted_employee_can_be_restored()
    {
        $employee = Employee::factory()->create();
        $employeeId = $employee->id;

        // Supprimer
        $employee->delete();
        $this->assertSoftDeleted('employees', ['id' => $employeeId]);

        // Restaurer
        $employee->restore();
        
        // Vérifier que l'employé est de nouveau accessible
        $restoredEmployee = Employee::find($employeeId);
        $this->assertNotNull($restoredEmployee);
        $this->assertNull($restoredEmployee->deleted_at);
    }

    #[Test]
    // Test Bonus : Relation User ↔ Employee
    public function test_employee_belongs_to_user()
    {
        $user = User::factory()->create(['name' => 'Test User']);
        $employee = Employee::factory()->create(['user_id' => $user->id]);

        // Vérifier la relation
        $this->assertInstanceOf(User::class, $employee->user);
        $this->assertEquals('Test User', $employee->user->name);
    }
    
    #[Test]
    // Test Bonus : User peut avoir un Employee
    public function test_user_can_have_employee()
    {
        $user = User::factory()->create();
        $employee = Employee::factory()->create(['user_id' => $user->id]);

        // Vérifier la relation inverse
        $this->assertInstanceOf(Employee::class, $user->employee);
        $this->assertEquals($employee->id, $user->employee->id);
    }

    #[Test]
    // Test Bonus : Ancienneté (tenure)
    public function test_can_calculate_employee_tenure()
    {
        $hireDate = now()->subDays(365); // Embauché il y a 1 an
        $employee = Employee::factory()->create([
            'hire_date' => $hireDate,
        ]);

        $tenureDays = $employee->hire_date->diffInDays(now());

        $this->assertEqualsWithDelta(365, $tenureDays, 1);

    }

    #[Test]
    // Test Bonus : Scope Active
    public function test_active_scope_returns_only_active_employees()
    {
        Employee::factory()->count(3)->create(['status' => 'active']);
        Employee::factory()->count(2)->create(['status' => 'inactive']);

        $activeEmployees = Employee::where('status', 'active')->get();

        $this->assertCount(3, $activeEmployees);
        
        foreach ($activeEmployees as $employee) {
            $this->assertEquals('active', $employee->status);
        }
    }
}
// =============================================================================
// COMMANDE POUR LANCER CES TESTS
// =============================================================================

/*
# Lancer tous les tests unitaires employés
php artisan test tests/Unit/Employee/EmployeeUnitTest.php

# Lancer un test spécifique
php artisan test --filter test_can_create_employee

# Avec détails
php artisan test tests/Unit/Employee/EmployeeUnitTest.php -vvv

# Avec couverture
php artisan test tests/Unit/Employee/EmployeeUnitTest.php --coverage
*/
