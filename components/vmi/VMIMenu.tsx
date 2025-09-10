import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import type { Dispensary, Product, ProductType, CategorySort, AlertBanner, EnhancedVMIOrder, OrderItem } from '../../types';
import { Button, Card, PrimaryButton, Input } from '../ui';
import { ProductMenu } from '../shared/ProductMenu';
import { useAppContext } from '../../contexts/AppContext';

export const VMIMenu = () => {
    const {
        setView,
        publicData, 
        categorySortOrder, 
        handleCreateVMIProposal,
        handleUpdateVMIProposal, 
        selectedPublicBrand: currentBrand, 
        setSelectedPublicBrand: onBrandToggle,
        showMessage,
    } = useAppContext();

    const { dispensaries, products, productTypes, alertBanners, vmiOrders } = publicData;

    const [selectedDispensary, setSelectedDispensary] = useState<Dispensary | null>(null);
    const [activeProposal, setActiveProposal] = useState<EnhancedVMIOrder | null>(null);
    const [mode, setMode] = useState<'select_dispensary' | 'select_action' | 'menu'>('select_dispensary');
    const [dispensarySearchTerm, setDispensarySearchTerm] = useState('');

    const onSwitchToAdmin = () => setView('admin');

    const handleSelectDispensary = (dispensaryId: string) => {
        const dispensary = dispensaries.find(d => d.id === dispensaryId);
        if (dispensary) {
            setSelectedDispensary(dispensary);
            const existingProposal = vmiOrders.find(o => o.dispensary.id === dispensary.id && o.isActive);
            setActiveProposal(existingProposal || null);
            setMode('select_action');
        }
    };

    const handleProposalSubmit = async (items: OrderItem[]) => {
        if (!selectedDispensary) return;

        if (activeProposal) {
            await handleUpdateVMIProposal(activeProposal, items, 'sales_rep');
        } else {
            await handleCreateVMIProposal(selectedDispensary, items, currentBrand!);
        }
        setMode('select_dispensary');
        setSelectedDispensary(null);
        setActiveProposal(null);
    };
    
    const initialQuantities = useMemo(() => {
        if (activeProposal && mode === 'menu') {
            const latestVersion = activeProposal.versions[activeProposal.versions.length - 1];
            return latestVersion.items.reduce((acc, item) => {
                acc[item.id] = item.orderQty;
                return acc;
            }, {} as Record<string, number>);
        }
        return null;
    }, [activeProposal, mode]);

    const orderHistory = useMemo(() => {
        if (!selectedDispensary) return [];
        return vmiOrders.filter(o => o.dispensary.id === selectedDispensary.id);
    }, [vmiOrders, selectedDispensary]);

    const filteredDispensaries = useMemo(() => {
        return dispensaries.filter(d => 
            d.name.toLowerCase().includes(dispensarySearchTerm.toLowerCase())
        );
    }, [dispensaries, dispensarySearchTerm]);

    if (mode === 'menu' && selectedDispensary) {
        return (
             <ProductMenu
                products={products}
                productTypes={productTypes}
                categorySortOrder={categorySortOrder}
                alertBanners={alertBanners}
                validatedDispensary={selectedDispensary}
                initialQty={initialQuantities}
                isVMI={true}
                onUpdateVMI={handleProposalSubmit}
                onSwitchToAdmin={onSwitchToAdmin}
                orderHistory={orderHistory}
                currentBrand={currentBrand!}
                onBrandToggle={onBrandToggle}
            />
        )
    }
    
    const renderContent = () => {
        switch(mode) {
            case 'select_dispensary':
                return (
                    <Card className="w-full max-w-2xl p-8 animate-fade-in-up">
                        <h1 className="text-2xl font-bold mb-2 text-center">VMI Proposal Menu</h1>
                        <p className="text-gray-600 mb-6 text-center">Select a dispensary to create or manage a proposal.</p>
                        
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input 
                                type="text"
                                placeholder="Search dispensaries by name..."
                                value={dispensarySearchTerm}
                                onChange={e => setDispensarySearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {filteredDispensaries.length > 0 ? (
                                filteredDispensaries.map(d => (
                                <button key={d.id} onClick={() => handleSelectDispensary(d.id)} className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 flex justify-between items-center transition-colors">
                                    <div>
                                        <p className="font-semibold">{d.name}</p>
                                        <p className="text-sm text-gray-500">{d.address}</p>
                                    </div>
                                    {vmiOrders.some(o => o.dispensary.id === d.id && o.isActive) && 
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">Active Proposal</span>}
                                </button>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-8">No dispensaries found.</p>
                            )}
                        </div>
                    </Card>
                );
            case 'select_action':
                if (!selectedDispensary) return null;
                return (
                    <Card className="w-full max-w-md p-8 text-center animate-fade-in-up">
                        <h2 className="text-xl font-bold mb-4">Dispensary: {selectedDispensary.name}</h2>
                        {activeProposal ? (
                            <>
                                <p className="mb-6">An active VMI proposal already exists for this dispensary.</p>
                                <div className="space-y-3">
                                    <PrimaryButton className="w-full" onClick={() => setMode('menu')}>Edit Existing Proposal</PrimaryButton>
                                    <Button variant="outline" className="w-full" onClick={() => { setActiveProposal(null); setMode('menu'); }}>Start a New Proposal</Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="mb-6">No active VMI proposal found. Create a new one?</p>
                                <PrimaryButton className="w-full" onClick={() => setMode('menu')}>Create New Proposal</PrimaryButton>
                            </>
                        )}
                        <Button variant="ghost" onClick={() => { setMode('select_dispensary'); setDispensarySearchTerm(''); }} className="mt-6">Back to Dispensary List</Button>
                    </Card>
                );
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <nav 
                className="py-3 sticky top-0 z-10 bg-white border-b"
            >
                <div className="flex justify-end items-center px-6 md:px-8">
                     <Button onClick={onSwitchToAdmin} variant="outline" className="bg-white hover:bg-gray-200"><ArrowLeft className="w-4 h-4 mr-2"/> Back to Admin</Button>
                </div>
            </nav>
            <main className="container mx-auto px-4 flex-grow flex flex-col items-center justify-center py-8">
                {renderContent()}
            </main>
        </div>
    );
};