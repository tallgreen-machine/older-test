import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Inbox, Download, Trash2, PlusCircle, MinusCircle, ArrowRight, FileText, User, MessageSquare, History, Search, Store, Mail, Bold, Italic, Underline, List, ListOrdered, Eye } from 'lucide-react';
import type { Order, EnhancedVMIOrder, VMIProposalVersion, VMIProposalChange, OrderItem, BusinessUnit, CombinedOrder, UserAccount, Role } from '../../../types';
import { Button, StyledModal, PrimaryButton, ConfirmationModal, Select } from '../../ui';
import { fmt } from '../../../constants';
import { safeTimeSince } from "../../../utils";
import { useAppContext } from '../../../contexts/AppContext';

const StatusBadge = ({ status }: { status: 'Sent' | 'Changed' | 'Accepted' }) => {
    const baseClasses = "text-xs font-medium px-2 py-0.5 rounded-full inline-block";
    const styles = {
        Sent: "bg-blue-100 text-blue-800",
        Changed: "bg-orange-100 text-orange-800",
        Accepted: "bg-green-100 text-green-800",
    };
    return <span className={`${baseClasses} ${styles[status]}`}>{status}</span>;
};


const ChangeLogModal = ({ onClose, originalVersion, finalVersion }: { onClose: () => void, originalVersion: VMIProposalVersion, finalVersion: VMIProposalVersion }) => {
  const changes = finalVersion.changes || [];
  const originalItemsMap = new Map(originalVersion.items.map(item => [item.id, item]));
  const finalItemsMap = new Map(finalVersion.items.map(item => [item.id, item]));

  const renderChange = (change: VMIProposalChange, index: number) => {
    let itemDetails: OrderItem | undefined;
    switch (change.type) {
      case 'quantity_change':
        itemDetails = finalItemsMap.get(change.productId);
        if (!itemDetails) return null;
        return (
          <div key={`${change.productId}-${index}`} className="flex items-start gap-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <ArrowRight className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
            <div className="flex-grow">
              <p><span className="font-semibold">{change.productName}</span> quantity changed from <span className="font-bold">{change.previousValue}</span> to <span className="font-bold">{change.newValue}</span>.</p>
              <p className="text-xs text-gray-600">New line total: {fmt(itemDetails.lineTotal)}</p>
            </div>
          </div>
        );
      case 'added':
        itemDetails = finalItemsMap.get(change.productId);
        if (!itemDetails) return null;
        return (
          <div key={`${change.productId}-${index}`} className="flex items-start gap-3 p-3 bg-green-50 border-l-4 border-green-400 rounded">
            <PlusCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
            <div className="flex-grow">
                <p><span className="font-semibold">{change.productName}</span> added to proposal.</p>
                <p className="text-xs text-gray-600">Quantity: {change.newValue}, Line total: {fmt(itemDetails.lineTotal)}</p>
            </div>
          </div>
        );
      case 'removed':
        const originalItemDetails = originalItemsMap.get(change.productId);
        if (!originalItemDetails) return null;
        return (
          <div key={`${change.productId}-${index}`} className="flex items-start gap-3 p-3 bg-red-50 border-l-4 border-red-400 rounded">
            <MinusCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-grow">
                <p><span className="font-semibold">{change.productName}</span> removed from proposal.</p>
                <p className="text-xs text-gray-600">Previous quantity: {change.previousValue}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const calculateTotals = (version: VMIProposalVersion) => {
      const totalQty = version.items.reduce((sum, item) => sum + item.orderQty, 0);
      const totalValue = version.items.reduce((sum, item) => sum + item.lineTotal, 0);
      return { totalQty, totalValue };
  };

  const originalTotals = calculateTotals(originalVersion);
  const finalTotals = calculateTotals(finalVersion);
  
  return (
    <StyledModal title={`Changes for Version ${finalVersion.versionNumber}`} onClose={onClose}>
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                    <p className="text-sm text-gray-500">Previous Version ({`v${originalVersion.versionNumber}`})</p>
                    <p className="font-semibold">{originalTotals.totalQty} items</p>
                    <p className="font-bold text-lg">{fmt(originalTotals.totalValue)}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">This Version ({`v${finalVersion.versionNumber}`})</p>
                    <p className="font-semibold">{finalTotals.totalQty} items</p>
                    <p className="font-bold text-lg">{fmt(finalTotals.totalValue)}</p>
                </div>
            </div>
            
            <div className="max-h-80 overflow-y-auto space-y-3 p-1">
                {changes.length > 0 ? (
                    changes.map((change, index) => renderChange(change, index))
                ) : (
                    <p className="text-center text-gray-500">No changes recorded for this version.</p>
                )}
            </div>
        </div>
        <div className="mt-6 flex justify-end">
            <PrimaryButton onClick={onClose}>Close</PrimaryButton>
        </div>
    </StyledModal>
  );
};

const WYSIWYGEditor = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCmd = (command: string) => {
        document.execCommand(command, false);
        editorRef.current?.focus();
    };

    return (
        <div className="border rounded-md">
            <div className="flex items-center gap-2 p-2 border-b bg-gray-50 rounded-t-md">
                <Button type="button" variant="ghost" size="icon" onClick={() => execCmd('bold')}><Bold size={16} /></Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => execCmd('italic')}><Italic size={16} /></Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => execCmd('underline')}><Underline size={16} /></Button>
                <div className="w-px h-5 bg-gray-300 mx-1"></div>
                <Button type="button" variant="ghost" size="icon" onClick={() => execCmd('insertUnorderedList')}><List size={16} /></Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => execCmd('insertOrderedList')}><ListOrdered size={16} /></Button>
            </div>
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                dangerouslySetInnerHTML={{ __html: value }}
                className="prose p-3 h-64 overflow-y-auto focus:outline-none"
                style={{ maxWidth: 'none' }}
            ></div>
        </div>
    );
};

const EmailReceiptModal = ({ isOpen, onClose, onSend, to, from, body, onBodyChange }: { isOpen: boolean, onClose: () => void, onSend: () => void, to: string, from: string, body: string, onBodyChange: (value: string) => void }) => {
    if (!isOpen) return null;

    return (
        <StyledModal
            title="Email Receipt"
            onClose={onClose}
            size="2xl"
            footer={
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <PrimaryButton onClick={onSend}>Send Email</PrimaryButton>
                </div>
            }
        >
            <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-md">
                    <label className="font-medium text-gray-600">To:</label>
                    <input type="text" readOnly value={to} className="flex-1 bg-transparent focus:outline-none" />
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-md">
                    <label className="font-medium text-gray-600">From:</label>
                    <input type="text" readOnly value={from} className="flex-1 bg-transparent focus:outline-none" />
                </div>
                <div>
                    <WYSIWYGEditor value={body} onChange={onBodyChange} />
                </div>
            </div>
        </StyledModal>
    );
};


export const OrdersReceivedManager = ({ orders, setOrders, setVmiOrders, showMessage, permissions, activeBusinessUnit, currentUser, users, roles }: { orders: CombinedOrder[], setOrders: React.Dispatch<React.SetStateAction<Order[]>>, setVmiOrders: React.Dispatch<React.SetStateAction<EnhancedVMIOrder[]>>, showMessage: (message: string) => void, permissions: { regular: { view: boolean }, vmi: { view: boolean, edit: boolean, delete: boolean } }, activeBusinessUnit: BusinessUnit, currentUser: UserAccount, users: UserAccount[], roles: Role[] }) => {
    const { handleDeleteVMIProposal } = useAppContext();
    const [filter, setFilter] = useState<'all' | 'regular' | 'vmi'>('all');
    const [selectedOrder, setSelectedOrder] = useState<CombinedOrder | null>(null);
    const [selectedRepId, setSelectedRepId] = useState('all');
    const [showChangeLog, setShowChangeLog] = useState<{order: EnhancedVMIOrder, version: VMIProposalVersion} | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEmailComposerOpen, setIsEmailComposerOpen] = useState(false);
    const [emailBody, setEmailBody] = useState('');
    const [emailContext, setEmailContext] = useState<'receipt' | 'nudge' | null>(null);

    const userRole = useMemo(() => roles.find(r => r.id === currentUser.roleId), [roles, currentUser.roleId]);
    const isAdmin = useMemo(() => userRole?.name === 'Admin' || userRole?.name === 'Super Admin', [userRole]);

    const salesReps = useMemo(() => {
        const salesRepRole = roles.find(r => r.name === 'Sales Rep');
        if (!salesRepRole) return [];
        return users.filter(u => u.roleId === salesRepRole.id);
    }, [users, roles]);
    
    const filteredOrders = useMemo(() => {
        let displayOrders = [...orders];

        if (!isAdmin) {
            displayOrders = displayOrders.filter(order => order.salesRepId === currentUser.id);
        } else if (selectedRepId !== 'all') {
            displayOrders = displayOrders.filter(order => order.salesRepId === selectedRepId);
        }
        
        if (filter !== 'all') {
            displayOrders = displayOrders.filter(order => order.type === filter);
        }

        if (searchTerm) {
            displayOrders = displayOrders.filter(order => 
                order.dispensary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                findSalesRep(order.salesRepId)?.username.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        const getOrderTimestamp = (order: CombinedOrder): number => {
            const dateStr = order.type === 'regular' ? order.date : order.versions[order.versions.length - 1]?.createdAt;
            if (!dateStr) return 0;
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? 0 : date.getTime();
        }

        return displayOrders.sort((a, b) => getOrderTimestamp(b) - getOrderTimestamp(a));
    }, [orders, filter, isAdmin, currentUser.id, selectedRepId, searchTerm]);
    
    useEffect(() => {
        const currentSelectedStillExists = filteredOrders.some(o => o.id === selectedOrder?.id);
        if (!currentSelectedStillExists) {
            setSelectedOrder(filteredOrders[0] || null);
        }
    }, [filteredOrders, selectedOrder]);

    const handleDownloadSingleOrder = (order: CombinedOrder, versionNumber?: number) => {
        const isVMI = order.type === 'vmi';
        let orderItems: OrderItem[];
        let orderDate: Date;
    
        if (isVMI) {
            const version = versionNumber 
                ? order.versions.find(v => v.versionNumber === versionNumber)
                : order.versions[order.versions.length - 1];
            
            if (!version) {
                showMessage("Could not find the specified proposal version.");
                return;
            }
            orderItems = version.items;
            orderDate = new Date(version.createdAt);
        } else {
            orderItems = order.items;
            orderDate = new Date(order.date);
        }
        
        const headers = ["Order ID", "Date", "Dispensary", "Sales Rep", "Item SKU", "Item Name", "Item Qty", "Item Price", "Line Total", "Brand"];
        const rows = orderItems.map(item => ({
            "Order ID": order.id, 
            "Date": orderDate.toLocaleDateString(), 
            "Dispensary": order.dispensary.name, 
            "Sales Rep": order.salesRep.name,
            "Item SKU": item.sku, 
            "Item Name": item.name, 
            "Item Qty": item.orderQty, 
            "Item Price": fmt(item.price), 
            "Line Total": fmt(item.lineTotal),
            "Brand": item.businessUnit.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        }));

        const csvContent = [ headers.join(','), ...rows.map(row => headers.map(header => `"${(row as any)[header]}"`).join(',')) ].join('\n');
        
        const download = (content: string, filename: string) => {
            const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        }

        download(csvContent, `${isVMI ? 'VMI_Proposal' : 'Regular_Order'}_${order.id}${isVMI ? `_v${versionNumber || order.versions.length}` : ''}.csv`);
    };
    
    const generateReceiptHtml = (order: CombinedOrder, salesRep?: UserAccount, versionNumber?: number): string => {
        const isVMI = order.type === 'vmi';
        let orderItems: OrderItem[];
        let orderDate: string;
        let version: VMIProposalVersion | undefined;
    
        if (isVMI) {
            version = versionNumber 
                ? order.versions.find(v => v.versionNumber === versionNumber)
                : order.versions[order.versions.length - 1];
            if (!version) return '';
            orderItems = version.items;
            orderDate = new Date(version.createdAt).toLocaleDateString();
        } else {
            orderItems = order.items;
            orderDate = new Date(order.date).toLocaleDateString();
        }

        const total = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
        const brandName = order.businessUnit === 'sunshine-pf' ? 'Sunshine / Passion Flower' : 'Fairwinds / Passion Flower';

        const itemsHtml = orderItems.map(item => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px;">${item.name}<br><span style="font-size: 12px; color: #666;">${item.sku}</span></td>
                <td style="padding: 10px; text-align: center;">${item.orderQty}</td>
                <td style="padding: 10px; text-align: right;">${fmt(item.price)}</td>
                <td style="padding: 10px; text-align: right;">${fmt(item.lineTotal)}</td>
            </tr>
        `).join('');

        return `
            <p>Hi ${order.dispensary.name.split('—')[0].trim()},</p>
            <p>Please find the receipt for your recent ${isVMI ? 'proposal' : 'order'} below. Let me know if you have any questions!</p>
            <br>
            <div style="border: 1px solid #ddd; border-radius: 8px; padding: 20px; font-family: sans-serif; color: #333; max-width: 600px; margin: auto;">
                <h2 style="text-align: center; color: #222; margin-top: 0;">${isVMI ? 'Proposal' : 'Order'} Receipt</h2>
                <p><strong>${isVMI ? 'Proposal' : 'Order'} ID:</strong> ${order.id}</p>
                <p><strong>Date:</strong> ${orderDate}</p>
                <p><strong>Dispensary:</strong> ${order.dispensary.name}</p>
                <p><strong>Sales Rep:</strong> ${salesRep?.username || order.salesRep.name}</p>
                <p><strong>Brand:</strong> ${brandName}</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="color: #555;">
                            <th style="padding: 10px; text-align: left;">Item</th>
                            <th style="padding: 10px; text-align: center;">Qty</th>
                            <th style="padding: 10px; text-align: right;">Price</th>
                            <th style="padding: 10px; text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>${itemsHtml}</tbody>
                </table>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="text-align: right; font-size: 1.2em; font-weight: bold;">Total: ${fmt(total)}</p>
            </div>
            <br>
            <p>Thanks,<br>${salesRep?.username || order.salesRep.name}</p>
        `;
    };

    const handleOpenEmailComposer = (context: 'receipt' | 'nudge', versionNumber?: number) => {
        if (!selectedOrder) return;
        
        setEmailContext(context);
        const salesRep = findSalesRep(selectedOrder.salesRepId);
        let bodyHtml = '';
        
        if (context === 'receipt') {
            bodyHtml = generateReceiptHtml(selectedOrder, salesRep, versionNumber);
        } else {
            bodyHtml = `<p>Hi ${selectedOrder.dispensary.name.split('—')[0].trim()},</p><p>Just a friendly nudge to review the latest VMI proposal. Please let me know if you have any questions!</p><br><p>Thanks,<br>${salesRep?.username || selectedOrder.salesRep.name}</p>`;
        }
        
        setEmailBody(bodyHtml);
        setIsEmailComposerOpen(true);
    };

    const handleSendEmail = () => {
        showMessage('Email sent successfully!');
        setIsEmailComposerOpen(false);
    };

    const confirmDeletion = async () => {
        if (confirmDelete) {
            await handleDeleteVMIProposal(confirmDelete);
            setConfirmDelete(null);
        }
    };

    const findSalesRep = (repId: string) => users.find(u => u.id === repId);
    
    return (
        <div className="bg-white h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
             <div className="flex flex-col md:flex-row h-full">
                {/* Left Pane: Inbox */}
                <div className="w-full md:w-[350px] lg:w-[400px] flex-shrink-0 flex flex-col border-r">
                    <div className="p-3 border-b space-y-3">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-bold text-gray-800">Inbox</h2>
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full h-9 rounded-md border border-gray-300 bg-gray-50 focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 pl-9 transition-colors hover:border-gray-400"
                                />
                            </div>
                        </div>
                         <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                            <Button variant={filter === 'all' ? 'default' : 'ghost'} onClick={() => setFilter('all')} className={`text-sm h-8 px-3 flex-1 ${filter === 'all' ? 'bg-white shadow-sm' : ''}`}>All</Button>
                            <Button variant={filter === 'regular' ? 'default' : 'ghost'} onClick={() => setFilter('regular')} className={`text-sm h-8 px-3 flex-1 ${filter === 'regular' ? 'bg-white shadow-sm' : ''}`}>Regular</Button>
                            <Button variant={filter === 'vmi' ? 'default' : 'ghost'} onClick={() => setFilter('vmi')} className={`text-sm h-8 px-3 flex-1 ${filter === 'vmi' ? 'bg-white shadow-sm' : ''}`}>VMI</Button>
                        </div>
                        {isAdmin && (
                             <Select id="repFilter" value={selectedRepId} onChange={e => setSelectedRepId(e.target.value)} className="h-9">
                                <option value="all">All Sales Reps</option>
                                {salesReps.map(rep => (
                                    <option key={rep.id} value={rep.id}>{rep.username}</option>
                                ))}
                            </Select>
                        )}
                    </div>
                    <div className="flex-grow overflow-y-auto">
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map(order => {
                                const salesRepName = findSalesRep(order.salesRepId)?.username || 'Unknown Rep';
                                const orderDateStr = order.type === 'regular' ? order.date : order.versions[order.versions.length - 1]?.createdAt;
                                const isActive = selectedOrder?.id === order.id;
                                const itemCount = order.type === 'regular' 
                                    ? (order.items || []).length 
                                    : (order.versions[order.versions.length-1]?.items || []).length;
                                
                                return (
                                <button key={order.id} onClick={() => setSelectedOrder(order)} className={`w-full text-left p-4 border-b last:border-b-0 transition-colors duration-150 ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                                    <div className="flex justify-between items-start">
                                        <p className={`font-semibold text-sm truncate pr-2 ${isActive ? 'text-blue-800' : 'text-gray-800'}`}>{salesRepName}</p>
                                        <p className="text-xs text-gray-500 flex-shrink-0">{safeTimeSince(orderDateStr)}</p>
                                    </div>
                                    <p className="font-bold text-gray-900 truncate text-left">{order.dispensary.name}</p>
                                    <p className="text-sm text-gray-600 truncate text-left">
                                        {order.type === 'regular' ? 'Regular Order' : 'VMI Proposal'} - {itemCount} items
                                    </p>
                                </button>
                            )})
                        ) : (
                            <p className="text-center text-gray-500 p-8">No orders found.</p>
                        )}
                    </div>
                </div>

                {/* Right Pane: Detail View */}
                <div className="flex-1 min-w-0 flex flex-col">
                    {selectedOrder ? (
                        <>
                           <div className="p-4 border-b flex justify-between items-start flex-shrink-0">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{selectedOrder.dispensary.name}</h2>
                                    <p className="text-sm text-gray-500">from {findSalesRep(selectedOrder.salesRepId)?.username}</p>
                                </div>
                                 <div className="flex items-center gap-2 flex-shrink-0">
                                     <span className={`text-sm font-medium px-3 py-1.5 rounded-lg ${selectedOrder.type === 'regular' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {selectedOrder.type === 'regular' ? 'Regular Order' : 'VMI Proposal'}
                                     </span>
                                     
                                     {selectedOrder.type === 'regular' && (
                                        <>
                                            <Button onClick={() => handleDownloadSingleOrder(selectedOrder)} variant="outline" size="icon" className="w-10 h-10">
                                                <Download className="w-5 h-5" />
                                            </Button>
                                            <Button onClick={() => handleOpenEmailComposer('receipt')} variant="outline" size="icon" className="w-10 h-10">
                                                <Mail className="w-5 h-5" />
                                            </Button>
                                        </>
                                     )}
                                     
                                     {selectedOrder.type === 'vmi' && permissions.vmi.delete && (
                                        <Button onClick={() => setConfirmDelete(selectedOrder.id)} variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-600">
                                            <Trash2 className="w-5 h-5" />
                                        </Button>
                                     )}
                                </div>
                            </div>

                            <div className="flex-grow overflow-y-auto p-6 bg-gray-50/50">
                               {selectedOrder.type === 'regular' && (() => {
                                   const items = selectedOrder.items || [];
                                   const total = items.reduce((acc, i) => acc + i.lineTotal, 0);
                                   return (
                                       <div className="bg-white p-6 rounded-lg shadow-sm border">
                                            <h4 className="font-semibold mb-2 text-lg text-gray-800">Order Items</h4>
                                            {items.length > 0 ? (
                                                <>
                                                    <ul className="divide-y divide-gray-200">
                                                        {items.map(item => (
                                                            <li key={item.id} className="flex justify-between items-center text-sm py-3">
                                                                <div>
                                                                    <p className="font-medium text-gray-800">{item.name}</p>
                                                                    <p className="text-gray-500 text-xs">SKU: {item.sku}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="font-semibold">{fmt(item.lineTotal)}</p>
                                                                    <p className="text-gray-500 text-xs">{item.orderQty} x {fmt(item.price)}</p>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <div className="mt-4 border-t pt-4 flex justify-end font-bold text-lg">
                                                        <span>Total:</span>
                                                        <span className="ml-4">{fmt(total)}</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <p className="text-center text-gray-500 py-4">This order has no items.</p>
                                            )}
                                       </div>
                                   );
                               })()}
                               {selectedOrder.type === 'vmi' && (
                                   <div className="space-y-6">
                                        {selectedOrder.versions.map((version) => {
                                            const isRepUpdate = version.createdBy === 'sales_rep';
                                            const salesRep = findSalesRep(selectedOrder.salesRepId);
                                            const totalValue = version.items.reduce((acc, item) => acc + item.lineTotal, 0);
                                            const totalItems = version.items.reduce((acc, item) => acc + item.orderQty, 0);

                                            const isLatestVersion = version.versionNumber === selectedOrder.versions.length;
                                            let status: 'Sent' | 'Changed' | 'Accepted' = 'Sent';
                                            if (version.createdBy === 'dispensary') {
                                                status = 'Changed';
                                            }
                                            if (isLatestVersion && selectedOrder.status === 'accepted') {
                                                status = 'Accepted';
                                            }
                                        
                                            const cardBgClass = status === 'Accepted' ? 'bg-green-50 border-green-200'
                                                               : status === 'Changed' ? 'bg-amber-50 border-amber-200'
                                                               : 'bg-white';
                                            
                                            const encodedItems = version.items.map(i => `${i.id}:${i.orderQty}`).join(',');
                                            const viewOrderUrl = `${window.location.origin}/?dispensaryId=${selectedOrder.dispensary.id}&items=${encodedItems}`;

                                            return (
                                            <div key={version.versionNumber} className={`flex items-start gap-3 ${isRepUpdate ? '' : 'flex-row-reverse'}`}>
                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                                                    {isRepUpdate ? (
                                                        salesRep?.profilePicture ? <img src={salesRep.profilePicture} alt={salesRep.username} className="w-full h-full object-cover" /> : <User size={20} className="text-gray-500" />
                                                    ) : (
                                                        <Store size={20} className="text-amber-600" />
                                                    )}
                                                </div>
                                                <div className="flex-1 max-w-xl">
                                                    <div className={`p-4 rounded-lg shadow-sm border ${cardBgClass}`}>
                                                        <div className="flex justify-between items-start mb-3 pb-2 border-b">
                                                            <div>
                                                                <p className="font-semibold text-gray-800">{isRepUpdate ? salesRep?.username : selectedOrder.dispensary.name}</p>
                                                                <p className="text-xs text-gray-500">{isRepUpdate ? 'Sales Rep' : 'Dispensary'}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs text-gray-500">{safeTimeSince(version.createdAt)} (v{version.versionNumber})</p>
                                                                <div className="mt-1">
                                                                    <StatusBadge status={status} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                         <div className="grid grid-cols-2 gap-2 text-center mb-3">
                                                            <div>
                                                                <p className="text-xs text-gray-500">Total Items</p>
                                                                <p className="font-semibold">{totalItems}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-500">Total Value</p>
                                                                <p className="font-semibold text-lg">{fmt(totalValue)}</p>
                                                            </div>
                                                        </div>

                                                        <details>
                                                            <summary className="text-sm font-medium text-blue-600 cursor-pointer hover:underline">View Items ({version.items.length})</summary>
                                                            <ul className="divide-y divide-gray-100 text-sm mt-2 pt-2 border-t">
                                                                {version.items.map(item => (
                                                                    <li key={item.id} className="flex justify-between items-center py-1.5">
                                                                        <span>{item.name} <span className="text-gray-500">x{item.orderQty}</span></span>
                                                                        <span className="font-medium">{fmt(item.lineTotal)}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </details>

                                                        {version.versionNumber > 1 && (
                                                            <div className="mt-3 border-t pt-2">
                                                                <Button variant="ghost" className="text-xs p-1 h-auto text-blue-600" onClick={() => setShowChangeLog({order: selectedOrder, version})}>
                                                                    <History size={12} className="mr-1.5"/> View Changes from v{version.versionNumber - 1}
                                                                </Button>
                                                            </div>
                                                        )}

                                                        <div className="mt-4 pt-3 border-t flex items-center gap-2">
                                                            <a href={viewOrderUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border border-gray-300 bg-transparent hover:bg-gray-100 h-9 w-9">
                                                                <Eye size={16} />
                                                            </a>
                                                            
                                                            {status === 'Sent' && (
                                                                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => handleOpenEmailComposer('nudge', version.versionNumber)}>
                                                                    <Mail size={16} />
                                                                </Button>
                                                            )}
                                                            {(status === 'Changed' || status === 'Accepted') && (
                                                                <>
                                                                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => handleDownloadSingleOrder(selectedOrder, version.versionNumber)}>
                                                                        <Download size={16} />
                                                                    </Button>
                                                                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => handleOpenEmailComposer('receipt', version.versionNumber)}>
                                                                        <Mail size={16} />
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )})}
                                   </div>
                               )}
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center bg-gray-50">
                            <div className="text-center text-gray-500">
                                <Inbox size={48} className="mx-auto" />
                                <p className="mt-2 text-lg">Select an order to view details</p>
                                <p className="text-sm">Your orders will appear here.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showChangeLog && (
                <ChangeLogModal 
                    onClose={() => setShowChangeLog(null)}
                    originalVersion={showChangeLog.order.versions[showChangeLog.version.versionNumber - 2]}
                    finalVersion={showChangeLog.version}
                />
            )}
            
            <ConfirmationModal
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={confirmDeletion}
                title="Confirm Deletion"
                message="Are you sure you want to delete this VMI proposal? This action cannot be undone."
            />
            
            {selectedOrder && (
                <EmailReceiptModal
                    isOpen={isEmailComposerOpen}
                    onClose={() => setIsEmailComposerOpen(false)}
                    onSend={handleSendEmail}
                    to={selectedOrder.dispensary.email}
                    from={findSalesRep(selectedOrder.salesRepId)?.email || 'N/A'}
                    body={emailBody}
                    onBodyChange={setEmailBody}
                />
            )}
        </div>
    );
};