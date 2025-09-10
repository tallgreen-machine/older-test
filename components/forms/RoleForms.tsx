import React, { useState } from 'react';
import { StyledModal, Input, Button, PrimaryButton, FormField } from '../ui';
import type { Role, PermissionSet } from '../../types';
import { ALL_PERMISSIONS } from '../../constants';

const permissionLabels: { [key in keyof PermissionSet]: { label: string; perms: { key: keyof PermissionSet[key]; label: string }[] } } = {
    products: { label: 'Products', perms: [{ key: 'view', label: 'View' }, { key: 'create', label: 'Create' }, { key: 'edit', label: 'Edit' }, { key: 'delete', label: 'Delete' }] },
    productTypes: { label: 'Product Types', perms: [{ key: 'view', label: 'View' }, { key: 'create', label: 'Create' }, { key: 'edit', label: 'Edit' }, { key: 'delete', label: 'Delete' }] },
    categorySort: { label: 'Category Sort', perms: [{ key: 'view', label: 'View' }, { key: 'edit', label: 'Edit' }] },
    alertBanners: { label: 'Alert Banners', perms: [{ key: 'view', label: 'View' }, { key: 'create', label: 'Create' }, { key: 'edit', label: 'Edit' }, { key: 'delete', label: 'Delete' }] },
    ordersRegular: { label: 'Regular Orders', perms: [{ key: 'view', label: 'View' }] },
    ordersVmi: { label: 'VMI Orders', perms: [{ key: 'view', label: 'View' }, { key: 'edit', label: 'Edit' }, { key: 'delete', label: 'Delete' }] },
    dispensaries: { label: 'Dispensaries', perms: [{ key: 'view', label: 'View' }, { key: 'create', label: 'Create' }, { key: 'edit', label: 'Edit' }, { key: 'delete', label: 'Delete' }] },
    users: { label: 'Users', perms: [{ key: 'view', label: 'View' }, { key: 'create', label: 'Create' }, { key: 'edit', label: 'Edit' }, { key: 'delete', label: 'Delete' }] },
    roles: { label: 'Roles', perms: [{ key: 'view', label: 'View' }, { key: 'create', label: 'Create' }, { key: 'edit', label: 'Edit' }, { key: 'delete', label: 'Delete' }] },
    inventory: { label: 'Inventory Sync', perms: [{ key: 'view', label: 'View' }, { key: 'edit', label: 'Edit' }] },
    mobileNav: { label: 'Mobile Nav', perms: [{ key: 'view', label: 'View' }, { key: 'edit', label: 'Edit' }] },
    // FIX: Added missing 'categories' permission definition to match the PermissionSet type.
    categories: { label: 'Categories', perms: [{ key: 'view', label: 'View' }, { key: 'create', label: 'Create' }, { key: 'edit', label: 'Edit' }, { key: 'delete', label: 'Delete' }] },
};


export const RoleForm = ({ role, onSave, onCancel, formId }: { role: Partial<Role>, onSave: (role: Partial<Role>) => void, onCancel: () => void, formId: string }) => {
    const [name, setName] = useState(role.name || '');
    const [permissions, setPermissions] = useState<PermissionSet>(role.permissions || ALL_PERMISSIONS);
    const isSuperAdmin = role.name === 'Super Admin';

    const handlePermissionChange = (module: keyof PermissionSet, perm: string, value: boolean) => {
        setPermissions(prev => ({
            ...prev,
            [module]: {
                ...prev[module],
                [perm]: value,
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isSuperAdmin) return;
        onSave({ ...role, name, permissions });
    };

    return (
        <form id={formId} onSubmit={handleSubmit}>
            <div className="space-y-6">
                <FormField label="Role Name">
                    <Input value={name} onChange={e => setName(e.target.value)} required disabled={isSuperAdmin} />
                    {isSuperAdmin && <p className="text-xs text-muted-foreground mt-1">The Super Admin role cannot be renamed.</p>}
                </FormField>
                <div>
                    <h3 className="text-lg font-medium mb-3">Permissions</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4">
                        {Object.entries(permissionLabels).map(([moduleKey, moduleInfo]) => (
                            <div key={moduleKey} className="p-3 border border-border rounded-md bg-muted/30">
                                <h4 className="font-semibold">{moduleInfo.label}</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                                    {moduleInfo.perms.map(perm => (
                                        <label key={perm.key} className="flex items-center space-x-2 text-sm">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-input text-primary focus:ring-ring disabled:opacity-50"
                                                checked={permissions[moduleKey as keyof PermissionSet][perm.key as keyof typeof permissions[keyof PermissionSet]]}
                                                onChange={(e) => handlePermissionChange(moduleKey as keyof PermissionSet, perm.key, e.target.checked)}
                                                disabled={isSuperAdmin}
                                            />
                                            <span>{perm.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                     {isSuperAdmin && <p className="text-sm text-yellow-700 dark:text-yellow-300 bg-yellow-500/10 p-3 rounded-md mt-4">All permissions are granted to the Super Admin role and cannot be modified.</p>}
                </div>
            </div>
        </form>
    );
};

export const AddRoleModal = ({ onClose, onSave, roles }: { onClose: () => void, onSave: (role: Role) => void, roles: Role[] }) => (
    <StyledModal
        title="Add New Role"
        onClose={onClose}
        size="4xl"
        footer={
            <div className="flex justify-end gap-2">
                <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
                <PrimaryButton type="submit" form="add-role-form">Save Role</PrimaryButton>
            </div>
        }
    >
        <RoleForm
            formId="add-role-form"
            role={{
                permissions: Object.keys(ALL_PERMISSIONS).reduce((acc, key) => {
                    acc[key as keyof PermissionSet] = Object.keys(ALL_PERMISSIONS[key as keyof PermissionSet]).reduce((pAcc, pKey) => {
                        (pAcc as any)[pKey] = false;
                        return pAcc;
                    }, {} as any);
                    return acc;
                }, {} as PermissionSet)
            }}
            onSave={(data) => onSave({ ...data, id: `role-${roles.length + 1}` } as Role)}
            onCancel={onClose}
        />
    </StyledModal>
);

export const EditRoleModal = ({ role, onClose, onSave }: { role: Role, onClose: () => void, onSave: (role: Role) => void }) => (
    <StyledModal
        title={`Edit Role: ${role.name}`}
        onClose={onClose}
        size="4xl"
        footer={
             <div className="flex justify-end gap-2">
                <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
                <PrimaryButton type="submit" form="edit-role-form" disabled={role.name === 'Super Admin'}>Save Changes</PrimaryButton>
            </div>
        }
    >
        <RoleForm
            formId="edit-role-form"
            role={role}
            onSave={(data) => onSave({ ...role, ...data })}
            onCancel={onClose}
        />
    </StyledModal>
);