import React, { useState } from 'react';
import { StyledModal, Input, Button, PrimaryButton, FormField } from '../ui';
import type { AlertBanner } from '../../types';

export const AlertBannerEditForm = ({ banner, onSave, onCancel }: { banner: AlertBanner, onSave: (updates: Partial<AlertBanner>) => void, onCancel: () => void }) => {
    const [text, setText] = useState(banner.text);
    const [color, setColor] = useState(banner.color);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ text, color });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Banner Text">
                    <Input value={text} onChange={e => setText(e.target.value)} required />
                </FormField>
                <FormField label="Banner Color">
                    <Input type="color" value={color} onChange={e => setColor(e.target.value)} required className="h-10 p-1"/>
                </FormField>
            </div>
            <div className="flex gap-2 justify-end pt-4">
                <Button type="button" onClick={onCancel} variant="outline">Cancel</Button>
                <PrimaryButton type="submit">Save</PrimaryButton>
            </div>
        </form>
    );
};

export const EditAlertBannerModal = ({ banner, onSave, onClose }: { banner: AlertBanner, onSave: (updates: Partial<AlertBanner>) => void, onClose: () => void }) => (
    <StyledModal 
        title="Edit Alert Banner" 
        onClose={onClose}
        footer={
            <div className="flex gap-2 justify-end">
                <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
                <PrimaryButton type="submit" form="edit-alert-form">Save Changes</PrimaryButton>
            </div>
        }
    >
        <form id="edit-alert-form" onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const data = Object.fromEntries(formData.entries());
            onSave(data as Partial<AlertBanner>);
        }} className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Banner Text">
                    <Input name="text" defaultValue={banner.text} required />
                </FormField>
                <FormField label="Banner Color">
                    <Input name="color" type="color" defaultValue={banner.color} required className="h-10 p-1"/>
                </FormField>
            </div>
        </form>
    </StyledModal>
);

// FIX: Changed onSave prop type to not expect businessUnit, which is handled by the parent component.
export const AlertBannerAddForm = ({ onSave, onCancel }: { onSave: (data: Omit<AlertBanner, 'id' | 'businessUnit'>) => void, onCancel: () => void }) => {
    const [text, setText] = useState('');
    const [color, setColor] = useState('#ef4444');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ text, color });
    };

    return (
        <form onSubmit={handleSubmit} id="add-alert-form" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField label="Banner Text">
                    <Input value={text} onChange={e => setText(e.target.value)} required />
                </FormField>
                <FormField label="Banner Color">
                    <Input type="color" value={color} onChange={e => setColor(e.target.value)} required className="h-10 p-1"/>
                </FormField>
            </div>
        </form>
    );
};

// FIX: Changed onSave prop type to not expect businessUnit, which is handled by the parent component.
export const AddAlertBannerModal = ({ onSave, onClose }: { onSave: (data: Omit<AlertBanner, 'id' | 'businessUnit'>) => void, onClose: () => void }) => (
    <StyledModal 
        title="Add New Alert Banner" 
        onClose={onClose}
        footer={
            <div className="flex justify-end gap-2">
                <Button onClick={onClose} variant="outline">Cancel</Button>
                <PrimaryButton type="submit" form="add-alert-form">Add Banner</PrimaryButton>
            </div>
        }
    >
        <AlertBannerAddForm onSave={onSave} onCancel={onClose} />
    </StyledModal>
);