import React, { useState } from 'react';
import { Tag, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import type { AlertBanner, BusinessUnit } from '../../../types';
import { Button, Card, ConfirmationModal, PrimaryButton } from '../../ui';
import { EditAlertBannerModal, AddAlertBannerModal } from '../../forms';
import { ManagerHeader } from '../ManagerHeader';
import { useAppContext } from '../../../contexts/AppContext';

export const AlertBannersManager = ({ alertBanners, setAlertBanners, permissions, activeBusinessUnit }: { alertBanners: AlertBanner[], setAlertBanners: React.Dispatch<React.SetStateAction<AlertBanner[]>>, permissions: { view: boolean; edit: boolean; create: boolean; delete: boolean; }, activeBusinessUnit: BusinessUnit }) => {
    const { handleAddAlertBanner, handleSaveAlertBanner, handleDeleteAlertBanner } = useAppContext();
    const [editingBanner, setEditingBanner] = useState<AlertBanner | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [bannerToDelete, setBannerToDelete] = useState<AlertBanner | null>(null);
    
    const handleBannerSave = (updates: Partial<AlertBanner>) => {
        if (editingBanner) {
            handleSaveAlertBanner({ ...editingBanner, ...updates });
            setEditingBanner(null);
        }
    };
    
    const handleBannerAdd = (newBannerData: Omit<AlertBanner, 'id' | 'businessUnit'>) => {
        handleAddAlertBanner({ ...newBannerData, businessUnit: activeBusinessUnit });
        setShowAddModal(false);
    };

    const confirmDelete = () => {
        if (bannerToDelete) {
            handleDeleteAlertBanner(bannerToDelete.id);
            setBannerToDelete(null);
        }
    };

    return (
        <div>
            <ManagerHeader title="Alert Banners" icon={<Tag className="w-8 h-8 mr-3 text-foreground" />}>
                {permissions.create && (
                    <PrimaryButton onClick={() => setShowAddModal(true)}>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add Banner
                    </PrimaryButton>
                )}
            </ManagerHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {alertBanners.map(banner => (
                    <Card key={banner.id} className="p-4 relative flex flex-col justify-between" style={{ borderLeft: `4px solid ${banner.color}`}}>
                        <div>
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg text-foreground pr-20">{banner.text}</h3>
                                <div className="absolute top-2 right-2 flex gap-1">
                                    {permissions.edit && <Button variant="ghost" onClick={() => setEditingBanner(banner)} className="p-2 h-auto"><Pencil className="w-4 h-4" /></Button>}
                                    {permissions.delete && <Button variant="ghost" onClick={() => setBannerToDelete(banner)} className="p-2 h-auto text-red-600 hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: banner.color }}></div>
                                <span>{banner.color}</span>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-border">
                            <p className="text-xs text-muted-foreground mb-2">Preview</p>
                            <div className="relative h-24 bg-muted rounded-md overflow-hidden flex items-center justify-center text-xs text-muted-foreground">
                                Example Product
                                <div className="absolute top-0 left-0 w-20 h-20 overflow-hidden" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.15))' }}>
                                  <div className="absolute transform -rotate-45 text-center text-white font-semibold py-0.5 text-xs" style={{ backgroundColor: banner.color, left: '-26px', top: '18px', width: '100px' }}>
                                    {banner.text}
                                  </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
            {editingBanner && <EditAlertBannerModal banner={editingBanner} onSave={handleBannerSave} onClose={() => setEditingBanner(null)} />}
            {showAddModal && <AddAlertBannerModal onClose={() => setShowAddModal(false)} onSave={handleBannerAdd} />}
            <ConfirmationModal
                isOpen={!!bannerToDelete}
                onClose={() => setBannerToDelete(null)}
                onConfirm={confirmDelete}
                title="Confirm Banner Deletion"
                message={`Are you sure you want to delete the "${bannerToDelete?.text}" banner? This action cannot be undone.`}
            />
        </div>
    );
};