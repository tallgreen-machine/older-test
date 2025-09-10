import React, { useState, ReactNode } from 'react';
import { Package, ShoppingCart, Layers, ListOrdered, ChevronDown, PlusCircle, Inbox } from "lucide-react";
import { SunshineLogo } from '../brands/sunshine/SunshineLogo';
import { FwPfLogo } from '../brands/fwpf/FwPfLogo';
import type { PermissionSet, BusinessUnit } from '../../types';

interface AdminSidebarProps {
    adminTab: string;
    setAdminTab: (tab: string) => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
    onSwitchToVMI: () => void;
    permissions: PermissionSet;
    activeBusinessUnit: BusinessUnit;
    setActiveBusinessUnit: (bu: BusinessUnit) => void;
    unreadCounts: {
        sunshine: { regular: number; vmi: number; };
        fwpf: { regular: number; vmi: number; };
    };
}

const CollapsibleHeader = ({ title, children, isOpen, onToggle }: { title: ReactNode, children: ReactNode, isOpen: boolean, onToggle: () => void }) => (
    <div>
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-sm font-semibold text-foreground hover:bg-accent"
        >
            <span className="flex items-center">{title}</span>
            <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && <div className="pt-1 space-y-1 pl-4">{children}</div>}
    </div>
);

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ adminTab, setAdminTab, isSidebarOpen, setIsSidebarOpen, onSwitchToVMI, permissions, activeBusinessUnit, setActiveBusinessUnit, unreadCounts }) => {
    const [openSections, setOpenSections] = useState({
        'fairwinds-product': true,
        'fairwinds-orders': true,
        'sunshine-product': true,
        'sunshine-orders': true,
    });

    const toggleSection = (key: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleNavClick = (tab: string, businessUnit?: BusinessUnit) => {
        if (businessUnit) {
            setActiveBusinessUnit(businessUnit);
        }
        setAdminTab(tab);
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    };
    
    const NavLink = ({ tab, icon, children, businessUnit, count = 0 }: { tab: string, icon: ReactNode, children: ReactNode, businessUnit?: BusinessUnit, count?: number }) => {
        const isActive = adminTab === tab && (!businessUnit || (businessUnit === 'fairwinds' && activeBusinessUnit !== 'sunshine') || (businessUnit === 'sunshine' && activeBusinessUnit === 'sunshine'));
        return (
            <button onClick={() => handleNavClick(tab, businessUnit)} className={`w-full flex items-center text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}>
                {icon}
                <span className="flex-grow">{children}</span>
                {count > 0 && <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{count}</span>}
            </button>
        );
    };
    
    const ActionLink = ({ icon, children, action }: { icon: ReactNode, children: ReactNode, action: () => void }) => {
        return (
             <button onClick={action} className="w-full flex items-center text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:bg-accent hover:text-foreground">
                {icon}{children}
            </button>
        );
    }

    const brandSubSections = (brandKey: 'fairwinds' | 'sunshine') => {
        const hasOrderPerms = permissions.ordersRegular.view || permissions.ordersVmi.view;
        const sunshineOrderCount = unreadCounts.sunshine.regular + unreadCounts.sunshine.vmi;
        const fwpfOrderCount = unreadCounts.fwpf.regular + unreadCounts.fwpf.vmi;

        return {
            productManagement: {
                key: `${brandKey}-product`,
                title: 'Product Management',
                items: [
                    { key: 'products', title: 'Products', icon: <Package className="w-4 h-4 mr-2"/>, permission: permissions.products.view },
                    { key: 'productTypes', title: 'Product Types', icon: <Layers className="w-4 h-4 mr-2"/>, permission: permissions.productTypes.view },
                    { key: 'categorySort', title: 'Category Sort Order', icon: <ListOrdered className="w-4 h-4 mr-2"/>, permission: permissions.categorySort.view },
                ].filter(i => i.permission)
            },
            orders: {
                key: `${brandKey}-orders`,
                title: 'Orders',
                items: hasOrderPerms ? [
                    { key: 'orders-received', title: 'Orders Received', icon: <Inbox className="w-4 h-4 mr-2"/>, permission: true, count: brandKey === 'sunshine' ? sunshineOrderCount : fwpfOrderCount }
                ] : []
            },
        };
    };

    const fwSubSections = brandSubSections('fairwinds');
    const sunSubSections = brandSubSections('sunshine');
    
    const navContent = (
        <div className="flex flex-col h-full">
            <div className="flex-grow">
                {/* Fairwinds / PF Section */}
                <div className="p-4 border-b border-border">
                    <h2 className="flex items-center gap-2 px-2 text-base font-bold text-foreground mb-2">
                        <FwPfLogo className="h-6" /> Fairwinds / PF
                    </h2>
                    <div className="space-y-1">
                        {fwSubSections.productManagement.items.length > 0 && (
                            <CollapsibleHeader title={fwSubSections.productManagement.title} isOpen={openSections['fairwinds-product']} onToggle={() => toggleSection('fairwinds-product')}>
                                {fwSubSections.productManagement.items.map(item => <NavLink key={item.key} tab={item.key} icon={item.icon} businessUnit="fairwinds">{item.title}</NavLink>)}
                            </CollapsibleHeader>
                        )}
                        {fwSubSections.orders.items.length > 0 && (
                             <CollapsibleHeader title={fwSubSections.orders.title} isOpen={openSections['fairwinds-orders']} onToggle={() => toggleSection('fairwinds-orders')}>
                                {fwSubSections.orders.items.map(item => <NavLink key={item.key} tab={item.key} icon={item.icon} businessUnit="fairwinds" count={item.count}>{item.title}</NavLink>)}
                                {permissions.ordersVmi.edit && <ActionLink action={() => { onSwitchToVMI(); setIsSidebarOpen(false); }} icon={<PlusCircle className="w-4 h-4 mr-2"/>}>Create VMI</ActionLink>}
                            </CollapsibleHeader>
                        )}
                    </div>
                </div>
                
                {/* Sunshine Section */}
                <div className="p-4 border-b border-border">
                     <h2 className="flex items-center gap-2 px-2 text-base font-bold text-foreground mb-2">
                        <SunshineLogo className="h-6" /> Sunshine
                    </h2>
                    <div className="space-y-1">
                        {sunSubSections.productManagement.items.length > 0 && (
                            <CollapsibleHeader title={sunSubSections.productManagement.title} isOpen={openSections['sunshine-product']} onToggle={() => toggleSection('sunshine-product')}>
                                {sunSubSections.productManagement.items.map(item => <NavLink key={item.key} tab={item.key} icon={item.icon} businessUnit="sunshine">{item.title}</NavLink>)}
                            </CollapsibleHeader>
                        )}
                        {sunSubSections.orders.items.length > 0 && (
                             <CollapsibleHeader title={sunSubSections.orders.title} isOpen={openSections['sunshine-orders']} onToggle={() => toggleSection('sunshine-orders')}>
                                {sunSubSections.orders.items.map(item => <NavLink key={item.key} tab={item.key} icon={item.icon} businessUnit="sunshine" count={item.count}>{item.title}</NavLink>)}
                                 {permissions.ordersVmi.edit && <ActionLink action={() => { onSwitchToVMI(); setIsSidebarOpen(false); }} icon={<PlusCircle className="w-4 h-4 mr-2"/>}>Create VMI</ActionLink>}
                            </CollapsibleHeader>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
    
    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 bg-card border-r border-border flex-shrink-0">
                <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
                    {navContent}
                </div>
            </aside>
            
            {/* Mobile Sidebar (Off-canvas) */}
            <div className="md:hidden">
                {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/30 z-30"></div>}
                <aside className={`fixed inset-y-0 left-0 w-64 bg-card border-r border-border z-40 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="h-full overflow-y-auto pt-16">
                        {navContent}
                    </div>
                </aside>
            </div>
        </>
    );
};