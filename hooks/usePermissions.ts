import { useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { ALL_PERMISSIONS } from '../constants';
import type { PermissionSet } from '../types';

const NO_PERMISSIONS = Object.keys(ALL_PERMISSIONS).reduce((acc, key) => {
    acc[key as keyof PermissionSet] = Object.keys(ALL_PERMISSIONS[key as keyof PermissionSet]).reduce((pAcc, pKey) => {
        (pAcc as any)[pKey] = false;
        return pAcc;
    }, {} as any);
    return acc;
}, {} as PermissionSet);


export const usePermissions = (): PermissionSet => {
    const { currentUser, roles } = useAppContext();

    return useMemo(() => {
        if (!currentUser) {
            return NO_PERMISSIONS;
        }
        const userRole = roles.find(r => r.id === currentUser.roleId);
        return userRole?.permissions || NO_PERMISSIONS;
    }, [currentUser, roles]);
};