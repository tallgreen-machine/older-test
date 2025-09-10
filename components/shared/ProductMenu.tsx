import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { Product, ProductType, CategorySort, AlertBanner, OrderItem, Dispensary, Order, EnhancedVMIOrder } from '../../types';
import { Card, Input, Button, PrimaryButton, ProductMenuTableRow, ProductMenuCard } from '../ui';
import { ShoppingCart, Search, ArrowLeft } from 'lucide-react';
import { fmt } from '../../constants';
import { CartSidebar } from './CartSidebar';
import { MobileCart } from './MobileCart';
import { PublicMenuHeader } from './PublicMenuHeader';
import { useCart } from '../../hooks/useCart';
import { useAppContext } from '../../contexts/AppContext';

interface HistoryItem {
    id: string;
    date: string;
    totalValue: number;
    totalItems: number;
    items: OrderItem[];
    status?: string;
}

export const ProductMenu = ({ products, productTypes, categorySortOrder, alertBanners, validatedDispensary, initialQty, isVMI, onUpdateVMI, onLoginClick, isAdminLoggedIn, onSwitchView, onSwitchToAdmin, orderHistory, currentBrand, onBrandToggle }: { products: Product[], productTypes: ProductType[], categorySortOrder: CategorySort[], alertBanners: AlertBanner[], validatedDispensary: Dispensary, initialQty?: Record<string, number> | null, isVMI: boolean, onUpdateVMI?: (orderItems: OrderItem[]) => void, onLoginClick?: () => void, isAdminLoggedIn?: boolean, onSwitchView?: () => void, onSwitchToAdmin?: () => void, orderHistory?: (Order[] | EnhancedVMIOrder[]), currentBrand: 'fairwinds' | 'sunshine-pf', onBrandToggle: (brand: 'fairwinds' | 'sunshine-pf') => void }) => {
    const { showMessage } = useAppContext();
    const {
        cartItems,
        handleQuantityChange,
        cartSubtotal,
        cartTotalItems,
        submitOrder,
        setInitialCart,
    } = useCart({ validatedDispensary, isVMI, onUpdateVMI });
    
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [selectedBanner, setSelectedBanner] = useState<string>("All");
    const [isCartVisible, setIsCartVisible] = useState(false);
    const [activeTab, setActiveTab] = useState<'order' | 'history'>('order');
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    useEffect(() => {
        if (initialQty) {
            setInitialCart(initialQty);
        }
    }, [initialQty, setInitialCart]);

    const getProductDetails = useCallback((product: Product) => {
        const type = productTypes.find(pt => pt.name === product.productType);
        const banner = alertBanners.find(b => b.id === product.alertBanner);
        return { price: type?.price || 0, image: type?.image || '', bannerText: banner?.text, bannerColor: banner?.color };
    }, [productTypes, alertBanners]);
    
    const searchedProducts = useMemo(() => {
        if (!searchTerm) return products;
        return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [products, searchTerm]);

    const availableCategories = useMemo(() => {
        const categories = new Set(searchedProducts.map(p => p.category));
        return ["All", ...Array.from(categories)];
    }, [searchedProducts]);

    const availableBanners = useMemo(() => {
        const banners = new Set<string>();
        searchedProducts.forEach(p => {
            const banner = alertBanners.find(b => b.id === p.alertBanner);
            if (banner) banners.add(banner.text);
        });
        return ["All", ...Array.from(banners)];
    }, [searchedProducts, alertBanners]);

    useEffect(() => {
        if (!availableCategories.includes(selectedCategory)) {
            setSelectedCategory("All");
        }
    }, [availableCategories, selectedCategory]);

     useEffect(() => {
        if (!availableBanners.includes(selectedBanner)) {
            setSelectedBanner("All");
        }
    }, [availableBanners, selectedBanner]);

    const filteredProducts = useMemo(() => {
        return searchedProducts.filter(p => {
            const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
            const banner = alertBanners.find(b => b.id === p.alertBanner);
            const matchesBanner = selectedBanner === "All" || (banner && banner.text === selectedBanner);
            return matchesCategory && matchesBanner;
        });
    }, [searchedProducts, selectedCategory, selectedBanner, alertBanners]);
    
    const groupedAndSortedProducts = useMemo(() => {
        const orderedCategoryNames = categorySortOrder.map(c => c.name);
        const grouped = filteredProducts.reduce((acc, product) => {
            const category = product.category || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(product);
            return acc;
        }, {} as Record<string, Product[]>);

        return Object.entries(grouped)
            .map(([categoryName, products]) => ({
                categoryName,
                products
            }))
            .sort((a, b) => {
                const indexA = orderedCategoryNames.indexOf(a.categoryName);
                const indexB = orderedCategoryNames.indexOf(b.categoryName);
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
            });
    }, [filteredProducts, categorySortOrder]);

    const handleReorder = (items: OrderItem[]) => {
        const newCartQuantities: Record<string, number> = {};
        let itemsAdded = 0;
        for (const item of items) {
            const product = products.find(p => p.id === item.id);
            if (product && product.qtyInStock > 0) {
                 const orderQty = Math.min(item.orderQty, product.qtyInStock);
                 if (orderQty > 0) {
                    newCartQuantities[item.id] = orderQty;
                    itemsAdded++;
                }
            }
        }
        setInitialCart(newCartQuantities);
        setActiveTab('order');
        setIsCartVisible(true);
        showMessage(`${itemsAdded} item(s) from a previous order have been added to your cart.`);
    };

    const handleToggleExpand = (productId: string) => {
        setExpandedRow(prev => (prev === productId ? null : productId));
    };

    const normalizedHistory = useMemo((): HistoryItem[] => {
        if (!orderHistory) return [];
        return orderHistory.map(order => {
            if ('versions' in order) { // EnhancedVMIOrder
                const latestVersion = order.versions.length > 0 ? order.versions[order.versions.length - 1] : null;
                
                if (!latestVersion || !latestVersion.items) {
                    return {
                        id: order.id,
                        date: order.versions?.[0]?.createdAt || new Date(0).toISOString(),
                        totalValue: 0,
                        totalItems: 0,
                        items: [],
                        status: order.status.replace(/_/g, ' ')
                    };
                }

                return {
                    id: order.id,
                    date: latestVersion.createdAt,
                    totalValue: latestVersion.items.reduce((sum, item) => sum + item.lineTotal, 0),
                    totalItems: latestVersion.items.reduce((sum, item) => sum + item.orderQty, 0),
                    items: latestVersion.items,
                    status: order.status.replace(/_/g, ' ')
                };
            } else { // Regular Order
                const items = order.items || [];
                return {
                    id: order.id,
                    date: order.date,
                    totalValue: items.reduce((sum, item) => sum + item.lineTotal, 0),
                    totalItems: items.reduce((sum, item) => sum + item.orderQty, 0),
                    items: items
                };
            }
        }).sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
            const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime();
            return timeB - timeA;
        });
    }, [orderHistory]);

    const handleOrderSubmit = () => {
        submitOrder();
        setIsCartVisible(false);
    };
    
    return (
        <div className="bg-background min-h-screen">
            {isVMI ? (
                 <header className="py-3 sticky top-0 z-30 bg-card border-b">
                    <div className="flex justify-end items-center px-6 md:px-8">
                        <Button onClick={onSwitchToAdmin} variant="outline" className="bg-card hover:bg-accent"><ArrowLeft className="w-4 h-4 mr-2"/> Back to Admin</Button>
                    </div>
                </header>
            ) : (
                <PublicMenuHeader
                    currentBrand={currentBrand}
                    onBrandToggle={onBrandToggle}
                    isAdminLoggedIn={isAdminLoggedIn}
                    onSwitchView={onSwitchView}
                    onLoginClick={onLoginClick}
                />
            )}

            <div className="flex items-start gap-8 px-6 md:px-8 py-8">
                <aside className="hidden lg:block sticky top-[77px] h-[calc(100vh-77px-2rem)] w-96 flex-shrink-0">
                   <CartSidebar 
                        isVMI={isVMI}
                        cartItems={cartItems}
                        cartSubtotal={cartSubtotal}
                        cartTotalItems={cartTotalItems}
                        handleOrderSubmit={handleOrderSubmit}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        orderHistory={normalizedHistory}
                        onReorder={handleReorder}
                        brand={currentBrand}
                   />
                </aside>
                
                <main className="flex-1 pb-24 lg:pb-0">
                    <div>
                        <Card className="p-4 mb-8">
                            <div className="space-y-4">
                                <h2 className="text-xl text-center font-semibold text-foreground">
                                    Ordering for: {validatedDispensary.name}
                                </h2>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input placeholder="Search products..." className="pl-10 h-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                </div>
                                {availableCategories.length > 2 && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground block mb-2">Category</label>
                                        <div className="flex flex-wrap gap-2">
                                            {availableCategories.map(cat => <Button key={cat} onClick={() => setSelectedCategory(cat)} variant={selectedCategory === cat ? 'default' : 'outline'} className="rounded-full h-8 px-4 text-xs">{cat}</Button>)}
                                        </div>
                                    </div>
                                )}
                                {availableBanners.length > 2 && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground block mb-2">Banner Labels</label>
                                        <div className="flex flex-wrap gap-2">
                                            {availableBanners.map(bannerText => <Button key={bannerText} onClick={() => setSelectedBanner(bannerText)} variant={selectedBanner === bannerText ? 'default' : 'outline'} className="rounded-full h-8 px-4 text-xs">{bannerText}</Button>)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Product List */}
                        <div>
                            <div className="hidden md:block">
                                <Card>
                                    <table className="w-full">
                                        <thead>
                                            <tr>
                                                <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase w-2/5">Product</th>
                                                <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase">Details</th>
                                                <th className="p-4 text-center text-xs font-semibold text-muted-foreground uppercase">Price</th>
                                                <th className="p-4 text-center text-xs font-semibold text-muted-foreground uppercase">Stock</th>
                                                <th className="p-4 text-center text-xs font-semibold text-muted-foreground uppercase w-[180px]">Quantity</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {groupedAndSortedProducts.length > 0 ? (
                                                groupedAndSortedProducts.map(({ categoryName, products: groupProducts }) => (
                                                    <React.Fragment key={categoryName}>
                                                        <tr>
                                                            <th colSpan={5} className="bg-slate-900 text-white p-2 pl-4 text-left">
                                                                <h3 className="text-lg font-semibold">{categoryName}</h3>
                                                            </th>
                                                        </tr>
                                                        {groupProducts.map(p => (
                                                            <ProductMenuTableRow
                                                                key={p.id}
                                                                product={p}
                                                                details={getProductDetails(p)}
                                                                orderQty={cartItems[p.id]?.orderQty || 0}
                                                                onQuantityChange={handleQuantityChange}
                                                                isExpanded={expandedRow === p.id}
                                                                onToggleExpand={() => handleToggleExpand(p.id)}
                                                            />
                                                        ))}
                                                    </React.Fragment>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="text-center text-muted-foreground py-12">No products match your filters.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </Card>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:hidden">
                                {groupedAndSortedProducts.length > 0 ? (
                                    groupedAndSortedProducts.map(({ categoryName, products: groupProducts }) => (
                                        <React.Fragment key={categoryName}>
                                            <div className="sm:col-span-2 xl:col-span-3">
                                                <div className="bg-slate-900 text-white p-2 pl-4 rounded-md">
                                                    <h3 className="text-lg font-semibold">{categoryName}</h3>
                                                </div>
                                            </div>
                                            {groupProducts.map(p => (
                                                <ProductMenuCard
                                                    key={p.id}
                                                    product={p}
                                                    details={getProductDetails(p)}
                                                    orderQty={cartItems[p.id]?.orderQty || 0}
                                                    onQuantityChange={handleQuantityChange}
                                                />
                                            ))}
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <p className="text-center text-muted-foreground py-12 sm:col-span-2 xl:col-span-3">No products match your filters.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Sticky Mobile Cart Button */}
            {cartTotalItems > 0 && !isCartVisible && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-card/90 backdrop-blur-sm border-t z-20 animate-fade-in-up">
                    <PrimaryButton className="w-full flex justify-center items-center shadow-lg" onClick={() => setIsCartVisible(true)}>
                        <ShoppingCart className="mr-2" size={16} />
                        View Cart ({cartTotalItems}) &ndash; {fmt(cartSubtotal)}
                    </PrimaryButton>
                </div>
            )}

            {/* Mobile Cart Overlay */}
            {isCartVisible && (
                <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity lg:hidden`} onClick={() => setIsCartVisible(false)}></div>
            )}
            <div className={`fixed bottom-0 left-0 right-0 lg:hidden bg-card rounded-t-lg shadow-2xl z-50 transform transition-transform duration-300 ${isCartVisible ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="max-h-[85vh]">
                     <MobileCart 
                        isVMI={isVMI}
                        cartItems={cartItems}
                        cartSubtotal={cartSubtotal}
                        cartTotalItems={cartTotalItems}
                        handleOrderSubmit={handleOrderSubmit}
                        onClose={() => setIsCartVisible(false)}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        orderHistory={normalizedHistory}
                        onReorder={handleReorder}
                    />
                </div>
            </div>
        </div>
    );
};
