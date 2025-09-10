

export type BusinessUnit = 'sunshine' | 'fairwinds' | 'passion-flower';

export interface Product {
  id: string;
  name: string;
  description: string;
  productType: string;
  category: string;
  sku: string;
  topTerpenes: string;
  genetics: string;
  feelsLike: string;
  alertBanner: string | null;
  qtyInStock: number;
  dohType: 'DOH-General Use' | 'DOH-High THC' | 'DOH-High CBD' | 'None';
  businessUnit: BusinessUnit;
}

export interface ProductType {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  businessUnit: BusinessUnit;
}

export interface Dispensary {
  id: string;
  name: string;
  address: string;
  phone: string;
  licenseNumber: string;
  email: string;
  salesRepName: string;
  salesRepEmail: string;
  salesRepId: string;
}

export interface PermissionSet {
  products: { view: boolean; edit: boolean; create: boolean; delete: boolean };
  productTypes: { view: boolean; edit: boolean; create: boolean; delete: boolean };
  categorySort: { view: boolean; edit: boolean; };
  alertBanners: { view: boolean; edit: boolean; create: boolean; delete: boolean };
  ordersRegular: { view: boolean; };
  ordersVmi: { view: boolean; edit: boolean; delete: boolean };
  dispensaries: { view: boolean; edit: boolean; create: boolean; delete: boolean };
  users: { view: boolean; edit: boolean; create: boolean; delete: boolean };
  roles: { view: boolean; edit: boolean; create: boolean; delete: boolean };
  inventory: { view: boolean; edit: boolean; };
  mobileNav: { view: boolean; edit: boolean; };
  categories: { view: boolean; edit: boolean; create: boolean; delete: boolean };
}

export interface Role {
  id: string;
  name: string;
  permissions: PermissionSet;
}

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  email: string;
  roleId: string;
  profilePicture?: string;
  businessUnits: BusinessUnit[];
}

export interface OrderItem {
  id: string;
  name: string;
  productType: string;
  price: number;
  orderQty: number;
  lineTotal: number;
  sku: string;
  category: string;
  businessUnit: BusinessUnit;
}

export interface Order {
  id: string;
  date: string;
  dispensary: Dispensary;
  salesRep: {
    name: string;
    email: string;
  };
  salesRepId: string;
  items: OrderItem[];
  businessUnit: 'fairwinds' | 'sunshine-pf';
}

export interface AlertBanner {
  id:string;
  text: string;
  color: string;
  businessUnit: BusinessUnit;
}

export interface Category {
    id: string;
    name: string;
    businessUnit: BusinessUnit;
}

export interface CategorySort {
  name: string;
  order: number;
}

export interface VMIProposalChange {
  type: 'added' | 'removed' | 'quantity_change';
  productId: string;
  productName: string;
  previousValue?: number;
  newValue?: number;
}

export interface VMIProposalVersion {
  versionNumber: number;
  createdBy: 'sales_rep' | 'dispensary';
  createdAt: string;
  items: OrderItem[];
  changes?: VMIProposalChange[];
}

export interface EnhancedVMIOrder {
  id: string;
  dispensary: Dispensary;
  salesRep: { name: string; email: string };
  salesRepId: string;
  status: 'pending_review' | 'submitted_to_customer' | 'accepted' | 'rejected';
  link: string;
  isActive: boolean;
  versions: VMIProposalVersion[];
  businessUnit: 'fairwinds' | 'sunshine-pf';
}

export interface ScrapedInventoryItem {
  sku: string;
  productName: string;
  unitsForSale: number;
  allocations: number;
  status: 'active' | 'inactive' | 'archived';
}

export interface ScrapeLogEntry {
  timestamp: string;
  summary: string;
}

export interface MobileNavItem {
  id: 'dispensaries' | 'products' | 'orders-received' | 'productTypes' | 'categorySort' | 'alertBanners' | 'users' | 'inventory-fwpf' | 'inventory-ss' | 'roles' | 'categories' | 'mobileNav';
  label: string;
  icon: string;
  isVisible: boolean;
  order: number;
}

export interface Notification {
  id: string;
  userId: string; // The ID of the user this notification is for (e.g., salesRepId)
  type: 'order-regular' | 'order-vmi';
  businessUnit: 'sunshine' | 'fairwinds';
  message: string;
  link: 'orders-received';
  timestamp: string;
  isRead: boolean;
}

export type CombinedOrder = (Order & { type: 'regular' }) | (EnhancedVMIOrder & { type: 'vmi' });