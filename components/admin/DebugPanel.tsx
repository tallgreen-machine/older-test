import React, { useState } from 'react';
import { Bug, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '../ui';

interface DebugPanelProps {
  data: object;
  onClose: () => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ data, onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 w-full max-w-lg bg-card border border-border rounded-lg shadow-2xl z-[100] animate-fade-in-up">
      <header className="flex items-center justify-between p-2 border-b bg-muted/50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Bug className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Debug: Application State</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>
      </header>
      {!isCollapsed && (
        <div className="max-h-96 overflow-auto p-3">
          <pre className="text-xs bg-background p-2 rounded-md">
            <code>
              {JSON.stringify(data, null, 2)}
            </code>
          </pre>
        </div>
      )}
    </div>
  );
};
