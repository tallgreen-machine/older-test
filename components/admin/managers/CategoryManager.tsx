import React, { useState } from 'react';
import { Folder, PlusCircle, Pencil, Trash2 } from 'lucide-react';
import type { Category, BusinessUnit, Product } from '../../../types';
import { Button, Card, ConfirmationModal, PrimaryButton } from '../../ui';
import { AddCategoryModal, EditCategoryModal } from '../../forms';
import { ManagerHeader } from '../ManagerHeader';
import { useAppContext } from '../../../contexts/AppContext';

export const CategoryManager = ({ categories, setCategories, permissions, activeBusinessUnit, products }: { categories: Category[], setCategories: React.Dispatch<React.SetStateAction<Category[]>>, permissions: { view: boolean; edit: boolean; create: boolean; delete: boolean; }, activeBusinessUnit: BusinessUnit, products: Product[] }) => {
    const { handleAddCategory, handleSaveCategory, handleDeleteCategory } = useAppContext();
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

    const handleAdd = (name: string) => {
        handleAddCategory(name, activeBusinessUnit);
        setShowAddModal(false);
    };

    const handleSave = (updatedCategory: Category) => {
        handleSaveCategory(updatedCategory);
        setEditingCategory(null);
    };

    const confirmDelete = () => {
        if (!categoryToDelete) return;

        const isUsed = products.some(p => p.category === categoryToDelete.name && (
            (activeBusinessUnit === 'sunshine' && p.businessUnit === 'sunshine') ||
            (activeBusinessUnit !== 'sunshine' && (p.businessUnit === 'fairwinds' || p.businessUnit === 'passion-flower'))
        ));
        
        if (isUsed) {
            alert('This category is currently in use by one or more products and cannot be deleted.');
            setCategoryToDelete(null);
            return;
        }
        handleDeleteCategory(categoryToDelete.id);
        setCategoryToDelete(null);
    };

    const brandName = activeBusinessUnit === 'sunshine' ? 'Sunshine' : 'Fairwinds / PF';

    return (
        <div>
            <ManagerHeader title={`${brandName} Categories`} icon={<Folder className="w-8 h-8 mr-3 text-gray-800" />}>
                {permissions.create && (
                    <PrimaryButton onClick={() => setShowAddModal(true)}>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add Category
                    </PrimaryButton>
                )}
            </ManagerHeader>

            <Card>
                <div className="divide-y divide-gray-200">
                    {categories.map(category => (
                        <div key={category.id} className="p-4 flex justify-between items-center">
                            <span className="font-medium text-gray-800">{category.name}</span>
                            <div className="flex gap-2">
                                {permissions.edit && <Button onClick={() => setEditingCategory(category)} variant="ghost" size="icon"><Pencil className="w-4 h-4" /></Button>}
                                {permissions.delete && <Button onClick={() => setCategoryToDelete(category)} variant="ghost" size="icon" className="text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>}
                            </div>
                        </div>
                    ))}
                     {categories.length === 0 && <p className="text-center text-gray-500 py-8">No categories created yet.</p>}
                </div>
            </Card>

            {showAddModal && <AddCategoryModal onClose={() => setShowAddModal(false)} onSave={handleAdd} />}
            {editingCategory && <EditCategoryModal category={editingCategory} onClose={() => setEditingCategory(null)} onSave={handleSave} />}
            <ConfirmationModal
                isOpen={!!categoryToDelete}
                onClose={() => setCategoryToDelete(null)}
                onConfirm={confirmDelete}
                title="Confirm Category Deletion"
                message={`Are you sure you want to delete the "${categoryToDelete?.name}" category? This action cannot be undone.`}
            />
        </div>
    );
};