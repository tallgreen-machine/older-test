import React, { useState } from "react";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import type { Dispensary } from '../../types';
import { Button, Card, Input, PrimaryButton } from '../ui';

export const LicenseValidation = ({ dispensaries, onValidate, onBack, onAdminClick, isAdminLoggedIn, onSwitchView }: { dispensaries: Dispensary[], onValidate: (dispensary: Dispensary) => void, onBack: () => void, onAdminClick: () => void, isAdminLoggedIn: boolean, onSwitchView: () => void }) => {
	const [licenseError, setLicenseError] = useState<string | null>(null);
	const [licenseInput, setLicenseInput] = useState("");

    const handleLicenseSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const foundDispensary = dispensaries.find(d => d.licenseNumber === licenseInput);
		if (foundDispensary) {
			onValidate(foundDispensary);
			setLicenseError(null);
		} else {
			setLicenseError("Invalid License Number. Please try again.");
		}
	};

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <nav className="py-3 sticky top-0 z-10 bg-card border-b border-border">
                <div className="flex justify-between items-center px-6 md:px-8">
                    <Button onClick={onBack} variant="outline" className="bg-card hover:bg-accent">
                        <ArrowLeft className="w-4 h-4 mr-2"/> Back to Brand Selection
                    </Button>
                    {isAdminLoggedIn ? (
                        <Button onClick={onSwitchView} variant="outline" className="bg-card hover:bg-accent"><ShieldCheck className="w-4 h-4 mr-2"/> Back to Admin</Button>
                    ) : (
                        <Button onClick={onAdminClick} variant="outline" className="bg-card hover:bg-accent"><ShieldCheck className="w-4 h-4 mr-2"/> Admin</Button>
                    )}
                </div>
            </nav>
            <main className="container mx-auto px-4 flex-grow flex flex-col items-center justify-center">
                <Card className="w-full max-w-md p-8 text-center animate-fade-in-up">
                    <h1 className="text-2xl font-bold mb-2">Dispensary Validation</h1>
                    <p className="text-muted-foreground mb-6">Please enter your dispensary license number to continue.</p>
                    <form onSubmit={handleLicenseSubmit} className="flex flex-col gap-4">
                        <Input
                            type="text"
                            placeholder="License Number"
                            value={licenseInput}
                            onChange={(e) => setLicenseInput(e.target.value)}
                            className="text-center"
                            required
                        />
                        {licenseError && <p className="text-red-500 text-sm">{licenseError}</p>}
                        <PrimaryButton type="submit">Validate License</PrimaryButton>
                    </form>
                </Card>
            </main>
        </div>
    );
};