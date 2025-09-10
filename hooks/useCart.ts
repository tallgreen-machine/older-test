import { useState, useMemo, useCallback } from 'react';
import type { Product, OrderItem, Dispensary, ProductType, AlertBanner } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface UseCartProps {
    validatedDispensary: Dispensary;
    isVMI: boolean;
    onUpdateVMI?: (orderItems: OrderItem[]) => void;
}

export const useCart = ({ validatedDispensary, isVMI, onUpdateVMI }: UseCartProps) => {
    const { publicData, handlePlaceOrder, showMessage } = useAppContext();
    const { products, productTypes, alertBanners } = publicData;
    const [cartItems, setCartItems] = useState<Record<string, OrderItem>>({});

    const getProductDetails = useCallback((product: Product) => {
        const type = productTypes.find((pt: ProductType) => pt.name === product.productType);
        const banner = alertBanners.find((b: AlertBanner) => b.id === product.alertBanner);
        return { 
            price: type?.price || 0, 
            image: type?.image || '', 
            bannerText: banner?.text, 
            bannerColor: banner?.color 
        };
    }, [productTypes, alertBanners]);

    const handleQuantityChange = useCallback((product: Product, quantity: number) => {
        const details = getProductDetails(product);
        setCartItems(prev => {
            const newCart = { ...prev };
            if (quantity > 0) {
                newCart[product.id] = { 
                    id: product.id, 
                    name: product.name, 
                    productType: product.productType, 
                    price: details.price, 
                    orderQty: quantity, 
                    lineTotal: details.price * quantity, 
                    sku: product.sku, 
                    category: product.category, 
                    businessUnit: product.businessUnit 
                };
            } else {
                delete newCart[product.id];
            }
            return newCart;
        });
    }, [getProductDetails]);

    const clearCart = useCallback(() => {
        setCartItems({});
    }, []);

    const setInitialCart = useCallback((initialQty: Record<string, number>) => {
        const initialCart: Record<string, OrderItem> = {};
        for (const productId in initialQty) {
            const product = products.find((p: Product) => p.id === productId);
            if (product) {
                const productType = productTypes.find((pt: ProductType) => pt.name === product.productType);
                if (productType) {
                    const orderQty = initialQty[productId];
                    initialCart[productId] = { 
                        id: product.id, 
                        name: product.name, 
                        productType: product.productType, 
                        price: productType.price, 
                        orderQty: orderQty, 
                        lineTotal: productType.price * orderQty, 
                        sku: product.sku, 
                        category: product.category, 
                        businessUnit: product.businessUnit 
                    };
                }
            }
        }
        setCartItems(initialCart);
    }, [products, productTypes]);

    const cartSubtotal = useMemo(() => Object.values(cartItems).reduce((sum, item) => sum + item.lineTotal, 0), [cartItems]);
    const cartTotalItems = useMemo(() => Object.values(cartItems).reduce((sum, item) => sum + item.orderQty, 0), [cartItems]);

    const submitOrder = useCallback(() => {
        const orderItemsList = Object.values(cartItems);
        if (isVMI) {
            onUpdateVMI?.(orderItemsList);
        } else {
            handlePlaceOrder(orderItemsList, validatedDispensary, clearCart);
        }
    }, [cartItems, isVMI, onUpdateVMI, handlePlaceOrder, validatedDispensary, clearCart]);

    return {
        cartItems,
        handleQuantityChange,
        cartSubtotal,
        cartTotalItems,
        submitOrder,
        clearCart,
        setInitialCart,
    };
};