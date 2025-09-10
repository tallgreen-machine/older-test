import React, { useState } from 'react';
import { StyledModal, Input, Button, PrimaryButton, Select, FormField } from '../ui';
import type { ProductType, Category } from '../../types';

const ProductTypeFormBody = ({ productType, categories }: { productType?: ProductType, categories: Category[] }) => (
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Name">
            <Input name="name" defaultValue={productType?.name} required />
        </FormField>
        <FormField label="Price">
            <Input name="price" type="number" step="0.01" defaultValue={productType?.price} required />
        </FormField>
        <FormField label="Category" className="md:col-span-2">
            <Select name="category" defaultValue={productType?.category} required>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </Select>
        </FormField>
        <FormField label="Image URL" className="md:col-span-2">
            <Input name="image" defaultValue={productType?.image} placeholder="https://..." />
        </FormField>
    </div>
);

export const EditProductTypeModal = ({ productType, onSave, onClose, categories }: { productType: ProductType, onSave: (updates: Partial<ProductType>) => void, onClose: () => void, categories: Category[] }) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
		onSave({ ...data, price: parseFloat(data.price as string) });
	};

    return (
        <StyledModal
            title="Edit Product Type"
            onClose={onClose}
            size="lg"
            footer={
                <div className="flex justify-end gap-2">
                    <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
                    <PrimaryButton type="submit" form="edit-pt-form">Save Changes</PrimaryButton>
                </div>
            }
        >
            <form id="edit-pt-form" onSubmit={handleSubmit}>
                <ProductTypeFormBody productType={productType} categories={categories} />
            </form>
        </StyledModal>
    );
};

// FIX: Changed onSave prop type to not expect businessUnit, which is handled by the parent component.
export const AddProductTypeModal = ({ onSave, onClose, categories }: { onSave: (newProductType: Omit<ProductType, 'id' | 'businessUnit'>) => void, onClose: () => void, categories: Category[] }) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        let data = Object.fromEntries(formData.entries());

        const name = data.name as string;
        const image = (data.image as string) || `https://picsum.photos/seed/${name.replace(/\s/g, '')}/200`;

        onSave({ 
            name,
            price: parseFloat(data.price as string) || 0,
            image,
            category: data.category as string
        });
    };

    return (
        <StyledModal
            title="Add New Product Type"
            onClose={onClose}
            size="lg"
            footer={
                <div className="flex justify-end gap-2">
                    <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
                    <PrimaryButton type="submit" form="add-pt-form">Save Product Type</PrimaryButton>
                </div>
            }
        >
             <form id="add-pt-form" onSubmit={handleSubmit}>
                <ProductTypeFormBody categories={categories} />
            </form>
        </StyledModal>
    );
};