// TODO: Complete the permission types for club

export type Permission = 'manage:members' | 'manage:events' | 'manage:posts' | 'manage:settings';

export type Role = 'admin' | 'manager' | 'viewer';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    admin: ['manage:members', 'manage:events', 'manage:posts', 'manage:settings'],
    manager: ['manage:members', 'manage:events'],
    viewer: ['manage:members'],
};
