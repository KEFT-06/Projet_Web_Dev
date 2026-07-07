<?php

namespace Database\Seeders;

use App\Models\User;
use Spatie\Permission\Models\Role;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed roles and permissions first to ensure they exist
        $this->call(RolePermissionSeeder::class);

        // User::factory(10)->create();
        $testUser = User::firstOrCreate([
            'email' => 'test@example.com',
        ], [
            'name' => 'Test User',
            'password' => bcrypt('password'),
            'phone' => '+237671234567',
            'email_verified_at' => now(),
            'referral_code' => 'USER_' . uniqid(),
        ]);

        // Assign 'student' role to the test user if it doesn't have one
        $studentRole = Role::findByName('student');
        if ($studentRole && ($testUser->wasRecentlyCreated || !$testUser->hasRole($studentRole))) {
            $testUser->assignRole($studentRole);
        }

        // Create a default administrator user
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@monmiammiam.com'],
            [
                'name' => 'Admin System',
                'password' => bcrypt('admin123'),
                'phone' => '+237600000000',
                'referral_code' => 'ADMIN_' . uniqid(),
            ]
        );
        // Assign 'admin' role
        $adminRole = Role::findByName('admin');
        if ($adminRole) {
            $adminUser->assignRole($adminRole);
        }
    }
}
