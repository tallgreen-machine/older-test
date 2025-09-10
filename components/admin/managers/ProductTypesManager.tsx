import React, { useState, useMemo } from 'react';
import { Layers, Pencil, Trash2, PlusCircle, ChevronDown } from 'lucide-react';
import type { ProductType, BusinessUnit, Category } from '../../../types';
import { Button, Card, ConfirmationModal, Select, PrimaryButton } from '../../ui';
import { EditProductTypeModal, AddProductTypeModal } from '../../forms';
import { ManagerHeader, getSortIcon } from '../ManagerHeader';
import { fmt } from '../../../constants';
import { useDataProcessor } from '../../../hooks/useDataProcessor';
import { useAppContext } from '../../../contexts/AppContext';

export const ProductTypesManager = ({ productTypes, setProductTypes, categories, showMessage, permissions, activeBusinessUnit }: { productTypes: ProductType[], setProductTypes: React.Dispatch<React.SetStateAction<ProductType[]>>, categories: Category[], showMessage: (message: string) => void, permissions: { view: boolean, create: boolean, edit: boolean, delete: boolean }, activeBusinessUnit: BusinessUnit }) => {
    const { handleAddProductType, handleSaveProductType, handleDeleteProductType } = useAppContext();
    const [editingProductType, setEditingProductType] = useState<ProductType | null>(null);
    const [productTypeToDelete, setProductTypeToDelete] = useState<ProductType | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'ascending' | 'descending' }>({ key: 'name', direction: 'ascending' });
    // FIX: Changed state type from `string` to a more specific `'None' | keyof ProductType` to satisfy the `useDataProcessor` hook's expected type for `groupKey`.
    const [groupKey, setGroupKey] = useState<'None' | keyof ProductType>("None");
    const [showAddModal, setShowAddModal] = useState(false);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const brandName = activeBusinessUnit === 'sunshine' ? 'Sunshine' : 'Fairwinds / PF';

    const requestSort = (key: string) => {
		let direction: 'ascending' | 'descending' = 'ascending';
		if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
			direction = 'descending';
		}
		setSortConfig({ key, direction });
	};

    const processedProductTypes = useDataProcessor<ProductType>({
        data: productTypes,
        sortConfig,
        groupKey,
    });

    const handleSave = (updates: Partial<ProductType>) => {
        if (editingProductType) {
            handleSaveProductType({ ...editingProductType, ...updates });
            setEditingProductType(null);
        }
    };
    
    const handleAdd = (newProductType: Omit<ProductType, 'id' | 'businessUnit'>) => {
        if (productTypes.some(pt => pt.name.toLowerCase() === newProductType.name.toLowerCase() && pt.businessUnit === activeBusinessUnit)) {
            showMessage(`A product type with the name "${newProductType.name}" already exists for this brand.`);
            return;
        }
        handleAddProductType({ ...newProductType, businessUnit: activeBusinessUnit });
        setShowAddModal(false);
    };

    const confirmDelete = () => {
        if (productTypeToDelete) {
            handleDeleteProductType(productTypeToDelete.id);
            setProductTypeToDelete(null);
        }
    };

    const groupOptions = [
        { value: 'None', label: 'None' },
        { value: 'category', label: 'Category' },
    ];

    return (
        <div>
            <ManagerHeader title={`${brandName} Product Types`} icon={<Layers className="w-8 h-8 mr-3 text-foreground" />}>
                {permissions.create && (
                    <PrimaryButton onClick={() => setShowAddModal(true)}>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add Product Type
                    </PrimaryButton>
                )}
            </ManagerHeader>
            
            <Card className="p-4 mb-6">
                <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-1">Group By</label>
                    <Select value={groupKey} onChange={e => setGroupKey(e.target.value as 'None' | keyof ProductType)}>
                        {groupOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </Select>
                </div>
            </Card>
            
            <Card>
                {/* Desktop Table */}
				<div className="hidden md:block">
					<table className="w-full text-sm">
						<thead className="bg-muted/50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">IMAGE</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"><button onClick={() => requestSort('name')} className="flex items-center gap-2">NAME {getSortIcon('name', sortConfig)}</button></th>
								<th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell"><button onClick={() => requestSort('category')} className="flex items-center gap-2">CATEGORY {getSortIcon('category', sortConfig)}</button></th>
								<th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell"><button onClick={() => requestSort('price')} className="flex items-center gap-2">PRICE {getSortIcon('price', sortConfig)}</button></th>
								<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">ACTIONS</th>
							</tr>
						</thead>
						<tbody className="bg-card divide-y divide-border">
							{processedProductTypes.map(group => (
                                <React.Fragment key={group.groupTitle}>
                                    {groupKey !== "None" && (
                                        <tr className="bg-accent/50">
                                            <th colSpan={5} className="px-4 py-2 text-left">
                                                <span className="inline-flex items-center px-3 py-1 text-sm font-semibold text-primary bg-primary/10 rounded-full border border-primary/50">
                                                    {group.groupTitle}
                                                    <span className="font-normal ml-2">({group.count})</span>
                                                </span>
                                            </th>
                                        </tr>
                                    )}
                                    {group.items.map(pt => {
                                        const isExpanded = expandedRow === pt.id;
                                        return (
                                        <React.Fragment key={pt.id}>
                                            <tr className="hover:bg-accent/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="w-10 h-10 rounded-lg bg-secondary overflow-hidden">
                                                        <img src={pt.image} alt={pt.name} className="w-full h-full object-cover"/>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">{pt.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-muted-foreground hidden lg:table-cell">{pt.category}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-muted-foreground hidden lg:table-cell">{fmt(pt.price)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="flex gap-2 justify-center">
                                                        {permissions.edit && <Button onClick={() => setEditingProductType(pt)} variant="ghost" className="p-2 h-auto"><Pencil className="w-4 h-4" /></Button>}
                                                        {permissions.delete && <Button onClick={() => setProductTypeToDelete(pt)} variant="ghost" className="p-2 h-auto text-red-600 hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>}
                                                        <Button variant="ghost" size="icon" className="lg:hidden p-2 h-auto" onClick={() => setExpandedRow(isExpanded ? null : pt.id)}>
                                                            <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr className="lg:hidden">
                                                    <td colSpan={5} className="p-4 bg-accent/50">
                                                        <div className="space-y-2 text-sm text-muted-foreground">
                                                            <p><strong className="text-foreground block">Category:</strong> {pt.category}</p>
                                                            <p><strong className="text-foreground block">Price:</strong> {fmt(pt.price)}</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    )})}
                                </React.Fragment>
							))}
						</tbody>
					</table>
				</div>
                {/* Mobile Cards */}
                <div className="block md:hidden">
                    <div className="bg-card">
                        {processedProductTypes.map(group => (
                             <div key={group.groupTitle} className="first:pt-0 last:pb-0 py-4">
                                {groupKey !== "None" && (
                                     <h2 className="px-4 py-2 bg-accent/50">
                                        <span className="inline-flex items-center px-3 py-1 text-md font-semibold text-primary bg-primary/10 rounded-full border border-primary/50">
                                            {group.groupTitle}
                                            <span className="font-normal ml-2">({group.count})</span>
                                        </span>
                                    </h2>
                                )}
                                <div className="divide-y divide-border">
                                    {group.items.map(pt => (
                                         <div key={pt.id} className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                                                        <img src={pt.image} alt={pt.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-foreground">{pt.name}</p>
                                                        <p className="text-sm text-muted-foreground">{pt.category} - {fmt(pt.price)}</p>
                                                    </div>
                                                </div>
									            <div className="flex items-center gap-1 -mt-2 -mr-2 flex-shrink-0">
                                    	            {permissions.edit && <Button onClick={() => setEditingProductType(pt)} variant="ghost" className="p-2 h-auto"><Pencil size={16} /></Button>}
                                                    {permissions.delete && <Button onClick={() => setProductTypeToDelete(pt)} variant="ghost" className="p-2 h-auto text-red-600 hover:bg-destructive/10"><Trash2 size={16} /></Button>}
									            </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
			</Card>

            {editingProductType && <EditProductTypeModal productType={editingProductType} onSave={handleSave} onClose={() => setEditingProductType(null)} categories={categories} />}
            {showAddModal && <AddProductTypeModal onSave={handleAdd} onClose={() => setShowAddModal(false)} categories={categories} />}
            <ConfirmationModal
				isOpen={!!productTypeToDelete}
				onClose={() => setProductTypeToDelete(null)}
				onConfirm={confirmDelete}
				title="Confirm Product Type Deletion"
				message={`Are you sure you want to delete "${productTypeToDelete?.name}"? This action cannot be undone.`}
			/>
        </div>
    );
};