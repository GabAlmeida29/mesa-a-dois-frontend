import type { Permission, UserAccess } from './types';

export const ALL_PERMISSIONS: readonly Permission[] = [
  'restaurants:create',
  'restaurants:update',
  'restaurants:delete',
  'dishes:manage',
  'analytics:view',
];

export const isAdminUser = (user: UserAccess | null | undefined) => user?.role === 'admin';

export const can = (user: UserAccess | null | undefined, permission: Permission) =>
  Boolean(user && (user.role === 'admin' || user.permissions.includes(permission)));
