import React, { useState, useEffect, useMemo } from "react";
import type { Dispensary, Product, ProductType, CategorySort, AlertBanner, OrderItem, Order, EnhancedVMIOrder } from '../../types';
import { ProductMenu } from "../shared/ProductMenu";
import { LicenseValidation } from "./LicenseValidation";
import { useAppContext } from '../../contexts/AppContext';

export const PublicView = () => {
    const { 
        currentUser,
        setView,
        publicData, 
        setSelectedPublicBrand, 
        setActiveAdminBU, 
        categorySortOrder, 
        handlePlaceOrder,
        selectedPublicBrand,
        setShowLogin,
        showMessage,
    } = useAppContext();

	const [validatedDispensary, setValidatedDispensary] = useState<Dispensary | null>(null);
	const [initialQty, setInitialQty] = useState(null);

    const onLoginClick = () => setShowLogin(true);
    const onBackToBrandSelection = () => setSelectedPublicBrand(null);
    const onSwitchView = () => {
        if (currentUser) {
            setActiveAdminBU(currentUser.businessUnits[0]);
            setView('admin');
        }
    };

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const dispensaryId = params.get('dispensaryId');
		const itemsParam = params.get('items');

		if (dispensaryId) {
			const foundDispensary = publicData.dispensaries.find(d => d.id === dispensaryId);
			if (foundDispensary) {
				setValidatedDispensary(foundDispensary);
				if (itemsParam) {
					const qty = itemsParam.split(',').reduce((acc, item) => {
						const [id, quantity] = item.split(':');
						acc[id as string] = parseInt(quantity, 10);
						return acc;
					}, {} as Record<string, number>);
					setInitialQty(qty as any);
				}
			}
		}
	}, [publicData.dispensaries]); // Run only once on initial mount


    const orderHistory = useMemo(() => {
        if (!validatedDispensary) return [];
        return publicData.orders.filter(o => o.dispensary.id === validatedDispensary.id);
    }, [publicData.orders, validatedDispensary]);

	if (!validatedDispensary) {
		return (
			<LicenseValidation 
                dispensaries={publicData.dispensaries}
                onValidate={setValidatedDispensary}
                onBack={onBackToBrandSelection}
                onAdminClick={onLoginClick}
                isAdminLoggedIn={!!currentUser}
                onSwitchView={onSwitchView}
            />
		);
	}

	return (
		<ProductMenu
			products={publicData.products}
			productTypes={publicData.productTypes}
			categorySortOrder={categorySortOrder}
			alertBanners={publicData.alertBanners}
			validatedDispensary={validatedDispensary}
			initialQty={initialQty}
			isVMI={false}
			onLoginClick={onLoginClick}
			isAdminLoggedIn={!!currentUser}
			onSwitchView={onSwitchView}
            orderHistory={orderHistory}
			currentBrand={selectedPublicBrand!}
			onBrandToggle={setSelectedPublicBrand}
		/>
	);
};