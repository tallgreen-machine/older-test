import React, { useState, useMemo } from 'react';
import { RefreshCw, Sparkles, History, Search, Info, ChevronDown } from 'lucide-react';
import type { ScrapedInventoryItem, ScrapeLogEntry, BusinessUnit } from '../../../types';
import { Button, Card, Input, PrimaryButton, Select } from '../../ui';
import { ManagerHeader, getSortIcon } from '../ManagerHeader';
import { DataScrapeLogModal } from './DataScrapeLogModal';
import { useDataProcessor } from '../../../hooks/useDataProcessor';
import { safeFormatDate } from "../../../utils";


export const InventorySyncManager = ({
    scrapedInventory,
    inventoryThreshold,
    setInventoryThreshold,
    onSimulateScrape,
    onViewLog,
    lastScrapeTimestamp,
    permissions,
    activeBusinessUnit
}: {
    scrapedInventory: ScrapedInventoryItem[],
    inventoryThreshold: number,
    setInventoryThreshold: (value: number) => void,
    onSimulateScrape: () => void,
    onViewLog: () => void,
    lastScrapeTimestamp?: string,
    permissions: { view: boolean; edit: boolean; },
    activeBusinessUnit: BusinessUnit
}) => {
    const [sortConfig, setSortConfig] = useState<{ key: keyof ScrapedInventoryItem, direction: 'ascending' | 'descending' }>({ key: 'productName', direction: 'ascending' });
    const [searchTerm, setSearchTerm] = useState('');
    // FIX: Changed state type from `string` to a more specific `'None' | keyof ScrapedInventoryItem` to satisfy the `useDataProcessor` hook's expected type for `groupKey`.
    const [groupKey, setGroupKey] = useState<'None' | keyof ScrapedInventoryItem>('status');
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const brandName = activeBusinessUnit === 'sunshine' ? 'Sunshine' : 'Fairwinds / PF';

    const processedInventory = useDataProcessor<ScrapedInventoryItem>({
        data: scrapedInventory,
        searchTerm,
        searchKeys: ['productName', 'sku'],
        sortConfig,
        groupKey
    });

    const requestSort = (key: keyof ScrapedInventoryItem) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const groupOptions = [
        { value: 'None', label: 'None' },
        { value: 'status', label: 'Status' },
    ];

    const getGroupBubbleClass = (groupTitle: string) => {
        const baseClasses = "inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full border";
        switch (groupTitle.toLowerCase()) {
            case 'active':
                return `${baseClasses} bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/50`;
            case 'inactive':
                return `${baseClasses} bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/50`;
            default:
                return `${baseClasses} bg-secondary text-secondary-foreground border-border`;
        }
    };

    return (
        <div>
            <ManagerHeader title={`${brandName} Inventory Sync`} icon={<RefreshCw className="w-8 h-8 mr-3 text-foreground" />} >
                {permissions.edit && <Button onClick={onSimulateScrape} variant="outline"><Sparkles className="w-4 h-4 mr-2" /> Simulate Scrape</Button>}
                <Button onClick={onViewLog} variant="outline"><History className="w-4 h-4 mr-2" /> View Log</Button>
            </ManagerHeader>

            <Card className="p-4 bg-yellow-500/10 border-yellow-500/20 mb-6">
                <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
                    <div className="flex items-center gap-3 shrink-0">
                        <Info size={20} className="text-yellow-600 dark:text-yellow-400"/>
                        <h3 className="font-semibold text-yellow-900 dark:text-yellow-200">Sync Status</h3>
                    </div>
                    <div className="flex items-center gap-x-4 gap-y-2 flex-wrap text-sm text-yellow-800 dark:text-yellow-300">
                        <span className="md:border-l border-yellow-400/50 md:pl-4">Last scrape: {safeFormatDate(lastScrapeTimestamp, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        <span>{scrapedInventory.length} items synced.</span>
                    </div>
                </div>
            </Card>
            
            <Card className="p-4 mb-6">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground block mb-1">Inventory Threshold</label>
                        <p className="text-xs text-muted-foreground mb-1">Stock below this number will be hidden from the menu</p>
                        <Input type="number" value={inventoryThreshold} onChange={(e) => setInventoryThreshold(Number(e.target.value))} disabled={!permissions.edit} />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground block mb-1">Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input type="text" placeholder="Search by name or SKU..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10"/>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground block mb-1">Group By</label>
                        <Select value={groupKey} onChange={e => setGroupKey(e.target.value as 'None' | keyof ScrapedInventoryItem)}>
                            {groupOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </Select>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="px-6 py-3 text-left hidden md:table-cell"><button onClick={() => requestSort('sku')} className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase">SKU {getSortIcon('sku', sortConfig as any)}</button></th>
                                <th className="px-6 py-3 text-left"><button onClick={() => requestSort('productName')} className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase">PRODUCT NAME {getSortIcon('productName', sortConfig as any)}</button></th>
                                <th className="px-6 py-3 text-center hidden md:table-cell"><button onClick={() => requestSort('unitsForSale')} className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase">UNITS FOR SALE {getSortIcon('unitsForSale', sortConfig as any)}</button></th>
                                <th className="px-6 py-3 text-center hidden md:table-cell"><button onClick={() => requestSort('allocations')} className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase">ALLOCATIONS {getSortIcon('allocations', sortConfig as any)}</button></th>
                                <th className="px-6 py-3 text-left"><button onClick={() => requestSort('status')} className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase">STATUS {getSortIcon('status', sortConfig as any)}</button></th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase md:hidden"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                            {processedInventory.map(group => (
                                <React.Fragment key={group.groupTitle}>
                                     {groupKey !== "None" && (
                                        <tr className="bg-accent/50">
                                            <th colSpan={6} className="px-4 py-2 text-left">
                                                <span className={getGroupBubbleClass(group.groupTitle)}>
                                                    {group.groupTitle}
                                                    <span className="font-normal ml-2">({group.count})</span>
                                                </span>
                                            </th>
                                        </tr>
                                    )}
                                    {group.items.map(item => {
                                        const isExpanded = expandedRow === item.sku;
                                        return (
                                        <React.Fragment key={item.sku}>
                                            <tr className="hover:bg-accent/50">
                                                <td className="px-6 py-4 whitespace-nowrap text-muted-foreground hidden md:table-cell">{item.sku}</td>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">{item.productName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-muted-foreground hidden md:table-cell">{item.unitsForSale}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-muted-foreground hidden md:table-cell">{item.allocations}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : item.status === 'inactive' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' : 'bg-secondary text-secondary-foreground'}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap md:hidden">
                                                    <Button variant="ghost" size="icon" onClick={() => setExpandedRow(isExpanded ? null : item.sku)}>
                                                        <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                    </Button>
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr className="md:hidden">
                                                    <td colSpan={6} className="p-4 bg-accent/50">
                                                        <div className="space-y-2 text-sm text-muted-foreground">
                                                            <p><strong className="text-foreground block">SKU:</strong> {item.sku}</p>
                                                            <p><strong className="text-foreground block">Units for Sale:</strong> {item.unitsForSale}</p>
                                                            <p><strong className="text-foreground block">Allocations:</strong> {item.allocations}</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    )})}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};