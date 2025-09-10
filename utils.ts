import type { Dispensary, EnhancedVMIOrder, OrderItem, VMIProposalChange, VMIProposalVersion } from './types';

export const acceptVMIProposal = (order: EnhancedVMIOrder): EnhancedVMIOrder => ({ ...order, status: 'accepted' });
export const rejectVMIProposal = (order: EnhancedVMIOrder): EnhancedVMIOrder => ({ ...order, status: 'rejected' });

export const safeFormatDate = (
  dateInput: string | Date | undefined | null,
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
): string => {
  if (!dateInput) {
    return 'N/A';
  }
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  return date.toLocaleString('en-US', options);
};

export const safeTimeSince = (dateInput: string | Date | undefined | null): string => {
    if (!dateInput) {
        return 'N/A';
    }
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
        return 'Invalid Date';
    }

    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 5) return "just now";
    if (seconds < 60) return `${Math.floor(seconds)}s ago`;

    const minutes = seconds / 60;
    if (minutes < 60) return `${Math.floor(minutes)}m ago`;

    const hours = minutes / 60;
    if (hours < 24) return `${Math.floor(hours)}h ago`;

    const days = hours / 24;
    if (days < 30) return `${Math.floor(days)}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};