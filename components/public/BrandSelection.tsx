import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Button } from '../ui';
import { SunshineLogo } from '../brands/sunshine/SunshineLogo';
import { FwPfLogo } from '../brands/fwpf/FwPfLogo';
import { useAppContext } from '../../contexts/AppContext';

export const BrandSelection: React.FC = () => {
    const { setSelectedPublicBrand, setShowLogin } = useAppContext();
    const onSelectBrand = (brand: 'fairwinds' | 'sunshine-pf') => setSelectedPublicBrand(brand);
    const onAdminClick = () => setShowLogin(true);
    
    const BrandSelector = ({ brand, LogoComponent }: { brand: 'fairwinds' | 'sunshine-pf', LogoComponent: React.ElementType }) => (
        <div 
            onClick={() => onSelectBrand(brand)}
            className="group flex flex-col items-center cursor-pointer"
        >
            <LogoComponent className="h-32 md:h-48 transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-lg filter grayscale group-hover:grayscale-0" />
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <nav className="py-3 sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border">
                <div className="flex justify-end items-center px-6 md:px-8">
                    <Button onClick={onAdminClick} variant="outline" className="bg-card hover:bg-accent">
                        <ShieldCheck className="w-4 h-4 mr-2"/> Admin
                    </Button>
                </div>
            </nav>

            <main className="container mx-auto px-4 flex-grow flex flex-col items-center justify-center z-10">
                 <div className="text-center mb-16">
                    <h1 className="text-8xl font-bold text-foreground tracking-tighter">Welcome.</h1>
                    <p className="text-lg text-muted-foreground mt-2">Please select a brand menu to continue.</p>
                </div>
                <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-16">
                    <BrandSelector brand="fairwinds" LogoComponent={FwPfLogo} />
                    <BrandSelector brand="sunshine-pf" LogoComponent={SunshineLogo} />
                </div>
            </main>
             <footer className="text-center p-4 text-muted-foreground text-sm z-10">
                Select a brand to view products and place an order.
            </footer>
        </div>
    );
};