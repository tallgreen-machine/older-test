import React from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from '../ui';

export const PublicMenuHeader = ({
    currentBrand,
    onBrandToggle,
    isAdminLoggedIn,
    onSwitchView,
    onLoginClick
}: {
    currentBrand: 'fairwinds' | 'sunshine-pf',
    onBrandToggle: (brand: 'fairwinds' | 'sunshine-pf') => void,
    isAdminLoggedIn?: boolean,
    onSwitchView?: () => void,
    onLoginClick?: () => void
}) => {
    return (
        <header className="py-3 sticky top-0 z-30 bg-white border-b">
            <div className="flex justify-between items-center px-6 md:px-8">
                {/* Brand Toggle */}
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => onBrandToggle('fairwinds')}
                        variant={currentBrand === 'fairwinds' ? 'default' : 'outline'}
                    >
                        Fairwinds
                    </Button>
                     <Button
                        onClick={() => onBrandToggle('sunshine-pf')}
                        variant={currentBrand === 'sunshine-pf' ? 'default' : 'outline'}
                    >
                        Sunshine
                    </Button>
                </div>

                {/* Admin Button */}
                <div className="flex items-center gap-2">
                    {isAdminLoggedIn ? (
                        <Button onClick={onSwitchView} variant="outline" className="bg-white hover:bg-gray-200"><ShieldCheck className="w-4 h-4 mr-2"/> Back to Admin</Button>
                    ) : (
                        onLoginClick && <Button onClick={onLoginClick} variant="outline" className="bg-white hover:bg-gray-200"><ShieldCheck className="w-4 h-4 mr-2"/> Admin</Button>
                    )}
                </div>
            </div>
        </header>
    );
};
