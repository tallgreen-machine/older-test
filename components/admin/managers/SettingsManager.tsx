
import React from 'react';
import { Settings } from 'lucide-react';
import { Card } from '../../ui';
import { ManagerHeader } from '../ManagerHeader';

export const SettingsManager = () => {
    return (
        <div>
            <ManagerHeader title="Settings" icon={<Settings className="w-8 h-8 mr-3 text-gray-800" />} />
            <Card className="p-6 text-center text-gray-500">
                This section is currently empty.
            </Card>
        </div>
    );
};
