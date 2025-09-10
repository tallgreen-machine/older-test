
import React, { useState, useMemo } from 'react';
import { Users, UserPlus, Pencil, Trash2, User, Search } from 'lucide-react';
import type { UserAccount, Role } from '../../../types';
import { Button, Card, Input, Select, ConfirmationModal, PrimaryButton } from '../../ui';
import { ManagerHeader } from '../ManagerHeader';
import { useDataProcessor } from '../../../hooks/useDataProcessor';

export const UserManager = ({ users, onDelete, setShowAddUserModal, currentUser, onEditUser, roles, permissions }: { users: UserAccount[], onDelete: (userId: string) => void, setShowAddUserModal: (show: boolean) => void, currentUser: UserAccount, onEditUser: (user: UserAccount) => void, roles: Role[], permissions: { view: boolean, create: boolean, edit: boolean, delete: boolean } }) => {
	const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);
	const [sortConfig, setSortConfig] = useState<{ key: keyof UserAccount, direction: 'ascending' | 'descending' }>({ key: 'username', direction: 'ascending' });
	const [searchTerm, setSearchTerm] = useState("");
    const [groupKey, setGroupKey] = useState("None");

	const visibleUsers = useMemo(() => {
		return permissions.edit ? users : users.filter(u => u.id === currentUser.id);
	}, [users, permissions.edit, currentUser.id]);

	const getRoleName = (user: UserAccount) => roles.find(r => r.id === user.roleId)?.name || 'Unassigned';

	const processedUsers = useDataProcessor<UserAccount>({
		data: visibleUsers,
		searchTerm,
		searchKeys: ['username', 'email'],
		sortConfig,
		groupKey: groupKey === 'roleId' && permissions.edit ? getRoleName : undefined,
	});
	
	const confirmDeleteUser = () => {
		if (userToDelete) {
			onDelete(userToDelete.id);
			setUserToDelete(null);
		}
	};

	const sortOptions = [
		{ value: 'username-ascending', label: 'Username (A-Z)' },
		{ value: 'username-descending', label: 'Username (Z-A)' },
		{ value: 'email-ascending', label: 'Email (A-Z)' },
		{ value: 'email-descending', label: 'Email (Z-A)' },
	];

    const groupOptions = [
        { value: 'None', label: 'None' },
        { value: 'roleId', label: 'Role' },
    ];

	return (
        <>
		<div>
			<ManagerHeader title="Users" icon={<Users className="w-8 h-8 mr-3 text-foreground" />}>
                {permissions.create && <PrimaryButton onClick={() => setShowAddUserModal(true)}><UserPlus className="w-4 h-4 mr-2"/> Add User</PrimaryButton>}
            </ManagerHeader>

			<Card className="p-4 mb-6">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label className="text-sm font-medium text-muted-foreground block mb-1">Search Users</label>
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
							<Input type="text" placeholder="Search by username or email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10"/>
						</div>
					</div>
                    {permissions.edit && (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground block mb-1">Group By</label>
                            <Select value={groupKey} onChange={e => setGroupKey(e.target.value)}>
                                {groupOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </Select>
                        </div>
                    )}
					<div>
						<label className="text-sm font-medium text-muted-foreground block mb-1">Sort by</label>
						<Select value={`${sortConfig.key}-${sortConfig.direction}`} onChange={e => {
							const [key, direction] = e.target.value.split('-');
							setSortConfig({ key: key as any, direction: direction as any });
						}}>
							{sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
						</Select>
					</div>
				</div>
			</Card>

			<div className="space-y-8">
                {processedUsers.map(group => (
                    <div key={group.groupTitle}>
                        {group.groupTitle !== "All" && permissions.edit && (
                            <h2 className="mb-4">
                                <span className="inline-flex items-center px-3 py-1 text-lg font-semibold text-primary bg-primary/10 rounded-full border border-primary/50">
                                    {group.groupTitle}
                                    <span className="font-normal ml-2">({group.count})</span>
                                </span>
                            </h2>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {group.items.map(user => {
                                const role = roles.find(r => r.id === user.roleId);
                                const isSelf = currentUser.id === user.id;
                                const isSuperAdmin = role?.name === 'Super Admin';
                                const canEdit = isSelf || (permissions.edit && !isSuperAdmin);
                                const canDelete = permissions.delete && !isSelf && !isSuperAdmin;

                                return (
                                    <Card key={user.id} className="flex flex-col transition-all hover:shadow-lg hover:-translate-y-1">
                                        <div className="p-6 flex flex-col items-center text-center flex-grow">
                                            <div className="w-20 h-20 rounded-full bg-secondary overflow-hidden mb-4 ring-4 ring-card shadow-md">
                                                {user.profilePicture ? (
                                                    <img src={user.profilePicture} alt={user.username} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-10 h-10 text-muted-foreground m-auto mt-4" />
                                                )}
                                            </div>
                                            <h3 className="font-semibold text-lg text-foreground">{user.username}</h3>
                                            <p className="text-sm text-muted-foreground truncate w-full">{user.email}</p>
                                            <span className="mt-3 bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">{role?.name || 'N/A'}</span>
                                        </div>
                                        <div className="p-2 border-t border-border bg-muted/50 flex justify-center gap-2">
                                            {canEdit && <Button onClick={() => onEditUser(user)} variant="ghost" size="icon"><Pencil className="w-4 h-4" /></Button>}
                                            {canDelete && <Button onClick={() => setUserToDelete(user)} variant="ghost" size="icon" className="text-red-600 hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>}
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
		</div>
		<ConfirmationModal
			isOpen={!!userToDelete}
			onClose={() => setUserToDelete(null)}
			onConfirm={confirmDeleteUser}
			title="Confirm User Deletion"
			message={`Are you sure you want to delete user "${userToDelete?.username}"? This action cannot be undone.`}
		/>
        </>
	);
};
