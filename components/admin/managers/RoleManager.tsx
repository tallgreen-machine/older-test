
import React, { useState } from 'react';
import { ShieldCheck, PlusCircle, Pencil, Trash2, ChevronDown } from 'lucide-react';
import type { Role, UserAccount } from '../../../types';
import { Button, Card, ConfirmationModal, PrimaryButton } from '../../ui';
import { ManagerHeader } from '../ManagerHeader';
import { AddRoleModal, EditRoleModal } from '../../forms';

export const RoleManager = ({ roles, onAdd, onSave, onDelete, users, permissions }: { roles: Role[], onAdd: (role: Omit<Role, 'id'>) => void, onSave: (role: Role) => void, onDelete: (roleId: string) => void, users: UserAccount[], permissions: { view: boolean; edit: boolean; create: boolean; delete: boolean; } }) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    const handleSaveRole = (role: Role) => {
        onSave(role);
        setEditingRole(null);
    };

    const handleAddRole = (role: Role) => {
        onAdd(role);
        setShowAddModal(false);
    };
    
    const handleDelete = (role: Role) => {
        const isRoleInUse = users.some(u => u.roleId === role.id);
        if (isRoleInUse) {
            alert("Cannot delete this role as it is currently assigned to one or more users.");
            return;
        }
        setRoleToDelete(role);
    };
    
    const confirmDelete = () => {
        if (roleToDelete) {
            onDelete(roleToDelete.id);
            setRoleToDelete(null);
        }
    };

    return (
        <div>
            <ManagerHeader title="Roles & Permissions" icon={<ShieldCheck className="w-8 h-8 mr-3 text-foreground" />}>
                {permissions.create && (
                    <PrimaryButton onClick={() => setShowAddModal(true)}>
                        <PlusCircle className="w-4 h-4 mr-2" /> Add Role
                    </PrimaryButton>
                )}
            </ManagerHeader>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Role Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase hidden md:table-cell">Users Assigned</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                            {roles.map(role => {
                                const assignedUsers = users.filter(u => u.roleId === role.id);
                                const isExpanded = expandedRow === role.id;
                                return (
                                <React.Fragment key={role.id}>
                                    <tr className="hover:bg-accent/50">
                                        <td className="px-6 py-4 font-medium text-foreground">{role.name}</td>
                                        <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">
                                            {assignedUsers.length > 0
                                                ? assignedUsers.map(u => u.username).join(', ')
                                                : <span className="text-muted-foreground/70">None</span>
                                            }
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex gap-2 justify-center">
                                                {permissions.edit && <Button onClick={() => setEditingRole(role)} variant="ghost" size="icon"><Pencil className="w-4 h-4" /></Button>}
                                                {permissions.delete && <Button onClick={() => handleDelete(role)} variant="ghost" size="icon" className="text-red-600 hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>}
                                                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setExpandedRow(isExpanded ? null : role.id)}>
                                                    <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr className="md:hidden">
                                            <td colSpan={3} className="p-4 bg-accent/50">
                                                <div className="text-sm">
                                                    <strong className="text-foreground block mb-1">Users Assigned:</strong>
                                                    <span className="text-muted-foreground">
                                                        {assignedUsers.length > 0
                                                            ? assignedUsers.map(u => u.username).join(', ')
                                                            : <span className="text-muted-foreground/70">None</span>
                                                        }
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            )})}
                        </tbody>
                    </table>
                </div>
            </Card>

            {showAddModal && <AddRoleModal onClose={() => setShowAddModal(false)} onSave={handleAddRole} roles={roles} />}
            {editingRole && <EditRoleModal role={editingRole} onClose={() => setEditingRole(null)} onSave={handleSaveRole} />}
            <ConfirmationModal
                isOpen={!!roleToDelete}
                onClose={() => setRoleToDelete(null)}
                onConfirm={confirmDelete}
                title="Confirm Role Deletion"
                message={`Are you sure you want to delete the "${roleToDelete?.name}" role? This action cannot be undone.`}
            />
        </div>
    );
};
