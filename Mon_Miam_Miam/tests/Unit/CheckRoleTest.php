<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Http\Middleware\CheckRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class CheckRoleTest extends TestCase
{
    use RefreshDatabase;

    protected $middleware;
    protected $next;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->app['config']->set('auth.defaults.guard', 'web');
        $this->app['config']->set('auth.providers.users.model', User::class);
        
        $this->middleware = new CheckRole();
        $this->next = function ($request) {
            return response('OK');
        };

        // Création des rôles de base
        foreach (['admin', 'chef', 'serveur', 'client'] as $roleName) {
            Role::create(['name' => $roleName, 'guard_name' => 'web']);
        }
    }

    public function test_user_has_role(): void
    {
        $user = $this->createUserWithRole('chef');
        $this->assertTrue(CheckRole::userHasRole($user, 'chef'));
        $this->assertFalse(CheckRole::userHasRole($user, 'admin'));
    }

    public function test_get_available_roles(): void
    {
        $roles = CheckRole::getAvailableRoles();
        $this->assertIsArray($roles);
        $this->assertArrayHasKey('admin', $roles);
        $this->assertArrayHasKey('manager', $roles);
        $this->assertArrayHasKey('employee', $roles);
        $this->assertArrayHasKey('student', $roles);
    }

    public function test_get_role_hierarchy(): void
    {
        $hierarchy = CheckRole::getRoleHierarchy();
        $this->assertIsArray($hierarchy);
        $this->assertArrayHasKey('admin', $hierarchy);
        $this->assertTrue($hierarchy['admin'] > $hierarchy['manager']);
        $this->assertTrue($hierarchy['manager'] > $hierarchy['employee']);
    }

    public function test_is_role_superior(): void
    {
        $this->assertTrue(CheckRole::isRoleSuperior('admin', 'manager'));
        $this->assertTrue(CheckRole::isRoleSuperior('manager', 'employee'));
        $this->assertFalse(CheckRole::isRoleSuperior('employee', 'manager'));
        $this->assertFalse(CheckRole::isRoleSuperior('invalid', 'manager'));
    }

    private function createUserWithRole($role): User
    {
        $user = User::factory()->create();
        $user->assignRole($role);
        return $user;
    }

    protected function createAuthenticatedRequest(?User $user = null): Request
    {
        $request = Request::create('/', 'GET');
        if ($user) {
            $request->setUserResolver(fn () => $user);
        }
        return $request;
    }

    public function test_allows_user_with_correct_role(): void
    {
        $user = $this->createUserWithRole('admin');
        $request = Request::create('/', 'GET');
        $request->setUserResolver(fn () => $user);

        $response = $this->middleware->handle($request, $this->next, 'admin');
        $this->assertEquals('OK', $response->getContent());
    }

    public function test_allows_user_with_multiple_roles(): void
    {
        $user = $this->createUserWithRole('chef');
        $user->assignRole('serveur');
        $request = $this->createAuthenticatedRequest($user);

        $response = $this->middleware->handle($request, $this->next, 'serveur');
        $this->assertEquals('OK', $response->getContent());
    }

    public function test_denies_user_with_wrong_role(): void
    {
        $this->expectException(AccessDeniedHttpException::class);

        $user = $this->createUserWithRole('client');
        $request = $this->createAuthenticatedRequest($user);

        $this->middleware->handle($request, $this->next, 'admin');
    }

    public function test_denies_unauthenticated_user(): void
    {
        $this->expectException(AccessDeniedHttpException::class);
        $request = $this->createAuthenticatedRequest();
        $this->middleware->handle($request, $this->next, 'admin');
    }

    public function test_allows_admin_access_to_all_roles(): void
    {
        $user = $this->createUserWithRole('admin');
        $request = $this->createAuthenticatedRequest($user);

        foreach (['chef', 'serveur', 'client'] as $role) {
            $response = $this->middleware->handle($request, $this->next, $role);
            $this->assertEquals('OK', $response->getContent(), "Admin should have access to $role role");
        }
    }

    public function test_denies_lower_role_access_to_higher_role(): void
    {
        $this->expectException(AccessDeniedHttpException::class);

        $user = $this->createUserWithRole('serveur');
        $request = $this->createAuthenticatedRequest($user);

        $this->middleware->handle($request, $this->next, 'chef');
    }
}