import React from 'react';
import { Card, Button } from '../ui';
import { Eye, LogOut, Package } from 'lucide-react';
import type { MobileNavItem } from '../../types';
import { iconMap } from './icons';

export const MoreMenuModal = ({ onClose, onLogout, onSwitchView, handleMobileNavClick, hiddenItems }: {
    onClose: () => void,
    onLogout: () => void,
    onSwitchView: () => void,
    handleMobileNavClick: (tabId: MobileNavItem['id']) => void,
    hiddenItems: MobileNavItem[]
}) => {
    
    const handleNavigation = (tabId: MobileNavItem['id']) => {
        handleMobileNavClick(tabId);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-end md:hidden">
            <Card className="w-full rounded-t-lg rounded-b-none p-4 animate-fade-in-up">
                <div className="grid grid-cols-4 gap-2">
                    {hiddenItems.map(item => {
                        const Icon = iconMap[item.icon] || <Package />;
                        return (
                            <Button key={item.id} onClick={() => handleNavigation(item.id)} variant="outline" className="flex-col h-20 text-muted-foreground text-xs p-1">
                               {React.cloneElement(Icon, { className: "mx-auto w-6 h-6"})}
                                <span className="mt-1">{item.label}</span>
                            </Button>
                        );
                    })}
                     <Button onClick={() => { onSwitchView(); onClose(); }} variant="outline" className="flex-col h-20 text-muted-foreground text-xs p-1">
                        <Eye className="mx-auto w-6 h-6"/>
                        <span className="mt-1">Reg. Menu</span>
                    </Button>
                     <Button onClick={() => { onLogout(); onClose(); }} variant="outline" className="flex-col h-20 text-red-600 text-xs p-1">
                        <LogOut className="mx-auto w-6 h-6"/>
                        <span className="mt-1">Logout</span>
                    </Button>
                </div>
                <Button onClick={onClose} className="w-full mt-4" variant="outline">Close</Button>
            </Card>
        </div>
    );
};
