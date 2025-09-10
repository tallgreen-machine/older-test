import React from 'react';
import type { ScrapeLogEntry } from '../../../types';
// FIX: Changed import from Modal to StyledModal as Modal is not exported from ui.
import { StyledModal, PrimaryButton } from '../../ui';

export const DataScrapeLogModal = ({ isOpen, onClose, log }: { isOpen: boolean, onClose: () => void, log: ScrapeLogEntry[] }) => {
    if (!isOpen) return null;
    return (
        // FIX: Changed Modal to StyledModal to match the component exported from ui.
        <StyledModal title="Data Scrape Log" onClose={onClose}>
            <div className="max-h-96 overflow-y-auto pr-2">
                <div className="space-y-4">
                    {log.map((entry, index) => (
                        <div key={index} className="pb-4 border-b border-border last:border-b-0">
                            <p className="font-semibold text-sm text-foreground">{new Date(entry.timestamp).toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground mt-1">{entry.summary}</p>
                        </div>
                    ))}
                    {log.length === 0 && <p className="text-center text-muted-foreground">No log entries yet.</p>}
                </div>
            </div>
            <div className="mt-6 flex justify-end">
                <PrimaryButton onClick={onClose}>Close</PrimaryButton>
            </div>
        </StyledModal>
    );
};