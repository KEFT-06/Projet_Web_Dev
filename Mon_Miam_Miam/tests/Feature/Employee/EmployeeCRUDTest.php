<?php
namespace Tests\Feature\Employee;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class EmployeeCRUDTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $manager;
    protected User $employee;
    protected User $student;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->seed(\Database\Seeders\RolePermissionSeeder::class);
        
        // Créer les utilisateurs de test
        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
        
        $this->manager = User::factory()->create();
        $this->manager->assignRole('manager');
        
        $this->employee = User::factory()->create();
        $this->employee->assignRole('employee');
        Employee::factory()->create(['user_id' => $this->employee->id]);
        
        $this->student = User::factory()->create();
        $this->student->assignRole('student');
    }

    #[Test]
    public function test_admin_can_list_employees()
    {
        Employee::factory()->count(5)->create();

        $response = $this->actingAs($this->admin)
            ->getJson('/api/employees');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'user',
                        'role',
                        'position',
                        'status',
                    ],
                ],
            ]);
    }

    #[Test]
    public function test_manager_can_list_employees()
    {
        $response = $this->actingAs($this->manager)
            ->getJson('/api/employees');

        $response->assertStatus(200);
    }
    
    #[Test]
    public function test_student_cannot_list_employees()
    {
        $response = $this->actingAs($this->student)
            ->getJson('/api/employees');

        $response->assertStatus(403);
    }
    
    #[Test]
    public function test_admin_can_create_employee()
    {
        $employeeData = [
            'name' => 'Nouveau Employé',
            'email' => 'nouveau@monmiammiam.com',
            'phone' => '+237650000099',
            'password' => 'Password123',
            'role' => 'employee',
            'position' => 'Serveur',
            'hire_date' => '2024-01-15',
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/employees', $employeeData);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Employé créé avec succès',
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'nouveau@monmiammiam.com',
        ]);

        $this->assertDatabaseHas('employees', [
            'position' => 'Serveur',
        ]);
    }

    #[Test]
    public function test_manager_can_create_employee()
    {
        $employeeData = [
            'name' => 'Employé du Manager',
            'email' => 'emp.manager@monmiammiam.com',
            'phone' => '+237650000088',
            'password' => 'Password123',
            'role' => 'employee',
            'position' => 'Cuisinier',
        ];

        $response = $this->actingAs($this->manager)
            ->postJson('/api/employees', $employeeData);

        $response->assertStatus(201);
    }
    
    #[Test]
    public function test_manager_cannot_create_manager()
    {
        $managerData = [
            'name' => 'Nouveau Manager',
            'email' => 'nouveau.manager@monmiammiam.com',
            'phone' => '+237650000077',
            'password' => 'Password123',
            'role' => 'manager',
            'position' => 'Gérant',
        ];

        $response = $this->actingAs($this->manager)
            ->postJson('/api/employees', $managerData);

        $response->assertStatus(403)
            ->assertJson([
                'message' => 'Seul un administrateur peut créer un manager',
            ]);
    }
    
    #[Test]
    public function test_admin_can_create_manager()
    {
        $managerData = [
            'name' => 'Nouveau Manager',
            'email' => 'nouveau.manager@monmiammiam.com',
            'phone' => '+237650000066',
            'password' => 'Password123',
            'role' => 'manager',
            'position' => 'Gérant',
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/employees', $managerData);

        $response->assertStatus(201);
    }
    
    #[Test]
    public function test_email_must_be_unique()
    {
        $employeeData = [
            'name' => 'Test',
            'email' => $this->employee->email, // Email déjà existant
            'phone' => '+237650000055',
            'password' => 'Password123',
            'role' => 'employee',
            'position' => 'Serveur',
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/employees', $employeeData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }
    
    #[Test]
    public function test_password_must_be_strong()
    {
        $employeeData = [
            'name' => 'Test',
            'email' => 'test@example.com',
            'phone' => '+237650000044',
            'password' => 'weak', // Mot de passe faible
            'role' => 'employee',
            'position' => 'Serveur',
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/employees', $employeeData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }
    
    #[Test]
    public function test_admin_can_update_employee()
    {
        $employee = Employee::factory()->create();

        $updateData = [
            'name' => 'Nom Modifié',
            'position' => 'Chef Cuisinier',
        ];

        $response = $this->actingAs($this->admin)
            ->putJson("/api/employees/{$employee->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Employé mis à jour avec succès',
            ]);

        $this->assertEquals('Nom Modifié', $employee->fresh()->user->name);
        $this->assertEquals('Chef Cuisinier', $employee->fresh()->position);
    }
    
    #[Test]
    public function test_manager_can_update_employee()
    {
        $employee = Employee::factory()->create();
        $employee->user->assignRole('employee');

        $response = $this->actingAs($this->manager)
            ->putJson("/api/employees/{$employee->id}", [
                'position' => 'Serveur Senior',
            ]);

        $response->assertStatus(200);
    }
    
    #[Test]
    public function test_manager_cannot_update_other_manager()
    {
        $otherManager = User::factory()->create();
        $otherManager->assignRole('manager');
        $managerEmployee = Employee::factory()->create(['user_id' => $otherManager->id]);

        $response = $this->actingAs($this->manager)
            ->putJson("/api/employees/{$managerEmployee->id}", [
                'position' => 'Nouvelle Position',
            ]);

        $response->assertStatus(403);
    }
    
    #[Test]
    public function test_admin_can_toggle_employee_status()
    {
        $employee = Employee::factory()->create(['status' => 'active']);

        $response = $this->actingAs($this->admin)
            ->patchJson("/api/employees/{$employee->id}/status", [
                'status' => 'inactive',
            ]);

        $response->assertStatus(200);
        $this->assertEquals('inactive', $employee->fresh()->status);
    }
    
    #[Test]
    public function test_admin_can_delete_employee()
    {
        $employee = Employee::factory()->create();

        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/employees/{$employee->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('employees', ['id' => $employee->id]);
    }
    
    #[Test]
    public function test_manager_cannot_delete_employee()
    {
        $employee = Employee::factory()->create();

        $response = $this->actingAs($this->manager)
            ->deleteJson("/api/employees/{$employee->id}");

        $response->assertStatus(403);
    }
    
    #[Test]
    public function test_cannot_delete_self()
    {
        $adminEmployee = Employee::factory()->create(['user_id' => $this->admin->id]);

        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/employees/{$adminEmployee->id}");

        $response->assertStatus(403)
            ->assertJson([
                'message' => 'Vous ne pouvez pas vous supprimer vous-même',
            ]);
    }
    
    #[Test]
    public function test_admin_can_change_employee_role()
    {
        $employee = Employee::factory()->create();
        $employee->user->assignRole('employee');

        $response = $this->actingAs($this->admin)
            ->patchJson("/api/employees/{$employee->id}/role", [
                'role' => 'manager',
            ]);

        $response->assertStatus(200);
        $this->assertTrue($employee->fresh()->user->hasRole('manager'));
    }
    
    #[Test]
    public function test_manager_cannot_change_role()
    {
        $employee = Employee::factory()->create();
        $employee->user->assignRole('employee');

        $response = $this->actingAs($this->manager)
            ->patchJson("/api/employees/{$employee->id}/role", [
                'role' => 'manager',
            ]);

        $response->assertStatus(403);
    }
    
    #[Test]
    public function test_can_filter_employees_by_status()
    {
        Employee::factory()->create(['status' => 'active']);
        Employee::factory()->create(['status' => 'inactive']);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/employees?status=active');

        $response->assertStatus(200);
        
        $data = $response->json('data');
        $this->assertNotEmpty($data);
        
        foreach ($data as $employee) {
            $this->assertEquals('active', $employee['status']);
        }
    }
    
    #[Test]
    public function test_can_search_employees()
    {
        $employee = Employee::factory()->create();
        $employee->user->update(['name' => 'Jean Dupont']);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/employees?search=Jean');

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'Jean Dupont']);
    }
    
    #[Test]
    public function test_can_get_employee_statistics()
    {
        Employee::factory()->count(5)->create(['status' => 'active']);
        Employee::factory()->count(2)->create(['status' => 'inactive']);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/employees/stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'total',
                'active',
                'inactive',
                'by_role',
                'by_position',
                'recent_hires',
                'average_tenure_days',
            ]);
    }
    
    #[Test]
    public function test_pagination_works()
    {
        Employee::factory()->count(25)->create();

        $response = $this->actingAs($this->admin)
            ->getJson('/api/employees?per_page=10');

        $response->assertStatus(200)
            ->assertJsonCount(10, 'data');
    }
}
