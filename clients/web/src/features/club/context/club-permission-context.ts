// TODO: Complete the permission context for club

import React, { createContext, useContext, type ReactNode } from 'react';
import { type Permission, ROLE_PERMISSIONS, type Role } from '../types/permission';

interface Member {
    id: string;
    username: string;
    permission: string;
}

interface PermissionContextType {
    member: Member | null;
    hasPermission: (permission: Permission) => boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);