import React from "react";
import { AppProvider, useAppContext } from './contexts/AppContext';
import { AdminView } from './components/admin/AdminView';
import { PublicView } from './components/public/PublicView';
import { VMIMenu } from './components/vmi/VMIMenu';
import { BrandSelection } from './components/public/BrandSelection';
import { LoginModal, MessageBox } from './components/ui';

const AppContent = () => {
    const {
        view,
        currentUser,
        selectedPublicBrand,
        showLogin,
        setShowLogin,
        messageBox,
        hideMessage,
        isLoading,
    } = useAppContext();

    const renderCurrentView = () => {
        switch (view) {
            case 'admin':
                if (!currentUser) return <BrandSelection />;
                return <AdminView />;
            case 'vmi':
                if (!currentUser) return <BrandSelection />;
                return <VMIMenu />;
            case 'public':
            default:
                if (!selectedPublicBrand) {
                    return <BrandSelection />;
                }
                return <PublicView />;
        }
    };

    return (
        <div className="h-full text-foreground antialiased">
            {isLoading && <div className="fixed inset-0 bg-black bg-opacity-50 z-[101] flex items-center justify-center"><div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div></div>}
            {renderCurrentView()}
            {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
            {messageBox.visible && <MessageBox message={messageBox.message} onClose={hideMessage} />}
        </div>
    );
};

export default function App() {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
}