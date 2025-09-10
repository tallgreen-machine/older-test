import React, { useState } from 'react';
import { StyledModal, Input, Button, PrimaryButton, FormField } from '../ui';
import type { Category } from '../../types';

export const AddCategoryModal = ({ onClose, onSave }: { onClose: () => void, onSave: (name: string) => void }) => {
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(name);
    };

    return (
        <StyledModal title="Add New Category" onClose={onClose} footer={
            <div className="flex justify-end gap-2">
                <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
                <PrimaryButton type="submit" form="add-category-form">Save Category</PrimaryButton>
            </div>
        }>
            <form id="add-category-form" onSubmit={handleSubmit}>
                <FormField label="Category Name">
                    <Input value={name} onChange={e => setName(e.target.value)} required />
                </FormField>
            </form>
        </StyledModal>
    );
};

export const EditCategoryModal = ({ category, onClose, onSave }: { category: Category, onClose: () => void, onSave: (category: Category) => void }) => {
    const [name, setName] = useState(category.name);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...category, name });
    };

    return (
        <StyledModal title="Edit Category" onClose={onClose} footer={
             <div className="flex justify-end gap-2">
                <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
                <PrimaryButton type="submit" form="edit-category-form">Save Changes</PrimaryButton>
            </div>
        }>
            <form id="edit-category-form" onSubmit={handleSubmit}>
                <FormField label="Category Name">
                    <Input value={name} onChange={e => setName(e.target.value)} required />
                </FormField>
            </form>
        </StyledModal>
    );
};