
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

export const ManagerHeader = ({ title, icon, children }: { title: string, icon: React.ReactNode, children?: React.ReactNode }) => (
    <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            {icon}
            {title}
        </h1>
        <div className="mt-4 md:mt-0 flex items-center gap-2">
            {children}
        </div>
    </div>
);

export const getSortIcon = (key: string, sortConfig: { key: string, direction: string } | null) => {
    if (!sortConfig || sortConfig.key !== key) {
        return <ArrowUp size={14} className="text-gray-300" />;
    }
    if (sortConfig.direction === 'ascending') {
        return <ArrowUp size={14} className="text-gray-800" />;
    }
    return <ArrowDown size={14} className="text-gray-800" />;
};
