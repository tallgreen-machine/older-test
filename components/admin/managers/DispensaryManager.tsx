
import React, { useState, useMemo } from 'react';
import { Store, Pencil, Trash2, Download, Upload, PlusCircle, Search, MapPin, Mail, FileText, User, ChevronDown } from 'lucide-react';
import type { Dispensary } from '../../../types';
import { Button, Card, Input, Select, ConfirmationModal, PrimaryButton } from '../../ui';
import { EditDispensaryModal } from '../../forms';
import { ManagerHeader, getSortIcon } from '../ManagerHeader';
import { useDataProcessor } from '../../../hooks/useDataProcessor';

export const DispensaryManager = ({ dispensaries, onSave, onDelete, handleDownload, handleUploadClick, setShowAddDispensaryModal, permissions }: { dispensaries: Dispensary[], onSave: (dispensary: Dispensary) => void, onDelete: (dispensaryId: string) => void, handleDownload: (type: 'products' | 'dispensaries') => void, handleUploadClick: (type: 'products' | 'dispensaries') => void, setShowAddDispensaryModal: (show: boolean) => void, permissions: { view: boolean, create: boolean, edit: boolean, delete: boolean } }) => {
	const [editingDispensary, setEditingDispensary] = useState<Dispensary | null>(null);
	const [dispensaryToDelete, setDispensaryToDelete] = useState<Dispensary | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'ascending' | 'descending' }>({ key: 'name', direction: 'ascending' });
    // FIX: Changed state type from `string` to a more specific `'None' | keyof Dispensary` to satisfy the `useDataProcessor` hook's expected type for `groupKey`.
    const [groupKey, setGroupKey] = useState<'None' | keyof Dispensary>("None");
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    const processedDispensaries = useDataProcessor<Dispensary>({
        data: dispensaries,
        searchTerm,
        searchKeys: ['name', 'address', 'salesRepName'],
        sortConfig,
        groupKey,
    });

	const requestSort = (key: string) => {
		let direction: 'ascending' | 'descending' = 'ascending';
		if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
			direction = 'descending';
		}
		setSortConfig({ key, direction });
	};

	const handleUpdate = (updatedDispensary: Dispensary) => {
		onSave(updatedDispensary);
		setEditingDispensary(null);
	};

	const confirmDeleteDispensary = () => {
		if (dispensaryToDelete) {
			onDelete(dispensaryToDelete.id);
			setDispensaryToDelete(null);
		}
	};

	const sortOptions = [
		{ value: 'name-ascending', label: 'Name (A-Z)' },
		{ value: 'name-descending', label: 'Name (Z-A)' },
		{ value: 'address-ascending', label: 'Address (A-Z)' },
		{ value: 'address-descending', label: 'Address (Z-A)' },
		{ value: 'salesRepName-ascending', label: 'Sales Rep (A-Z)' },
		{ value: 'salesRepName-descending', label: 'Sales Rep (Z-A)' },
	];

    const groupOptions = [
        { value: 'None', label: 'None' },
        { value: 'salesRepName', label: 'Sales Rep' },
    ];

	return (
		<div>
            <ManagerHeader title="Dispensaries" icon={<Store className="w-8 h-8 mr-3 text-foreground" />}>
                <Button onClick={() => handleDownload('dispensaries')} variant="outline"><Download className="w-4 h-4 mr-2"/> Download</Button>
                {permissions.create && <Button onClick={() => handleUploadClick('dispensaries')} variant="outline"><Upload className="w-4 h-4 mr-2"/> Upload</Button>}
                {permissions.create && <PrimaryButton onClick={() => setShowAddDispensaryModal(true)}><PlusCircle className="w-4 h-4 mr-2"/> Add Dispensary</PrimaryButton>}
            </ManagerHeader>
			
            <Card className="p-4 mb-6">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="md:col-span-1">
						<label className="text-sm font-medium text-muted-foreground block mb-1">Search Dispensaries</label>
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
							<Input type="text" placeholder="Search by name, address, or sales rep..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10"/>
						</div>
					</div>
					<div>
						<label className="text-sm font-medium text-muted-foreground block mb-1">Group by</label>
                        <Select value={groupKey} onChange={e => setGroupKey(e.target.value as 'None' | keyof Dispensary)}>
							{groupOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
						</Select>
					</div>
					<div>
						<label className="text-sm font-medium text-muted-foreground block mb-1">Sort by</label>
						<Select value={`${sortConfig.key}-${sortConfig.direction}`} onChange={e => {
							const [key, direction] = e.target.value.split('-');
							setSortConfig({ key, direction: direction as any });
						}}>
							{sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
						</Select>
					</div>
				</div>
			</Card>

			<Card>
                {/* Desktop Table */}
				<div className="hidden md:block">
					<table className="w-full text-sm">
						<thead className="bg-muted/50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"><button onClick={() => requestSort('name')} className="flex items-center gap-2">NAME {getSortIcon('name', sortConfig)}</button></th>
								<th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell"><button onClick={() => requestSort('address')} className="flex items-center gap-2">ADDRESS {getSortIcon('address', sortConfig)}</button></th>
								<th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell"><button onClick={() => requestSort('email')} className="flex items-center gap-2">CONTACT {getSortIcon('email', sortConfig)}</button></th>
								<th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell"><button onClick={() => requestSort('licenseNumber')} className="flex items-center gap-2">LICENSE # {getSortIcon('licenseNumber', sortConfig)}</button></th>
								<th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell"><button onClick={() => requestSort('salesRepName')} className="flex items-center gap-2">SALES REP {getSortIcon('salesRepName', sortConfig)}</button></th>
								<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">ACTIONS</th>
							</tr>
						</thead>
						<tbody className="bg-card divide-y divide-border">
                            {processedDispensaries.map(group => (
                                <React.Fragment key={group.groupTitle}>
                                    {groupKey !== "None" && (
                                        <tr className="bg-accent/50">
                                            <th colSpan={6} className="px-4 py-2 text-left">
                                                <span className="inline-flex items-center px-3 py-1 text-sm font-semibold text-primary bg-primary/10 rounded-full border border-primary/50">
                                                    {group.groupTitle}
                                                    <span className="font-normal ml-2">({group.count})</span>
                                                </span>
                                            </th>
                                        </tr>
                                    )}
                                    {group.items.map(d => {
                                        const isExpanded = expandedRow === d.id;
                                        return (
                                        <React.Fragment key={d.id}>
                                            <tr className="hover:bg-accent/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">{d.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-muted-foreground hidden lg:table-cell">{d.address}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-muted-foreground hidden lg:table-cell">{d.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-muted-foreground hidden lg:table-cell">{d.licenseNumber}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-muted-foreground hidden lg:table-cell">{d.salesRepName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="flex gap-2 justify-center">
                                                        {permissions.edit && <Button onClick={() => setEditingDispensary(d)} variant="ghost" className="p-2 h-auto"><Pencil className="w-4 h-4" /></Button>}
                                                        {permissions.delete && <Button onClick={() => setDispensaryToDelete(d)} variant="ghost" className="p-2 h-auto text-red-600 hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>}
                                                        <Button variant="ghost" size="icon" className="lg:hidden p-2 h-auto" onClick={() => setExpandedRow(isExpanded ? null : d.id)}>
                                                            <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr className="lg:hidden">
                                                    <td colSpan={6} className="p-4 bg-accent/50">
                                                        <div className="space-y-2 text-sm text-muted-foreground">
                                                            <p><strong className="text-foreground block">Address:</strong> {d.address}</p>
                                                            <p><strong className="text-foreground block">Contact:</strong> {d.email}</p>
                                                            <p><strong className="text-foreground block">License #:</strong> {d.licenseNumber}</p>
                                                            <p><strong className="text-foreground block">Sales Rep:</strong> {d.salesRepName}</p>
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
                {/* Mobile Cards */}
                <div className="block md:hidden">
                    <div className="bg-card">
                         {processedDispensaries.map(group => (
                            <div key={group.groupTitle} className="first:pt-0 last:pb-0 py-4">
                                {groupKey !== "None" && (
                                    <h2 className="px-4 py-2 bg-accent/50">
                                        <span className="inline-flex items-center px-3 py-1 text-md font-semibold text-primary bg-primary/10 rounded-full border border-primary/50">
                                            {group.groupTitle}
                                            <span className="font-normal ml-2">({group.count})</span>
                                        </span>
                                    </h2>
                                )}
                                <div className="divide-y divide-border">
                                    {group.items.map(d => (
                                        <div key={d.id} className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold text-lg text-foreground pr-2">{d.name}</h3>
                                                <div className="flex items-center gap-1 -mt-2 -mr-2 flex-shrink-0">
                                                    {permissions.edit && <Button onClick={() => setEditingDispensary(d)} variant="ghost" className="p-2 h-auto"><Pencil size={16} /></Button>}
                                                    {permissions.delete && <Button onClick={() => setDispensaryToDelete(d)} variant="ghost" className="p-2 h-auto text-red-600 hover:bg-destructive/10"><Trash2 size={16} /></Button>}
                                                </div>
                                            </div>
                                            <div className="space-y-2 text-sm text-muted-foreground">
                                                <p className="flex items-center"><MapPin size={14} className="mr-2 text-muted-foreground flex-shrink-0"/> {d.address}</p>
                                                <p className="flex items-center"><Mail size={14} className="mr-2 text-muted-foreground flex-shrink-0"/> {d.email}</p>
                                                <p className="flex items-center"><FileText size={14} className="mr-2 text-muted-foreground flex-shrink-0"/> License: {d.licenseNumber}</p>
                                                <p className="flex items-center"><User size={14} className="mr-2 text-muted-foreground flex-shrink-0"/> Rep: {d.salesRepName}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                         ))}
                    </div>
                </div>
			</Card>
			{editingDispensary && <EditDispensaryModal dispensary={editingDispensary} onSave={handleUpdate} onClose={() => setEditingDispensary(null)} />}
			<ConfirmationModal
				isOpen={!!dispensaryToDelete}
				onClose={() => setDispensaryToDelete(null)}
				onConfirm={confirmDeleteDispensary}
				title="Confirm Dispensary Deletion"
				message={`Are you sure you want to delete "${dispensaryToDelete?.name}"? This action cannot be undone.`}
			/>
		</div>
	);
};
