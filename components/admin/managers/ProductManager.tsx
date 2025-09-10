

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { Package, Pencil, Upload, Trash2, Download, PlusCircle, Search } from 'lucide-react';
import type { Product, ProductType, AlertBanner, BusinessUnit, Category } from '../../../types';
import { Button, Card, Input, Select, PrimaryButton, ConfirmationModal, ProductAdminTableRow, ProductAdminCard } from '../../ui';
import { EditProductModal } from '../../forms';
import { fmt } from '../../../constants';
import { ManagerHeader, getSortIcon } from '../ManagerHeader';
import { useDataProcessor } from '../../../hooks/useDataProcessor';
import { useAppContext } from '../../../contexts/AppContext';

export const ProductManager = ({ products, setProducts, productTypes, setProductTypes, alertBanners, categories, showMessage, handleDownload, handleUploadClick, setShowAddProductModal, permissions, activeBusinessUnit }: { products: Product[], setProducts: React.Dispatch<React.SetStateAction<Product[]>>, productTypes: ProductType[], setProductTypes: React.Dispatch<React.SetStateAction<ProductType[]>>, alertBanners: AlertBanner[], categories: Category[], showMessage: (message: string) => void, handleDownload: (type: 'products' | 'dispensaries') => void, handleUploadClick: (type: 'products' | 'dispensaries') => void, setShowAddProductModal: (show: boolean) => void, permissions: { view: boolean, create: boolean, edit: boolean, delete: boolean }, activeBusinessUnit: BusinessUnit }) => {
	const { handleAddProduct, handleUpdateProduct: contextHandleUpdateProduct } = useAppContext();
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [productToDelete, setProductToDelete] = useState<Product | null>(null);
	const [categoryFilter, setCategoryFilter] = useState<string>("All");
	const [nameFilter, setNameFilter] = useState<string>("");
	const fileInputRef = useRef<HTMLInputElement>(null);
	const currentProductIdRef = useRef<string | null>(null);
	const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'ascending' | 'descending' }>({ key: 'name', direction: 'ascending' });
    // FIX: Changed state type from `string` to a more specific `'None' | keyof Product` to satisfy the `useDataProcessor` hook's expected type for `groupKey`.
    const [groupKey, setGroupKey] = useState<'None' | keyof Product>("None");
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

	const handleUpdateProduct = (updatedProduct: Product) => {
		contextHandleUpdateProduct(updatedProduct);
		setEditingProduct(null);
	};

	const confirmDelete = () => {
		if (productToDelete) {
			setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
			showMessage(`Product "${productToDelete.name}" has been deleted.`);
			setProductToDelete(null);
		}
	};

	const getProductDetails = useCallback((product: Product) => {
		const type = productTypes.find(pt => pt.name === product.productType) || { price: 0, image: '' };
		const banner = alertBanners.find(b => b.id === product.alertBanner);
		return { price: type.price, image: type.image, bannerText: banner?.text, bannerColor: banner?.color };
	}, [productTypes, alertBanners]);

	const productsWithDetails = useMemo(() => {
		return products.map(p => {
			const details = getProductDetails(p);
			return { ...p, price: details.price, image: details.image, bannerText: details.bannerText, bannerColor: details.bannerColor };
		});
	}, [products, getProductDetails]);

	const requestSort = (key: string) => {
		let direction: 'ascending' | 'descending' = 'ascending';
		if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
			direction = 'descending';
		}
		setSortConfig({ key, direction });
	};

	const processedProducts = useDataProcessor({
        data: productsWithDetails,
        searchTerm: nameFilter,
        searchKeys: ['name'],
        sortConfig,
        groupKey,
        filters: {
            category: categoryFilter === 'All' ? null : categoryFilter,
        }
    });

	const handleImageUploadClick = (productId: string) => {
		currentProductIdRef.current = productId;
		fileInputRef.current?.click();
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file && currentProductIdRef.current) {
			const reader = new FileReader();
			reader.onloadend = () => {
                const product = products.find(p => p.id === currentProductIdRef.current);
                if (product) {
                    const productTypeName = product.productType;
                    setProductTypes(prev =>
                        prev.map(pt =>
                            pt.name === productTypeName
                                ? { ...pt, image: reader.result as string }
                                : pt
                        )
                    );
                }
			};
			reader.readAsDataURL(file);
		}
		if(event.target) event.target.value = '';
	};

	const sortOptions = [
		{ value: 'name-ascending', label: 'Name (A-Z)' }, { value: 'name-descending', label: 'Name (Z-A)' },
		{ value: 'sku-ascending', label: 'SKU (A-Z)' }, { value: 'sku-descending', label: 'SKU (Z-A)' },
		{ value: 'price-ascending', label: 'Price (Low-High)' }, { value: 'price-descending', label: 'Price (High-Low)' },
		{ value: 'qtyInStock-ascending', label: 'Stock (Low-High)' }, { value: 'qtyInStock-descending', label: 'Stock (High-Low)' },
	];

    const groupOptions = [
        { value: 'None', label: 'None' },
        { value: 'category', label: 'Category' },
        { value: 'productType', label: 'Product Type' }
    ];

	const isFwPfView = activeBusinessUnit !== 'sunshine';
    const brandName = activeBusinessUnit === 'sunshine' ? 'Sunshine' : 'Fairwinds / PF';

	return (
		<div>
			<ManagerHeader title={`${brandName} Products`} icon={<Package className="w-8 h-8 mr-3 text-foreground" />}>
                <Button onClick={() => handleDownload('products')} variant="outline"><Download className="w-4 h-4 mr-2"/> Download</Button>
                {permissions.create && <Button onClick={() => handleUploadClick('products')} variant="outline"><Upload className="w-4 h-4 mr-2"/> Upload</Button>}
                {permissions.create && <PrimaryButton onClick={() => setShowAddProductModal(true)}><PlusCircle className="w-4 h-4 mr-2"/> Add Product</PrimaryButton>}
            </ManagerHeader>

			<input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
			
            <Card className="p-4 mb-6">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					<div>
						<label className="text-sm font-medium text-muted-foreground block mb-1">Product Name</label>
						<div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
							<Input type="text" placeholder="Search by name..." value={nameFilter} onChange={e => setNameFilter(e.target.value)} className="pl-10" />
						</div>
					</div>
					<div>
						<label className="text-sm font-medium text-muted-foreground block mb-1">Category</label>
						<Select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
							<option value="All">All Categories</option>
							{categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
						</Select>
					</div>
                    <div>
						<label className="text-sm font-medium text-muted-foreground block mb-1">Group By</label>
						<Select value={groupKey} onChange={e => setGroupKey(e.target.value as 'None' | keyof Product)}>
							{groupOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
						</Select>
					</div>
					<div>
						<label className="text-sm font-medium text-muted-foreground block mb-1">Sort by</label>
						<Select value={`${sortConfig.key}-${sortConfig.direction}`} onChange={e => {
							const [key, direction] = e.target.value.split('-');
							setSortConfig({ key, direction: direction as any });
						}}>
							{sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
						</Select>
					</div>
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
								<th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell"><button onClick={() => requestSort('sku')} className="flex items-center gap-2">SKU {getSortIcon('sku', sortConfig)}</button></th>
								<th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell"><button onClick={() => requestSort('category')} className="flex items-center gap-2">CATEGORY {getSortIcon('category', sortConfig)}</button></th>
								{isFwPfView && <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell"><button onClick={() => requestSort('businessUnit')} className="flex items-center gap-2">BRAND {getSortIcon('businessUnit', sortConfig)}</button></th>}
								<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell"><button onClick={() => requestSort('price')} className="flex items-center justify-center gap-2 w-full">PRICE {getSortIcon('price', sortConfig)}</button></th>
								<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell"><button onClick={() => requestSort('qtyInStock')} className="flex items-center justify-center gap-2 w-full">STOCK {getSortIcon('qtyInStock', sortConfig)}</button></th>
								<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">ACTIONS</th>
							</tr>
						</thead>
						<tbody className="bg-card divide-y divide-border">
							{processedProducts.map(group => (
                                <React.Fragment key={group.groupTitle}>
                                    {groupKey !== "None" && (
                                        <tr className="bg-accent/50">
                                            <th colSpan={isFwPfView ? 8 : 7} className="px-4 py-2 text-left">
                                                <span className="inline-flex items-center px-3 py-1 text-sm font-semibold text-primary bg-primary/10 rounded-full border border-primary/50">
                                                    {group.groupTitle}
                                                    <span className="font-normal ml-2">({group.count})</span>
                                                </span>
                                            </th>
                                        </tr>
                                    )}
                                    {group.items.map(p => (
                                        <ProductAdminTableRow
                                            key={p.id}
                                            product={p}
                                            onEdit={setEditingProduct}
                                            onDelete={setProductToDelete}
                                            canEdit={permissions.edit}
                                            canDelete={permissions.delete}
                                            isExpanded={expandedRow === p.id}
                                            onToggleExpand={() => setExpandedRow(expandedRow === p.id ? null : p.id)}
                                            isFwPfView={isFwPfView}
                                        />
                                    ))}
                                </React.Fragment>
							))}
						</tbody>
					</table>
				</div>
                {/* Mobile Cards */}
                 <div className="block md:hidden">
                    <div className="bg-card">
                        {processedProducts.map(group => (
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
                                    {group.items.map(p => (
                                        <div key={p.id} className="p-4">
                                            <ProductAdminCard
                                                product={p}
                                                onEdit={setEditingProduct}
                                                onDelete={setProductToDelete}
                                                canEdit={permissions.edit}
                                                canDelete={permissions.delete}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
			</Card>
			{editingProduct && <EditProductModal product={editingProduct} onSave={handleUpdateProduct} onClose={() => setEditingProduct(null)} productTypes={productTypes} alertBanners={alertBanners} categories={categories} onImageUploadClick={handleImageUploadClick} activeBusinessUnit={activeBusinessUnit} />}
			{/* FIX: Removed invalid and redundant rendering of AddProductModal. This is correctly handled by the parent AdminView component and was causing a compile error. */}
            <ConfirmationModal
				isOpen={!!productToDelete}
				onClose={() => setProductToDelete(null)}
				onConfirm={confirmDelete}
				title="Confirm Product Deletion"
				message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
			/>
		</div>
	);
};
