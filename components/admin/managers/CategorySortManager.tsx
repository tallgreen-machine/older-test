import React, { useRef } from 'react';
import { ListOrdered, GripVertical, Info } from 'lucide-react';
import type { CategorySort, BusinessUnit } from '../../../types';
import { Card } from '../../ui';
import { ManagerHeader } from '../ManagerHeader';

export const CategorySortManager = ({ categorySortOrder, setCategorySortOrder, permissions, activeBusinessUnit }: { categorySortOrder: CategorySort[], setCategorySortOrder: (newOrder: CategorySort[]) => void, permissions: { view: boolean; edit: boolean; }, activeBusinessUnit: BusinessUnit }) => {
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);
    const brandName = activeBusinessUnit === 'sunshine' ? 'Sunshine' : 'Fairwinds / PF';

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        if (!permissions.edit) return;
        dragItem.current = index;
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        if (!permissions.edit) return;
        e.preventDefault();
        dragOverItem.current = index;
    };
    
    const handleDragEnd = () => {
        if (!permissions.edit) return;
        if (dragItem.current !== null && dragOverItem.current !== null) {
            const newSortOrder = [...categorySortOrder];
            const draggedItemContent = newSortOrder.splice(dragItem.current, 1)[0];
            newSortOrder.splice(dragOverItem.current, 0, draggedItemContent);
            setCategorySortOrder(newSortOrder.map((cat, i) => ({ ...cat, order: i + 1 })));
        }
        dragItem.current = null;
        dragOverItem.current = null;
    };
    
    return (
        <div>
            <ManagerHeader title={`${brandName} Category Sort Order`} icon={<ListOrdered className="w-8 h-8 mr-3 text-foreground" />} />
             <Card className="p-4 mb-6 bg-blue-500/10 border-blue-500/20">
                <div className="flex items-start gap-3">
                    <Info size={20} className="text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                        {permissions.edit 
                            ? "Drag and drop the categories below to set their display order on the public menu. The order is saved automatically." 
                            : "This is the current category display order. You do not have permission to change it."
                        }
                    </p>
                </div>
            </Card>
            <Card className="p-4">
                 <div className="space-y-2">
                    {categorySortOrder.map((cat, index) => (
                        <div 
                            key={cat.name} 
                            className={`flex items-center justify-between p-3 rounded-md bg-background border border-border ${permissions.edit ? 'hover:bg-accent cursor-grab active:cursor-grabbing' : ''}`}
                            draggable={permissions.edit}
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnter={(e) => handleDragEnter(e, index)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            <div className="flex items-center">
                                <GripVertical className={`w-5 h-5 mr-3 ${permissions.edit ? 'text-muted-foreground' : 'text-muted-foreground/30'}`} />
                                <p className="font-medium">{cat.name}</p>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Position {index + 1}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};