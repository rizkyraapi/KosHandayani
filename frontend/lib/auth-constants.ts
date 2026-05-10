export const AUTH_TOKEN_COOKIE = 'kh_auth_token';
export const AUTH_ROLE_COOKIE = 'kh_auth_role';

export const ROLE_DASHBOARD_PATHS = {
  owner: '/owner/dashboard',
  tenant: '/tenant/dashboard',
} as const;

export type UserRole = keyof typeof ROLE_DASHBOARD_PATHS;

export function isUserRole(value: unknown): value is UserRole {
  return value === 'owner' || value === 'tenant';
}

export function getRoleDashboardPath(role: UserRole) {
  return ROLE_DASHBOARD_PATHS[role];
}
