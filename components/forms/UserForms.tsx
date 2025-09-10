import React, { useState } from 'react';
import { StyledModal, Input, Button, PrimaryButton, Select, FormField } from '../ui';
import type { UserAccount, Role } from '../../types';
import { User, KeyRound, Image as ImageIcon } from 'lucide-react';

// FIX: Updated onSave prop type to not expect businessUnits, which are added by the parent component.
export const AddUserModal = ({ onClose, onSave, roles }: { onClose: () => void, onSave: (user: Omit<UserAccount, 'id' | 'roleId' | 'businessUnits'> & { roleId: string; profilePicture?: string; }) => void, roles: Role[] }) => {
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
		onSave(data as any);
		onClose();
	};

	return (
		<StyledModal
            title="Add New User"
            onClose={onClose}
            size="lg"
            footer={
                <div className="flex justify-end gap-2">
                    <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
                    <PrimaryButton type="submit" form="add-user-form">Save User</PrimaryButton>
                </div>
            }
        >
			<form id="add-user-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				    <FormField label="Username"><Input name="username" required /></FormField>
				    <FormField label="Email"><Input name="email" type="email" required /></FormField>
				    <FormField label="Password"><Input name="password" type="password" required /></FormField>
				    <FormField label="Role">
					    <Select name="roleId" defaultValue={roles.find(r => r.name === 'Sales Rep')?.id || roles[0]?.id || ''} required>
						    {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
					    </Select>
				    </FormField>
                    <FormField label="Profile Picture URL" className="md:col-span-2">
                        <Input name="profilePicture" placeholder="https://..." />
                    </FormField>
                </div>
			</form>
		</StyledModal>
	);
};

export const UserProfileCardModal = ({ user, onSave, onClose, roles, currentUser, permissions }: { user: UserAccount, onSave: (user: UserAccount) => void, onClose: () => void, roles: Role[], currentUser: UserAccount, permissions: { edit: boolean } }) => {
    const [activeTab, setActiveTab] = useState('account');
    const [error, setError] = useState('');
    const formId = `edit-user-${user.id}`;
    
    const userRole = roles.find(r => r.id === user.roleId);
    const isSuperAdmin = userRole?.name === 'Super Admin';
    const isSelf = currentUser.id === user.id;
    const roleSelectDisabled = isSuperAdmin || !permissions.edit || isSelf;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
        
        let updatedPassword = user.password;
        const newPassword = data.newPassword as string;
        const confirmPassword = data.confirmPassword as string;

        if (newPassword) {
            if (newPassword !== confirmPassword) {
                setError('Passwords do not match.');
                return;
            }
            if (newPassword.length < 4) {
                setError('New password must be at least 4 characters long.');
                return;
            }
            updatedPassword = newPassword;
        }
        onSave({ ...user, ...data, password: updatedPassword } as UserAccount);
    };

    const sidebar = (
        <div className="space-y-1">
            <button type="button" onClick={() => setActiveTab('account')} className={`w-full flex items-center text-left px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'account' ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}>
                <User size={16} className="mr-2" /> Account
            </button>
             <button type="button" onClick={() => setActiveTab('picture')} className={`w-full flex items-center text-left px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'picture' ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}>
                <ImageIcon size={16} className="mr-2" /> Display Picture
            </button>
             <button type="button" onClick={() => setActiveTab('password')} className={`w-full flex items-center text-left px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'password' ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}>
                <KeyRound size={16} className="mr-2" /> Password
            </button>
        </div>
    );
    
    const renderContent = () => {
        switch(activeTab) {
            case 'picture':
                return (
                    <div className="space-y-4">
                        <FormField label="Profile Picture URL">
                            <Input name="profilePicture" defaultValue={user.profilePicture || ''} placeholder="https://..." />
                        </FormField>
                         <div className="w-32 h-32 rounded-full bg-card p-1 shadow-lg">
                            <div className="w-full h-full rounded-full overflow-hidden bg-secondary flex items-center justify-center">
                                {user.profilePicture ? <img src={user.profilePicture} alt={user.username} className="w-full h-full object-cover" /> : <User className="w-16 h-16 text-muted-foreground" />}
                            </div>
                        </div>
                    </div>
                );
            case 'password':
                return (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground mb-2">Leave blank to keep current password.</p>
                         <FormField label="New Password">
                            <Input name="newPassword" type="password" />
                        </FormField>
                        <FormField label="Confirm New Password">
                            <Input name="confirmPassword" type="password" />
                        </FormField>
                    </div>
                );
            case 'account':
            default:
                return (
                     <div className="space-y-4">
                        <FormField label="Username">
                            <Input name="username" defaultValue={user.username} required />
                        </FormField>
                        <FormField label="Email">
                            <Input name="email" type="email" defaultValue={user.email} required />
                        </FormField>
                        <FormField label="Role">
                            <Select name="roleId" defaultValue={user.roleId} required disabled={roleSelectDisabled}>
                                {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                            </Select>
                             {roleSelectDisabled && <p className="text-xs text-muted-foreground mt-1">Role can only be changed by an admin for other non-admin users.</p>}
                        </FormField>
                    </div>
                );
        }
    }

    return (
        <StyledModal
            title={`Profile: ${user.username}`}
            onClose={onClose}
            size="lg"
            sidebar={sidebar}
            footer={
                <div className="flex-grow flex justify-between items-center">
                     {error && <p className="text-sm text-red-600">{error}</p>}
                     <div className="flex gap-2 justify-end w-full">
                        <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
                        <PrimaryButton type="submit" form={formId}>Save Changes</PrimaryButton>
                    </div>
                </div>
            }
        >
            <form id={formId} onSubmit={handleSubmit}>
                {renderContent()}
            </form>
        </StyledModal>
    );
};