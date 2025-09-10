import React, { useMemo } from 'react';
import type { MobileNavItem } from '../../../types';
import { Card, Input, Button } from '../../ui';
import { ManagerHeader } from '../ManagerHeader';
import { Smartphone, GripVertical, Eye, EyeOff, Info } from 'lucide-react';

const NavItem = ({ item, onLabelChange, onVisibilityToggle, canEdit }: { item: MobileNavItem, onLabelChange: (id: MobileNavItem['id'], newLabel: string) => void, onVisibilityToggle: () => void, canEdit: boolean }) => (
    <div className="flex items-center justify-between p-2 rounded-md bg-white border">
        <div className="flex items-center flex-grow gap-2">
            <GripVertical className={`w-5 h-5 flex-shrink-0 ${canEdit ? 'text-gray-400 cursor-grab' : 'text-gray-200'}`} />
            <Input 
                value={item.label} 
                onChange={e => onLabelChange(item.id, e.target.value)} 
                className="h-8 border-none focus:ring-1 focus:ring-blue-500 bg-transparent p-1"
                disabled={!canEdit}
            />
        </div>
        {canEdit && (
            <Button onClick={onVisibilityToggle} variant="ghost" size="icon" className="flex-shrink-0">
                {item.isVisible ? <EyeOff size={16} className="text-gray-500" /> : <Eye size={16} className="text-gray-500" />}
            </Button>
        )}
    </div>
);


export const MobileNavManager = ({ mobileNavConfig, setMobileNavConfig, showMessage, permissions }: { mobileNavConfig: MobileNavItem[], setMobileNavConfig: (config: MobileNavItem[]) => void, showMessage: (message: string) => void, permissions: { view: boolean, edit: boolean } }) => {
    
    const visibleItems = useMemo(() => mobileNavConfig.filter(i => i.isVisible).sort((a, b) => a.order - b.order), [mobileNavConfig]);
    const hiddenItems = useMemo(() => mobileNavConfig.filter(i => !i.isVisible).sort((a, b) => a.order - b.order), [mobileNavConfig]);

    const handleLabelChange = (id: MobileNavItem['id'], newLabel: string) => {
        setMobileNavConfig(mobileNavConfig.map(item => item.id === id ? { ...item, label: newLabel } : item));
    };

    const handleVisibilityToggle = (itemToToggle: MobileNavItem) => {
        if (itemToToggle.isVisible) { // Toggling from visible to hidden
            const newConfig = mobileNavConfig.map(item => item.id === itemToToggle.id ? { ...item, isVisible: false } : item);
            setMobileNavConfig(newConfig);
        } else { // Toggling from hidden to visible
            if (visibleItems.length < 4) {
                const newConfig = mobileNavConfig.map(item => item.id === itemToToggle.id ? { ...item, isVisible: true } : item);
                setMobileNavConfig(newConfig);
            } else {
                showMessage("You can only have a maximum of 4 visible items in the bottom navigation.");
            }
        }
    };
    
    const dragItem = React.useRef<any>(null);
    const dragOverItem = React.useRef<any>(null);

    const handleSort = () => {
        let _mobileNavConfig = [...mobileNavConfig];
        if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) {
            dragItem.current = null;
            dragOverItem.current = null;
            return;
        }
        const draggedItemContent = _mobileNavConfig.splice(dragItem.current, 1)[0];
        _mobileNavConfig.splice(dragOverItem.current, 0, draggedItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        setMobileNavConfig(_mobileNavConfig.map((item, index) => ({ ...item, order: index })));
    };

    return (
        <div>
            <ManagerHeader title="Mobile Navigation" icon={<Smartphone className="w-8 h-8 mr-3 text-gray-800" />} />
            <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
                <div className="flex items-start gap-3">
                    <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">
                        Customize the bottom navigation bar for mobile devices. {permissions.edit && 'Drag and drop items to reorder them. Use the eye icon to move items between the "Visible" and "Hidden" sections.'} You can display a maximum of 4 icons; others will appear in the "More" menu.
                    </p>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-4">
                    <h3 className="font-semibold mb-3">Visible in Bottom Bar ({visibleItems.length}/4)</h3>
                    <div className="space-y-2">
                        {visibleItems.map(item => {
                            const globalIndex = mobileNavConfig.findIndex(i => i.id === item.id);
                            return (
                                <div
                                    key={item.id}
                                    draggable={permissions.edit}
                                    onDragStart={() => (dragItem.current = globalIndex)}
                                    onDragEnter={() => (dragOverItem.current = globalIndex)}
                                    onDragEnd={handleSort}
                                    onDragOver={(e) => e.preventDefault()}
                                >
                                    <NavItem item={item} onLabelChange={handleLabelChange} onVisibilityToggle={() => handleVisibilityToggle(item)} canEdit={permissions.edit} />
                                </div>
                            );
                        })}
                         {visibleItems.length === 0 && <p className="text-center text-gray-400 py-4">No visible items.</p>}
                    </div>
                </Card>
                <Card className="p-4">
                    <h3 className="font-semibold mb-3">Hidden in "More" Menu</h3>
                    <div className="space-y-2">
                        {hiddenItems.map(item => {
                            const globalIndex = mobileNavConfig.findIndex(i => i.id === item.id);
                             return (
                                <div
                                    key={item.id}
                                    draggable={permissions.edit}
                                    onDragStart={() => (dragItem.current = globalIndex)}
                                    onDragEnter={() => (dragOverItem.current = globalIndex)}
                                    onDragEnd={handleSort}
                                    onDragOver={(e) => e.preventDefault()}
                                >
                                    <NavItem item={item} onLabelChange={handleLabelChange} onVisibilityToggle={() => handleVisibilityToggle(item)} canEdit={permissions.edit} />
                                </div>
                            );
                        })}
                        {hiddenItems.length === 0 && <p className="text-center text-gray-400 py-4">No hidden items.</p>}
                    </div>
                </Card>
            </div>
        </div>
    );
};