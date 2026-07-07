<?php
return [
    'models' => [
        'permission' => Spatie\Permission\Models\Permission::class,
        // Use the local Role model that extends Spatie's Role so you can customize behavior if needed.
        'role' => App\Models\Role::class,
    ],

    'table_names' => [
        'roles' => 'roles',
        'permissions' => 'permissions',
        'model_has_roles' => 'model_has_roles',
        'model_has_permissions' => 'model_has_permissions',
        'role_has_permissions' => 'role_has_permissions',
    ],

    'column_names' => [
        'model_morph_key' => 'model_id',
        'role_pivot_key' => 'role_id',
        'permission_pivot_key' => 'permission_id',
        'model_pivot_key' => 'model_id',
    ],

    'register_permission_check_method' => true,

    'cache' => [
        'expiration_time' => \DateInterval::createFromDateString('24 hours'),
        'key' => 'spatie.permission.cache',
        'store' => 'default',
    ],

    'user_has_permission_using_roles' => true,

    'display_permission_in_exception' => false,

    'enable_wildcard_permission' => false,

    'permission_class' => Spatie\Permission\Models\Permission::class,
];
?>