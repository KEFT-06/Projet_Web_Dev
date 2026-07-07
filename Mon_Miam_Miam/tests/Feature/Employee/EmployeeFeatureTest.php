<?php

namespace Tests\Feature\Employee;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EmployeeFeatureTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $manager;
    protected User $employee;
    protected User $student;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Seed les rôles et permissions
        $this->seed(\Database\Seeders\RolePermissionSeeder::class);
        
        // Créer les utilisateurs de test
        $this->admin = User::factory()->create(['email' => 'admin@test.com']);
        $this->admin->assignRole('admin');
        
        $this->manager = User::factory()->create(['email' => 'manager@test.com']);
        $this->manager->assignRole('manager');
        
        $this->employee = User::factory()->create(['email' => 'employee@test.com']);
        $this->employee->assignRole('employee');
        Employee::factory()->create(['user_id' => $this->employee->id]);
        
        $this->student = User::factory()->create(['email' => 'student@test.com']);
        $this->student->assignRole('student');
    }

    /**
     * Test Feature 1 : Manager peut créer un employé
     * 
     * @test
     */
    public function test_manager_can_create_employee()
    {
        $employeeData = [
            'name' => 'Nouveau Employé',
            'email' => 'nouveau.employee@test.com',
            'phone' => '+237650111111',
            'password' => 'Password123',
            'role' => 'employee',
            'position' => 'Serveur',
            'hire_date' => '2024-01-15',
        ];

        $response = $this->actingAs($this->manager)
            ->postJson('/api/employees', $employeeData);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Employé créé avec succès',
            ])
            ->assertJsonStructure([
                'message',
                'employee' => [
                    'id',
                    'user' => ['id', 'name', 'email', 'phone'],
                    'role',
                    'position',
                    'status',
                ],
            ]);

        // Vérifier en base de données
        $this->assertDatabaseHas('users', [
            'email' => 'nouveau.employee@test.com',
            'name' => 'Nouveau Employé',
        ]);

        $this->assertDatabaseHas('employees', [
            'position' => 'Serveur',
            'status' => 'active',
        ]);

        // Vérifier que le rôle est assigné
        $user = User::where('email', 'nouveau.employee@test.com')->first();
        $this->assertTrue($user->hasRole('employee'));
    }

    /**
     * Test Feature 2 : Manager ne peut PAS créer un manager
     * 
     * @test
     */
    public function test_manager_cannot_create_manager()
    {
        $managerData = [
            'name' => 'Tentative Manager',
            'email' => 'tentative.manager@test.com',
            'phone' => '+237650222222',
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

        // Vérifier que l'utilisateur n'a PAS été créé
        $this->assertDatabaseMissing('users', [
            'email' => 'tentative.manager@test.com',
        ]);
    }

    /**
     * Test Feature 3 : Admin peut tout créer (employee ET manager)
     * 
     * @test
     */
    public function test_admin_can_create_both_employee_and_manager()
    {
        // Créer un employé
        $employeeData = [
            'name' => 'Employé Admin',
            'email' => 'employee.admin@test.com',
            'phone' => '+237650333333',
            'password' => 'Password123',
            'role' => 'employee',
            'position' => 'Cuisinier',
        ];

        $response1 = $this->actingAs($this->admin)
            ->postJson('/api/employees', $employeeData);

        $response1->assertStatus(201);

        // Créer un manager
        $managerData = [
            'name' => 'Manager Admin',
            'email' => 'manager.admin@test.com',
            'phone' => '+237650444444',
            'password' => 'Password123',
            'role' => 'manager',
            'position' => 'Gérant',
        ];

        $response2 = $this->actingAs($this->admin)
            ->postJson('/api/employees', $managerData);

        $response2->assertStatus(201);

        // Vérifier les deux créations
        $this->assertDatabaseHas('users', ['email' => 'employee.admin@test.com']);
        $this->assertDatabaseHas('users', ['email' => 'manager.admin@test.com']);

        // Vérifier les rôles
        $emp = User::where('email', 'employee.admin@test.com')->first();
        $mgr = User::where('email', 'manager.admin@test.com')->first();
        
        $this->assertTrue($emp->hasRole('employee'));
        $this->assertTrue($mgr->hasRole('manager'));
    }

    /**
     * Test Feature 4 : Employee ne peut PAS accéder à l'API
     * 
     * @test
     */
    public function test_employee_cannot_access_employee_api()
    {
        // Tenter de lister les employés
        $response1 = $this->actingAs($this->employee)
            ->getJson('/api/employees');

        $response1->assertStatus(403);

        // Tenter de créer un employé
        $response2 = $this->actingAs($this->employee)
            ->postJson('/api/employees', [
                'name' => 'Test',
                'email' => 'test@test.com',
                'phone' => '+237650555555',
                'password' => 'Password123',
                'role' => 'employee',
                'position' => 'Test',
            ]);

        $response2->assertStatus(403);
    }

    /**
     * Test Feature 5 : Manager ne peut PAS supprimer
     * 
     * @test
     */
    public function test_manager_cannot_delete_employee()
    {
        $employee = Employee::factory()->create();

        $response = $this->actingAs($this->manager)
            ->deleteJson("/api/employees/{$employee->id}");

        $response->assertStatus(403);

        // Vérifier que l'employé existe toujours
        $this->assertDatabaseHas('employees', [
            'id' => $employee->id,
            'deleted_at' => null,
        ]);
    }

    /**
     * Test Feature 6 : Admin peut supprimer
     * 
     * @test
     */
    public function test_admin_can_delete_employee()
    {
        $employee = Employee::factory()->create();
        $employeeId = $employee->id;

        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/employees/{$employeeId}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Employé supprimé avec succès',
            ]);

        // Vérifier soft delete
        $this->assertSoftDeleted('employees', ['id' => $employeeId]);
    }

    /**
     * Test Feature 7 : Les filtres fonctionnent
     * 
     * @test
     */
    public function test_filters_work_correctly()
    {
        // Créer des employés avec différents statuts
        Employee::factory()->count(3)->create(['status' => 'active']);
        Employee::factory()->count(2)->create(['status' => 'inactive']);

        // Filtrer par statut active
        $response = $this->actingAs($this->admin)
            ->getJson('/api/employees?status=active');

        $response->assertStatus(200);
        
        $data = $response->json('data');
        
        // Tous doivent être actifs
        foreach ($data as $employee) {
            $this->assertEquals('active', $employee['status']);
        }

        // Filtrer par statut inactive
        $response2 = $this->actingAs($this->admin)
            ->getJson('/api/employees?status=inactive');

        $response2->assertStatus(200);
        
        $data2 = $response2->json('data');
        
        foreach ($data2 as $employee) {
            $this->assertEquals('inactive', $employee['status']);
        }
    }

    /**
     * Test Feature 8 : La recherche fonctionne
     * 
     * @test
     */
    public function test_search_works_correctly()
    {
        // Créer des employés avec des noms spécifiques
        $user1 = User::factory()->create(['name' => 'Jean Dupont']);
        Employee::factory()->create(['user_id' => $user1->id]);

        $user2 = User::factory()->create(['name' => 'Marie Martin']);
        Employee::factory()->create(['user_id' => $user2->id]);

        $user3 = User::factory()->create(['name' => 'Paul Bernard']);
        Employee::factory()->create(['user_id' => $user3->id]);

        // Rechercher "Jean"
        $response = $this->actingAs($this->admin)
            ->getJson('/api/employees?search=Jean');

        $response->assertStatus(200);
        
        $data = $response->json('data');
        $this->assertNotEmpty($data);
        
        // Vérifier que "Jean" est dans les résultats
        $names = collect($data)->pluck('user.name')->toArray();
        $this->assertContains('Jean Dupont', $names);
        
        // Rechercher "Marie"
        $response2 = $this->actingAs($this->admin)
            ->getJson('/api/employees?search=Marie');

        $response2->assertStatus(200)
            ->assertJsonFragment(['name' => 'Marie Martin']);
    }

    /**
     * Test Feature 9 : La pagination fonctionne
     * 
     * @test
     */
    public function test_pagination_works_correctly()
    {
        // Créer 25 employés
        Employee::factory()->count(25)->create();

        // Demander 10 par page
        $response = $this->actingAs($this->admin)
            ->getJson('/api/employees?per_page=10&page=1');

        $response->assertStatus(200)
            ->assertJsonCount(10, 'data')
            ->assertJsonStructure([
                'data',
                'current_page',
                'per_page',
                'total',
                'last_page',
            ]);

        $json = $response->json();
        $this->assertEquals(10, $json['per_page']);
        $this->assertEquals(1, $json['current_page']);
        $this->assertTrue($json['total'] >= 25);

        // Demander page 2
        $response2 = $this->actingAs($this->admin)
            ->getJson('/api/employees?per_page=10&page=2');

        $response2->assertStatus(200)
            ->assertJsonCount(10, 'data');

        $json2 = $response2->json();
        $this->assertEquals(2, $json2['current_page']);
    }

    /**
     * Test Feature 10 : Soft delete fonctionne correctement
     * 
     * @test
     */
    public function test_soft_delete_works_and_excluded_from_list()
    {
        $employee = Employee::factory()->create();
        $employeeId = $employee->id;

        // Supprimer
        $this->actingAs($this->admin)
            ->deleteJson("/api/employees/{$employeeId}");

        // Vérifier que l'employé n'apparaît plus dans la liste
        $response = $this->actingAs($this->admin)
            ->getJson('/api/employees');

        $data = $response->json('data');
        $ids = collect($data)->pluck('id')->toArray();
        
        $this->assertNotContains($employeeId, $ids);

        // Vérifier en BD que deleted_at est rempli
        $this->assertSoftDeleted('employees', ['id' => $employeeId]);
    }

    /**
     * Test Feature 11 : Impossible de se supprimer soi-même
     * 
     * @test
     */
    public function test_cannot_delete_self()
    {
        // Créer un employé pour l'admin
        $adminEmployee = Employee::factory()->create(['user_id' => $this->admin->id]);

        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/employees/{$adminEmployee->id}");

        $response->assertStatus(403)
            ->assertJson([
                'message' => 'Vous ne pouvez pas vous supprimer vous-même',
            ]);

        // Vérifier que l'employé existe toujours
        $this->assertDatabaseHas('employees', [
            'id' => $adminEmployee->id,
            'deleted_at' => null,
        ]);
    }

    /**
     * Test Feature 12 : Validation email unique
     * 
     * @test
     */
    public function test_email_must_be_unique()
    {
        // Créer un premier employé
        $existingUser = User::factory()->create(['email' => 'existing@test.com']);
        Employee::factory()->create(['user_id' => $existingUser->id]);

        // Tenter de créer un deuxième avec le même email
        $response = $this->actingAs($this->admin)
            ->postJson('/api/employees', [
                'name' => 'Duplicate Test',
                'email' => 'existing@test.com', // Email déjà utilisé
                'phone' => '+237650999999',
                'password' => 'Password123',
                'role' => 'employee',
                'position' => 'Test',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email'])
            ->assertJson([
                'errors' => [
                    'email' => ['Cette adresse email est déjà utilisée'],
                ],
            ]);
    }

    /**
     * Test Bonus : Validation mot de passe fort
     * 
     * @test
     */
    public function test_password_must_be_strong()
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/employees', [
                'name' => 'Test',
                'email' => 'test@test.com',
                'phone' => '+237650888888',
                'password' => 'weak', // Pas assez fort
                'role' => 'employee',
                'position' => 'Test',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    /**
     * Test Bonus : Modification avec email unique
     * 
     * @test
     */
    public function test_can_update_employee_with_same_email()
    {
        $employee = Employee::factory()->create();
        $currentEmail = $employee->user->email;

        // Modifier avec le même email (devrait fonctionner)
        $response = $this->actingAs($this->admin)
            ->putJson("/api/employees/{$employee->id}", [
                'email' => $currentEmail,
                'name' => 'Nom Modifié',
            ]);

        $response->assertStatus(200);
        
        $this->assertEquals('Nom Modifié', $employee->fresh()->user->name);
    }

    /**
     * Test Bonus : Statistiques employés
     * 
     * @test
     */
    public function test_can_get_employee_statistics()
    {
        // Créer des employés de test
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

        $json = $response->json();
        
        $this->assertIsInt($json['total']);
        $this->assertIsInt($json['active']);
        $this->assertIsInt($json['inactive']);
    }
}

// =============================================================================
// COMMANDE POUR LANCER CES TESTS
// =============================================================================

/*
# Lancer tous les tests feature employés
php artisan test tests/Feature/Employee/EmployeeFeatureTest.php

# Lancer un test spécifique
php artisan test --filter test_manager_can_create_employee

# Lancer tous les tests employés (Unit + Feature)
php artisan test --filter Employee

# Avec détails verbeux
php artisan test tests/Feature/Employee/EmployeeFeatureTest.php -vvv

# Avec couverture de code
php artisan test tests/Feature/Employee/EmployeeFeatureTest.php --coverage

# Résumé couverture
php artisan test --filter Employee --coverage --min=80
*/
