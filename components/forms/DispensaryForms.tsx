import React, { useState } from 'react';
import { StyledModal, Input, Button, PrimaryButton, FormField } from '../ui';
import type { Dispensary } from '../../types';

const DispensaryFormBody = ({ dispensary }: { dispensary?: Dispensary }) => (
    <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Name">
                <Input name="name" defaultValue={dispensary?.name} required />
            </FormField>
            <FormField label="Address">
                <Input name="address" defaultValue={dispensary?.address} required />
            </FormField>
            <FormField label="Phone">
                <Input name="phone" defaultValue={dispensary?.phone} required />
            </FormField>
            <FormField label="License #">
                <Input name="licenseNumber" defaultValue={dispensary?.licenseNumber} required />
            </FormField>
        </div>
        <FormField label="Email">
            <Input name="email" type="email" defaultValue={dispensary?.email} required />
        </FormField>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Sales Rep Name">
                <Input name="salesRepName" defaultValue={dispensary?.salesRepName} required />
            </FormField>
            <FormField label="Sales Rep Email">
                <Input name="salesRepEmail" type="email" defaultValue={dispensary?.salesRepEmail} required />
            </FormField>
        </div>
    </div>
);

export const AddDispensaryModal = ({ onClose, onSave }: { onClose: () => void, onSave: (dispensary: Omit<Dispensary, 'id'>) => void }) => {
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
		onSave(data as Omit<Dispensary, 'id'>);
		onClose();
	};

	return (
        <StyledModal
            title="Add New Dispensary"
            onClose={onClose}
            size="lg"
            footer={
                <div className="flex justify-end gap-2">
                    <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
                    <PrimaryButton type="submit" form="add-dispensary-form">Save Dispensary</PrimaryButton>
                </div>
            }
        >
			<form id="add-dispensary-form" onSubmit={handleSubmit}>
                <DispensaryFormBody />
            </form>
        </StyledModal>
	);
};

export const EditDispensaryModal = ({ dispensary, onSave, onClose }: { dispensary: Dispensary, onSave: (dispensary: Dispensary) => void, onClose: () => void }) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
		onSave({ ...dispensary, ...data });
	};
    
    return (
        <StyledModal
            title="Edit Dispensary"
            onClose={onClose}
            size="lg"
            footer={
                 <div className="flex justify-end gap-2">
                    <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
                    <PrimaryButton type="submit" form="edit-dispensary-form">Save Changes</PrimaryButton>
                </div>
            }
        >
			<form id="edit-dispensary-form" onSubmit={handleSubmit}>
                <DispensaryFormBody dispensary={dispensary} />
            </form>
        </StyledModal>
    );
};