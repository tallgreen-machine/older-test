
import React, { useState, useCallback } from 'react';
import { StyledModal, Input, Textarea, Select, Button, PrimaryButton, FormField } from '../ui';
import type { Product, ProductType, AlertBanner, BusinessUnit, Category } from '../../types';
import { Upload } from 'lucide-react';
import { dohTypes } from '../../constants';

const productFormSections = [
    { key: 'core', label: 'Core Info' },
    { key: 'classification', label: 'Classification' },
    { key: 'attributes', label: 'Attributes' },
    { key: 'display', label: 'Display & Inventory' },
];

const ProductForm = ({
    product,
    productTypes,
    alertBanners,
    categories,
    onImageUploadClick,
    activeBusinessUnit,
    formId,
    onClose,
}: {
    product?: Product;
    productTypes: ProductType[];
    alertBanners: AlertBanner[];
    categories: Category[];
    onImageUploadClick?: (id: string) => void;
    activeBusinessUnit: BusinessUnit;
    formId: string;
    onClose: () => void;
}) => {
    const [activeSection, setActiveSection] = useState('core');
    const isAdding = !product;
    const canSubmit = isAdding ? (productTypes.length > 0 && categories.length > 0) : true;
    const selectsDisabled = isAdding && !canSubmit;

    const details = {
        image: product ? productTypes.find(pt => pt.name === product.productType)?.image : undefined
    };
    
    const isFwPfView = activeBusinessUnit !== 'sunshine';

    const sidebar = (
        <div className="space-y-1">
            {productFormSections.map(section => (
                <button
                    key={section.key}
                    type="button"
                    onClick={() => setActiveSection(section.key)}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${activeSection === section.key ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}
                >
                    {section.label}
                </button>
            ))}
        </div>
    );
    
    return (
        <StyledModal 
            title={product ? "Edit Product" : "Add New Product"}
            onClose={onClose}
            sidebar={sidebar}
            size="2xl"
            footer={
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <PrimaryButton type="submit" form={formId} disabled={!canSubmit}>{product ? "Save Changes" : "Save Product"}</PrimaryButton>
                </div>
            }
        >
             {isAdding && !canSubmit && (
                 <div className="p-3 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 dark:text-yellow-300" role="alert">
                    <span className="font-medium">Cannot add product!</span> Please create at least one Product Type and one Category for this brand before adding a new product.
                </div>
            )}
            
            <div hidden={activeSection !== 'core'}>
                 <div className="flex flex-col md:flex-row gap-6">
                    {product && onImageUploadClick && (
                        <div className="flex-shrink-0 flex flex-col items-center gap-2 w-full md:w-40">
                            <div className="w-full h-40 rounded-lg overflow-hidden bg-secondary flex items-center justify-center">
                                {details.image ? <img src={details.image} alt={product.name} className="w-full h-full object-cover" /> : <span className="text-sm text-muted-foreground text-center">No Photo</span>}
                            </div>
                            <Button onClick={() => onImageUploadClick(product.id)} type="button" variant="outline" className="w-full"><Upload className="w-4 h-4 mr-2" /> Upload</Button>
                        </div>
                    )}
                    <div className="flex-1 space-y-4">
                        <FormField label="Name">
                            <Input name="name" defaultValue={product?.name || ''} placeholder="e.g., Pineapple Express" required />
                        </FormField>
                        <FormField label="Description">
                            <Textarea name="description" defaultValue={product?.description || ''} placeholder="e.g., Sweet, tropical, cedar. Energetic, happy, creative." required rows={product ? 4 : 8} />
                        </FormField>
                    </div>
                </div>
            </div>

            <div hidden={activeSection !== 'classification'}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Product Type">
                        <Select name="productType" defaultValue={product?.productType || (productTypes[0]?.name || '')} disabled={selectsDisabled}>
                            {productTypes.length > 0 ? (
                                productTypes.map(pt => <option key={pt.name} value={pt.name}>{pt.name}</option>)
                            ) : (
                                <option>Create a Product Type first.</option>
                            )}
                        </Select>
                    </FormField>
                    <FormField label="Category">
                        <Select name="category" defaultValue={product?.category || (categories[0]?.name || '')} disabled={selectsDisabled}>
                            {categories.length > 0 ? (
                                categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)
                            ) : (
                                <option>Create a Category first.</option>
                            )}
                        </Select>
                    </FormField>
                    <FormField label="SKU">
                        <Input name="sku" defaultValue={product?.sku || ''} placeholder="e.g., SUN-FL-PEX-35" required />
                    </FormField>
                </div>
            </div>

            <div hidden={activeSection !== 'attributes'}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Top Terpenes"><Input name="topTerpenes" defaultValue={product?.topTerpenes || ''} placeholder="e.g., Terpinolene, Myrcene" /></FormField>
                    <FormField label="Genetics"><Input name="genetics" defaultValue={product?.genetics || ''} placeholder="e.g., Sativa" /></FormField>
                    <FormField label="Feels Like"><Input name="feelsLike" defaultValue={product?.feelsLike || ''} placeholder="e.g., Energetic, Happy" /></FormField>
                </div>
            </div>
            
            <div hidden={activeSection !== 'display'}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Alert Banner">
                        <Select name="alertBanner" defaultValue={product?.alertBanner || ''}>
                            <option value="">No Banner</option>
                            {alertBanners.map(b => <option key={b.id} value={b.id}>{b.text}</option>)}
                        </Select>
                    </FormField>
                    <FormField label="DOH Type">
                         <Select name="dohType" defaultValue={product?.dohType || 'None'}>
                            {dohTypes.map(d => <option key={d} value={d}>{d}</option>)}
                        </Select>
                    </FormField>
                    {isFwPfView && (
                        <FormField label="Business Unit">
                            <Select name="businessUnit" defaultValue={product?.businessUnit || 'fairwinds'}>
                                <option value="fairwinds">Fairwinds</option>
                                <option value="passion-flower">Passion Flower</option>
                            </Select>
                        </FormField>
                    )}
                    <FormField label="Qty in Stock">
                        <Input type="number" defaultValue={product?.qtyInStock || 0} disabled />
                        <p className="text-xs text-muted-foreground mt-1">Managed via inventory sync.</p>
                    </FormField>
                </div>
            </div>
        </StyledModal>
    );
};


export const AddProductModal = ({ onClose, onSave, productTypes, alertBanners, categories, activeBusinessUnit }: { onClose: () => void, onSave: (product: Omit<Product, 'id'>) => Promise<void>, productTypes: ProductType[], alertBanners: AlertBanner[], categories: Category[], activeBusinessUnit: BusinessUnit }) => {
	const formId = "add-product-form";

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

		const newProduct: Omit<Product, 'id'> = {
			name: data.name as string,
			description: data.description as string,
			productType: data.productType as string,
			category: data.category as string,
			sku: data.sku as string,
			topTerpenes: data.topTerpenes as string,
			genetics: data.genetics as string,
			feelsLike: data.feelsLike as string,
			alertBanner: (data.alertBanner as string) || null,
			qtyInStock: 0,
			dohType: data.dohType as Product['dohType'],
			businessUnit: (data.businessUnit as BusinessUnit) || activeBusinessUnit
		};
		await onSave(newProduct);
		onClose();
	};
	
	return (
        <form id={formId} onSubmit={handleSubmit}>
            <ProductForm 
                productTypes={productTypes}
                alertBanners={alertBanners}
                categories={categories}
                activeBusinessUnit={activeBusinessUnit}
                formId={formId}
                onClose={onClose}
            />
        </form>
	);
};


export const EditProductModal = ({ product, onSave, onClose, productTypes, alertBanners, categories, onImageUploadClick, activeBusinessUnit }: { product: Product, onSave: (product: Product) => void, onClose: () => void, productTypes: ProductType[], alertBanners: AlertBanner[], categories: Category[], onImageUploadClick: (id: string) => void, activeBusinessUnit: BusinessUnit }) => {
    const formId = "edit-product-form";

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        const updatedProduct = {
            ...product,
            ...data,
            alertBanner: (data.alertBanner as string) || null,
        };
        onSave(updatedProduct);
    };

    return (
         <form id={formId} onSubmit={handleSubmit}>
            <ProductForm 
                product={product}
                productTypes={productTypes}
                alertBanners={alertBanners}
                categories={categories}
                onImageUploadClick={onImageUploadClick}
                activeBusinessUnit={activeBusinessUnit}
                formId={formId}
                onClose={onClose}
            />
        </form>
    );
};
