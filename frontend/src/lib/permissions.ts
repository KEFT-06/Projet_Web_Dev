// Permission system for role-based access control

export type Permission =
  | 'view_dashboard'
  | 'manage_orders'
  | 'manage_menu'
  | 'manage_employees'
  | 'manage_complaints'
  | 'view_statistics'
  | 'manage_promotions'
  | 'manage_settings'
  | 'create_employee'
  | 'validate_responses'
  | 'assign_complaints'
  | 'override_menu'
  | 'view_customer_data'
  | 'manage_events';

export type Role = 'student' | 'employee' | 'manager' | 'admin';

const rolePermissions: Record<Role, Permission[]> = {
  student: [
    'view_dashboard',
    'manage_orders',
    'view_customer_data',
  ],
  employee: [
    'view_dashboard',
    'manage_orders',
    'manage_complaints',
    'view_statistics',
    'override_menu',
  ],
  manager: [
    'view_dashboard',
    'manage_orders',
    'manage_complaints',
    'view_statistics',
    'manage_employees',
    'create_employee',
    'validate_responses',
    'assign_complaints',
    'manage_promotions',
  ],
  admin: [
    'view_dashboard',
    'manage_orders',
    'manage_menu',
    'manage_employees',
    'manage_complaints',
    'view_statistics',
    'manage_promotions',
    'manage_settings',
    'create_employee',
    'validate_responses',
    'assign_complaints',
    'override_menu',
    'view_customer_data',
    'manage_events',
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function getRolePermissions(role: Role): Permission[] {
  return rolePermissions[role] || [];
}

export function canAccessFeature(userRole: Role, requiredPermissions: Permission[]): boolean {
  return requiredPermissions.some(permission => hasPermission(userRole, permission));
}
