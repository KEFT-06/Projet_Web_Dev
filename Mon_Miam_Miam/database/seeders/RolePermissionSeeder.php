<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Vider le cache des permissions pour éviter les conflits lors des réexécutions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // 🔹 Permissions de base cohérentes avec api.php
        // Build a set of permission names (include variants used across the routes).
        // The routes file uses mixed naming conventions (e.g. "employees:create" and "employee.create").
        // To be robust for tests and middleware checks we create both variants where applicable.
        $permissions = [
            // Employees (format utilisé dans les routes)
            'employee.create',
            'employee.update',
            'employee.delete',
            'employee.view',

            // Orders
            'orders:list', 'orders:update', 'orders:create', 'orders:cancel', 'orders:view-own',

            // Menu
            'menu:view', 'menu:toggle-availability',

            // Complaints
            'complaints:list', 'complaints:update', 'complaints:resolve', 'complaints:create', 'complaints:view-own',

            // Loyalty / referral / statistics
            'loyalty:view', 'loyalty:redeem',
            'referral:generate-code', 'referral:view-stats', 'referral:apply-code',

            'statistics:view', 'statistics:export',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate([
                'name' => $perm,
                'guard_name' => 'web',
            ]);
        }

        // 🔹 Création des rôles
        // Assurer la création de TOUS les rôles nécessaires
        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $manager = Role::firstOrCreate(['name' => 'manager', 'guard_name' => 'web']);
        $employee = Role::firstOrCreate(['name' => 'employee', 'guard_name' => 'web']);
        $student = Role::firstOrCreate(['name' => 'student', 'guard_name' => 'web']);

        // 🔹 Attribution des permissions
        // L'admin a toutes les permissions
        $admin->givePermissionTo(Permission::all());

        // Le manager peut gérer les employés et les commandes
        $manager->givePermissionTo([
            'employee.create',
            'employee.update',
            'employee.view',
            'orders:list',
            'orders:update',
            'complaints:list',
            'complaints:update',
            'complaints:resolve',
            'menu:view',
            'menu:toggle-availability',
            'statistics:view',
        ]);

        // L'employé gère les commandes et les réclamations de base
        $employee->givePermissionTo([
            'orders:list',
            'orders:update',
            'complaints:list',
            'complaints:update',
            'menu:view',
            'menu:toggle-availability',
        ]);

        // L'étudiant peut voir le menu, passer des commandes et gérer ses propres réclamations
        $student->givePermissionTo([
            'orders:view-own',
            'orders:create',
            'orders:cancel',
            'menu:view',
            'complaints:view-own',
            'complaints:create',
            'referral:generate-code',
            'referral:apply-code',
            'loyalty:view',
            'loyalty:redeem',
        ]);
    }
}
