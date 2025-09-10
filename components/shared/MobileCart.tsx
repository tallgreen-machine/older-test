import React, { useMemo } from 'react';
import { Card, Button, PrimaryButton } from '../ui';
import { X, RefreshCw, Calendar, FileText, Hash, DollarSign } from 'lucide-react';
import type { OrderItem } from '../../types';
import { fmt } from '../../constants';
import { SunshineLogo } from '../brands/sunshine/SunshineLogo';
import { FwPfLogo } from '../brands/fwpf/FwPfLogo';
import { safeFormatDate } from "../../utils";

interface HistoryItem {
    id: string;
    date: string;
    totalValue: number;
    totalItems: number;
    items: OrderItem[];
    status?: string;
}

interface MobileCartProps {
    isVMI: boolean;
    cartItems: Record<string, OrderItem>;
    cartSubtotal: number;
    cartTotalItems: number;
    handleOrderSubmit: () => void;
    onClose: () => void;
    activeTab: 'order' | 'history';
    onTabChange: (tab: 'order' | 'history') => void;
    orderHistory: HistoryItem[];
    onReorder: (items: OrderItem[]) => void;
}

export const MobileCart: React.FC<MobileCartProps> = ({
    isVMI,
    cartItems,
    cartSubtotal,
    cartTotalItems,
    handleOrderSubmit,
    onClose,
    activeTab,
    onTabChange,
    orderHistory,
    onReorder
}) => {
    const groupedByBrand = useMemo(() => {
        const groups: {
            sunshine: Record<string, OrderItem[]>;
            fw_pf: Record<string, OrderItem[]>;
        } = {
            sunshine: {},
            fw_pf: {}
        };

        let sunshineItemCount = 0;
        let fw_pfItemCount = 0;

        for (const item of Object.values(cartItems)) {
            const category = item.category || 'Uncategorized';
            if (item.businessUnit === 'sunshine') {
                if (!groups.sunshine[category]) groups.sunshine[category] = [];
                groups.sunshine[category].push(item);
                sunshineItemCount++;
            } else { // fairwinds or passion-flower
                if (!groups.fw_pf[category]) groups.fw_pf[category] = [];
                groups.fw_pf[category].push(item);
                fw_pfItemCount++;
            }
        }

        return {
            sunshine: { items: groups.sunshine, hasItems: sunshineItemCount > 0 },
            fw_pf: { items: groups.fw_pf, hasItems: fw_pfItemCount > 0 },
        };
    }, [cartItems]);

    const renderOrderTab = () => (
        <>
            {cartTotalItems > 0 ? (
                <div className="space-y-6">
                    {groupedByBrand.fw_pf.hasItems && (
                        <div>
                            <h2 className="font-bold text-lg mb-2 text-gray-900 border-b pb-1 flex items-center gap-2"><FwPfLogo className="h-6"/> Fairwinds / Passion Flower</h2>
                            <div className="space-y-4">
                                {Object.entries(groupedByBrand.fw_pf.items).map(([category, items]) => (
                                    <div key={`fw_pf-${category}`}>
                                        <h3 className="font-semibold text-gray-800 text-md mb-1">{category}</h3>
                                        <div>
                                            {items.map(item => (
                                                <div key={item.id} className="flex justify-between items-center text-sm py-2 border-b border-dashed border-gray-300 last:border-b-0">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-semibold text-gray-600 w-8 text-right pr-2">{item.orderQty}x</span>
                                                        <span className="text-gray-800">{item.name}</span>
                                                    </div>
                                                    <span className="font-semibold text-gray-800">{fmt(item.lineTotal)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {groupedByBrand.sunshine.hasItems && (
                        <div>
                            <h2 className="font-bold text-lg mb-2 text-gray-900 border-b pb-1 flex items-center gap-2"><SunshineLogo className="h-6"/> Sunshine</h2>
                            <div className="space-y-4">
                                {Object.entries(groupedByBrand.sunshine.items).map(([category, items]) => (
                                    <div key={`sunshine-${category}`}>
                                        <h3 className="font-semibold text-gray-800 text-md mb-1">{category}</h3>
                                        <div>
                                            {items.map(item => (
                                                <div key={item.id} className="flex justify-between items-center text-sm py-2 border-b border-dashed border-gray-300 last:border-b-0">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-semibold text-gray-600 w-8 text-right pr-2">{item.orderQty}x</span>
                                                        <span className="text-gray-800">{item.name}</span>
                                                    </div>
                                                    <span className="font-semibold text-gray-800">{fmt(item.lineTotal)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : <p className="text-center text-gray-500 py-8">Your cart is empty.</p>}
        </>
    );

    const renderHistoryTab = () => (
        <>
            {orderHistory.length > 0 ? orderHistory.map(order => (
                 <div key={order.id} className="py-3 border-b border-dashed border-gray-400 last:border-b-0">
                    <div className="flex justify-between items-start text-sm mb-2">
                        <div>
                            <p className="font-semibold text-gray-800 flex items-center gap-1.5"><Calendar size={12} className="text-gray-500"/> {safeFormatDate(order.date)}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1"><FileText size={12} /> {order.id}</p>
                        </div>
                        <div className="text-right flex-shrink-0 pl-2">
                            <p className="font-bold text-gray-900 flex items-center justify-end gap-1.5"><DollarSign size={12} /> {fmt(order.totalValue)}</p>
                            <p className="text-xs text-gray-500 flex items-center justify-end gap-1.5 mt-1"><Hash size={12} /> {order.totalItems} items</p>
                        </div>
                    </div>
                    {order.status && <p className="text-xs font-medium capitalize mb-2 text-center bg-gray-100 rounded-full py-0.5">{order.status}</p>}
                    <Button onClick={() => onReorder(order.items)} className="w-full mt-1 h-8 text-sm text-blue-600" variant="ghost">
                        <RefreshCw size={14} className="mr-2"/>
                        Re-order
                    </Button>
                </div>
            )) : <p className="text-center text-gray-500 py-8">No past orders found.</p>}
        </>
    );

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
                <h2 className="text-xl font-semibold text-gray-800">{isVMI ? "VMI Proposal" : "Your Order"}</h2>
                <Button variant="ghost" size="icon" onClick={onClose}><X size={24} /></Button>
            </div>

            {/* Tabs */}
            <div className="flex border-b mx-4 flex-shrink-0">
                <button
                    onClick={() => onTabChange('order')}
                    className={`flex-1 py-2 text-sm font-semibold text-center transition-colors ${activeTab === 'order' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                >
                    {isVMI ? 'Current Proposal' : 'Your Order'} ({cartTotalItems})
                </button>
                <button
                    onClick={() => onTabChange('history')}
                    className={`flex-1 py-2 text-sm font-semibold text-center transition-colors ${activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                >
                    History
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'order' ? renderOrderTab() : renderHistoryTab()}
            </div>
            
            {/* Footer */}
            {activeTab === 'order' && (
                <div className="p-4 border-t space-y-4 bg-gray-50/50 flex-shrink-0">
                    <div className="flex justify-between font-semibold"><span>Subtotal ({cartTotalItems} items)</span><span>{fmt(cartSubtotal)}</span></div>
                    <PrimaryButton className="w-full" onClick={handleOrderSubmit} disabled={Object.keys(cartItems).length === 0}>{isVMI ? "Create/Update Proposal" : "Place Order"}</PrimaryButton>
                </div>
            )}
        </div>
    );
};