import React, { useState, useRef, useEffect, useMemo, createContext, useContext } from "react";
import { seedScrapedInventory, seedRoles, fmt } from '../constants';
import type { Product, Dispensary, UserAccount, ProductType, AlertBanner, CategorySort, Order, OrderItem, EnhancedVMIOrder, ScrapedInventoryItem, ScrapeLogEntry, MobileNavItem, Role, BusinessUnit, Category, Notification } from '../types';

// --- API Wrapper Functions ---
const API_BASE_URL = 'https://138.68.5.162/api';

const api = {
    login: async (username, password) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Login failed');
        }
        return response.json();
    },
    checkEmail: async (email) => {
        const response = await fetch(`${API_BASE_URL}/auth/check-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        if (!response.ok) throw new Error('Failed to check email');
        return response.json();
    },
    resetPassword: async (email, newPassword) => {
        const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, newPassword }),
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Password reset failed');
        }
        return response.json();
    },
    getAdminData: async () => {
        const response = await fetch(`${API_BASE_URL}/admin-data`);
        if (!response.ok) throw new Error('Failed to fetch admin data');
        return response.json();
    },
    placeOrders: async (orders) => {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orders),
        });
         if (!response.ok) throw new Error('Failed to place order');
        return response.json();
    },
    createVMIProposal: async (proposalData) => {
        const response = await fetch(`${API_BASE_URL}/vmi-proposals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(proposalData),
        });
        if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Failed to create VMI proposal'); }
        return response.json();
    },
    updateVMIProposal: async (id, proposalData) => {
        const response = await fetch(`${API_BASE_URL}/vmi-proposals/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(proposalData),
        });
        if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Failed to update VMI proposal'); }
        return response.json();
    },
    deleteVMIProposal: async (id) => {
        const response = await fetch(`${API_BASE_URL}/vmi-proposals/${id}`, { method: 'DELETE' });
        if (!response.ok && response.status !== 204) { const err = await response.json(); throw new Error(err.error || 'Failed to delete VMI proposal'); }
        return response.status === 204 ? {} : response.json();
    },
    syncInventory: async (scrapedItems) => {
        const response = await fetch(`${API_BASE_URL}/inventory/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scrapedItems }),
        });
        if (!response.ok) throw new Error('Failed to sync inventory');
        return response.json();
    },
    bulkUploadProducts: async (products) => {
        const response = await fetch(`${API_BASE_URL}/products/bulk-upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ products }),
        });
        if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Bulk product upload failed'); }
        return response.json();
    },
    bulkUploadDispensaries: async (dispensaries) => {
        const response = await fetch(`${API_BASE_URL}/dispensaries/bulk-upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dispensaries }),
        });
        if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Bulk dispensary upload failed'); }
        return response.json();
    },
    createCategory: async (categoryData) => {
        const response = await fetch(`${API_BASE_URL}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(categoryData),
        });
        if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Failed to create category'); }
        return response.json();
    },
    updateCategory: async (id, categoryData) => {
        const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(categoryData),
        });
        if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Failed to update category'); }
        return response.json();
    },
    deleteCategory: async (id) => {
        const response = await fetch(`${API_BASE_URL}/categories/${id}`, { method: 'DELETE' });
        if (!response.ok && response.status !== 204) { const err = await response.json(); throw new Error(err.error || 'Failed to delete category'); }
        return response.status === 204 ? {} : response.json();
    },
    createProductType: async (productTypeData) => {
        const response = await fetch(`${API_BASE_URL}/product-types`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productTypeData),
        });
        if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Failed to create product type'); }
        return response.json();
    },
    updateProductType: async (id, productTypeData) => {
        const response = await fetch(`${API_BASE_URL}/product-types/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productTypeData),
        });
        if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Failed to update product type'); }
        return response.json();
    },
    deleteProductType: async (id) => {
        const response = await fetch(`${API_BASE_URL}/product-types/${id}`, { method: 'DELETE' });
        if (!response.ok && response.status !== 204) { const err = await response.json(); throw new Error(err.error || 'Failed to delete product type'); }
        return response.status === 204 ? {} : response.json();
    },
    createAlertBanner: async (alertBannerData) => {
        const response = await fetch(`${API_BASE_URL}/alert-banners`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(alertBannerData),
        });
        if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Failed to create alert banner'); }
        return response.json();
    },
    updateAlertBanner: async (id, alertBannerData) => {
        const response = await fetch(`${API_BASE_URL}/alert-banners/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(alertBannerData),
        });
        if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Failed to update alert banner'); }
        return response.json();
    },
    deleteAlertBanner: async (id) => {
        const response = await fetch(`${API_BASE_URL}/alert-banners/${id}`, { method: 'DELETE' });
        if (!response.ok && response.status !== 204) { const err = await response.json(); throw new Error(err.error || 'Failed to delete alert banner'); }
        return response.status === 204 ? {} : response.json();
    },
    createProduct: async (productData) => {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
        });
        if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Failed to create product'); }
        return response.json();
    },
    updateProduct: async (id, productData) => {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
        });
        if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Failed to update product'); }
        return response.json();
    },
    createDispensary: async (dispensaryData) => {
        const response = await fetch(`${API_BASE_URL}/dispensaries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dispensaryData),
        });
        if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Failed to create dispensary'); }
        return response.json();
    },
    updateDispensary: async (id, dispensaryData) => {
        const response = await fetch(`${API_BASE_URL}/dispensaries/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dispensaryData),
        });
        if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Failed to update dispensary'); }
        return response.json();
    },
    deleteDispensary: async (id) => {
        const response = await fetch(`${API_BASE_URL}/dispensaries/${id}`, { method: 'DELETE' });
        if (!response.ok && response.status !== 204) { const err = await response.json(); throw new Error(err.error || 'Failed to delete dispensary'); }
        return response.status === 204 ? {} : response.json();
    },
    createUser: async (userData) => {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Failed to create user'); }
        return response.json();
    },
    updateUser: async (id, userData) => {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Failed to update user'); }
        return response.json();
    },
    deleteUser: async (id) => {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, { method: 'DELETE' });
        if (!response.ok && response.status !== 204) { const err = await response.json(); throw new Error(err.error || 'Failed to delete user'); }
        return response.status === 204 ? {} : response.json();
    },
    createRole: async (roleData) => {
        const response = await fetch(`${API_BASE_URL}/roles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(roleData),
        });
        if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Failed to create role'); }
        return response.json();
    },
    updateRole: async (id, roleData) => {
        const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(roleData),
        });
        if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Failed to update role'); }
        return response.json();
    },
    deleteRole: async (id) => {
        const response = await fetch(`${API_BASE_URL}/roles/${id}`, { method: 'DELETE' });
        if (!response.ok && response.status !== 204) { const err = await response.json(); throw new Error(err.error || 'Failed to delete role'); }
        return response.status === 204 ? {} : response.json();
    },
    updateCategorySort: async (businessUnit, sortOrder) => {
        const response = await fetch(`${API_BASE_URL}/settings/category-sort`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ businessUnit, sortOrder }),
        });
        if (!response.ok) throw new Error('Failed to update category sort order');
        return response.json();
    },
    updateMobileNav: async (config) => {
        const response = await fetch(`${API_BASE_URL}/settings/mobile-nav`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config),
        });
        if (!response.ok) throw new Error('Failed to update mobile nav config');
        return response.json();
    },
    updateInventoryThreshold: async (businessUnit, threshold) => {
        const response = await fetch(`${API_BASE_URL}/settings/inventory-threshold`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ businessUnit, threshold }),
        });
        if (!response.ok) throw new Error('Failed to update inventory threshold');
        return response.json();
    },
    markNotificationAsRead: async (id) => {
        const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, { method: 'PUT' });
        if (!response.ok) throw new Error('Failed to mark notification as read');
        return response.json();
    },
    markNotificationsAsReadBulk: async (ids) => {
        const response = await fetch(`${API_BASE_URL}/notifications/read-bulk`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids }),
        });
        if (!response.ok) throw new Error('Failed to bulk-update notifications');
        return response.json();
    },
};


interface AppContextType {
  currentUser: UserAccount | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserAccount | null>>;
  view: 'public' | 'admin' | 'vmi';
  setView: React.Dispatch<React.SetStateAction<'public' | 'admin' | 'vmi'>>;
  showLogin: boolean;
  setShowLogin: React.Dispatch<React.SetStateAction<boolean>>;
  selectedPublicBrand: 'fairwinds' | 'sunshine-pf' | null;
  setSelectedPublicBrand: React.Dispatch<React.SetStateAction<'fairwinds' | 'sunshine-pf' | null>>;
  activeAdminBU: BusinessUnit;
  setActiveAdminBU: React.Dispatch<React.SetStateAction<BusinessUnit>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  allProducts: Product[];
  dispensaries: Dispensary[];
  setDispensaries: React.Dispatch<React.SetStateAction<Dispensary[]>>;
  users: UserAccount[];
  setUsers: React.Dispatch<React.SetStateAction<UserAccount[]>>;
  roles: Role[];
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
  productTypes: ProductType[];
  setProductTypes: React.Dispatch<React.SetStateAction<ProductType[]>>;
  alertBanners: AlertBanner[];
  setAlertBanners: React.Dispatch<React.SetStateAction<AlertBanner[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  categorySortOrder: CategorySort[];
  setCategorySortOrder: (newOrder: CategorySort[]) => void;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  vmiOrders: EnhancedVMIOrder[];
  setVmiOrders: React.Dispatch<React.SetStateAction<EnhancedVMIOrder[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  uploadType: 'products' | 'dispensaries' | null;
  csvUploadRef: React.RefObject<HTMLInputElement>;
  messageBox: { visible: boolean; message: string; };
  hideMessage: () => void;
  showMessage: (message: string) => void;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  scrapedInventory: ScrapedInventoryItem[];
  inventoryThreshold: number;
  setInventoryThreshold: (value: number) => void;
  scrapeLog: ScrapeLogEntry[];
  mobileNavConfig: MobileNavItem[];
  setMobileNavConfig: (config: MobileNavItem[]) => void;
  handleLogin: (username: string, password: string) => Promise<string | null>;
  onLogout: () => void;
  handleCheckRecoveryEmail: (email: string) => Promise<boolean>;
  handleResetPassword: (email: string, newPass: string) => Promise<void>;
  handleSimulateScrape: () => void;
  handleDownload: (type: 'products' | 'dispensaries') => void;
  handleUploadClick: (type: 'products' | 'dispensaries') => void;
  handleCSVUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handlePlaceOrder: (orderItems: OrderItem[], dispensary: Dispensary, onSuccess: () => void) => Promise<void>;
  handleCreateVMIProposal: (dispensary: Dispensary, items: OrderItem[], currentBrand: 'fairwinds' | 'sunshine-pf') => Promise<void>;
  handleUpdateVMIProposal: (order: EnhancedVMIOrder, newItems: OrderItem[], updatedBy: 'sales_rep' | 'dispensary') => Promise<void>;
  handleDeleteVMIProposal: (orderId: string) => Promise<void>;
  handleDownloadAllVMIOrders: () => void;
  adminData: any;
  publicData: any;
  userNotifications: Notification[];
  unreadCount: number;
  unreadSidebarCounts: any;
  markNotificationAsRead: (id: string) => void;
  markNotificationsAsReadForView: (tab: 'orders-received', businessUnit: BusinessUnit) => void;
  handleAddCategory: (name: string, businessUnit: BusinessUnit) => Promise<void>;
  handleSaveCategory: (updatedCategory: Category) => Promise<void>;
  handleDeleteCategory: (id: string) => Promise<void>;
  handleAddProductType: (newProductTypeData: Omit<ProductType, 'id' | 'businessUnit'> & { businessUnit: BusinessUnit }) => Promise<void>;
  handleSaveProductType: (updatedProductType: ProductType) => Promise<void>;
  handleDeleteProductType: (id: number) => Promise<void>;
  handleAddAlertBanner: (newAlertBannerData: Omit<AlertBanner, 'id'>) => Promise<void>;
  handleSaveAlertBanner: (updatedAlertBanner: AlertBanner) => Promise<void>;
  handleDeleteAlertBanner: (id: string) => Promise<void>;
  handleAddProduct: (newProductData: Omit<Product, 'id'>) => Promise<void>;
  handleUpdateProduct: (updatedProductData: Product) => Promise<void>;
  handleAddDispensary: (newDispensaryData: Omit<Dispensary, 'id'>) => Promise<void>;
  handleSaveDispensary: (updatedDispensary: Dispensary) => Promise<void>;
  handleDeleteDispensary: (id: string) => Promise<void>;
  handleAddUser: (newUserData: Omit<UserAccount, 'id'>) => Promise<void>;
  handleSaveUser: (updatedUser: UserAccount) => Promise<void>;
  handleDeleteUser: (userId: string) => Promise<void>;
  handleAddRole: (newRoleData: Omit<Role, 'id'>) => Promise<void>;
  handleSaveRole: (updatedRole: Role) => Promise<void>;
  handleDeleteRole: (roleId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
    const [view, setView] = useState<'public' | 'admin' | 'vmi'>('public');
    const [showLogin, setShowLogin] = useState(false);
    
    const [selectedPublicBrand, setSelectedPublicBrand] = useState<'fairwinds' | 'sunshine-pf' | null>(null);
    const [activeAdminBU, setActiveAdminBU] = useState<BusinessUnit>('sunshine');
  
    // Data states
    const [products, setProducts] = useState<Product[]>([]);
    const [dispensaries, setDispensaries] = useState<Dispensary[]>([]);
    const [users, setUsers] = useState<UserAccount[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [productTypes, setProductTypes] = useState<ProductType[]>([]);
    const [alertBanners, setAlertBanners] = useState<AlertBanner[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [vmiOrders, setVmiOrders] = useState<EnhancedVMIOrder[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    
    // Settings states
    const [allCategorySortOrders, setAllCategorySortOrders] = useState<any[]>([]);
    const [inventoryThresholds, setInventoryThresholds] = useState({ sunshine: 5, fairwinds: 5 });
    const [mobileNavConfig, _setMobileNavConfig] = useState<MobileNavItem[]>([]);

    // Other states
    const [uploadType, setUploadType] = useState<'products' | 'dispensaries' | null>(null);
    const csvUploadRef = useRef<HTMLInputElement>(null);
    const [messageBox, setMessageBox] = useState({ visible: false, message: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [scrapedInventory, setScrapedInventory] = useState<ScrapedInventoryItem[]>(seedScrapedInventory);
    const [scrapeLog, setScrapeLog] = useState<ScrapeLogEntry[]>([
      { timestamp: new Date(Date.now() - 3600 * 1000).toISOString(), summary: "Initial system sync completed. 5 products updated." }
    ]);
  
    // --- DATA FETCHING ---
    useEffect(() => {
        const fetchAllAdminData = async () => {
            setIsLoading(true);
            try {
                const data = await api.getAdminData();
                
                const {
                    products: rawProducts = [], dispensaries: rawDispensaries = [], users: rawUsers = [],
                    roles: rawRoles = [], productTypes: rawProductTypes = [], alertBanners: rawAlertBanners = [],
                    categories: rawCategories = [], orders: rawOrders = [], vmiOrders: rawVmiOrders = [],
                    notifications: rawNotifications = [], settings = {}
                } = data;

                const parsedProductTypes = rawProductTypes.map((pt: any) => ({ ...pt, price: typeof pt.price === 'string' ? parseFloat(pt.price) : pt.price }));

                setProducts(rawProducts);
                setDispensaries(rawDispensaries);
                setUsers(rawUsers);
                setRoles(rawRoles);
                setProductTypes(parsedProductTypes);
                setAlertBanners(rawAlertBanners);
                setCategories(rawCategories);
                setOrders(rawOrders);
                setVmiOrders(rawVmiOrders);
                setNotifications(rawNotifications);

                // Set settings state from fetched data
                const thresholds = {
                    sunshine: parseInt(settings.inventoryThresholds?.['inventory_threshold_sunshine'] || '5', 10),
                    fairwinds: parseInt(settings.inventoryThresholds?.['inventory_threshold_fairwinds'] || '5', 10),
                };
                setInventoryThresholds(thresholds);
                setAllCategorySortOrders(settings.categorySort || []);
                _setMobileNavConfig(settings.mobileNavConfig || []);

            } catch (error) {
                console.error(error);
                showMessage((error as Error).message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllAdminData();
    }, []);
  
    const showMessage = (message: string) => setMessageBox({ visible: true, message });
    const hideMessage = () => setMessageBox({ visible: false, message: '' });
  
    const handleLogin = async (username: string, password: string): Promise<string | null> => {
        setIsLoading(true);
        try {
            const { accessToken, user } = await api.login(username, password);
            setCurrentUser(user);
            if (user.businessUnits && user.businessUnits.length > 0) {
                setActiveAdminBU(user.businessUnits[0]);
            }
            setView('admin');
            setShowLogin(false);
            return null;
        } catch (error) {
            return (error as Error).message;
        } finally {
            setIsLoading(false);
        }
    };
  
    const onLogout = () => {
      setCurrentUser(null);
      setView('public');
      setSelectedPublicBrand(null);
    };
  
    const handleCheckRecoveryEmail = async (email: string): Promise<boolean> => {
        try {
            const response = await api.checkEmail(email);
            return response.exists;
        } catch (error) {
            console.error(error);
            showMessage('Could not connect to the server to verify email.');
            return false;
        }
    };

    const handleResetPassword = async (email: string, newPass: string) => {
        setIsLoading(true);
        try {
            const updatedUser = await api.resetPassword(email, newPass);
            // The API doesn't return business units, so we need to preserve them
            const existingUserBUs = users.find(u => u.email === email)?.businessUnits || [];
            const userWithBUs = { ...updatedUser, businessUnits: existingUserBUs };
            
            setUsers(prev => prev.map(u => (u.email.toLowerCase() === email.toLowerCase() ? userWithBUs : u)));
            showMessage(`Password for the account associated with ${email} has been successfully reset.`);
        } catch (error) {
            showMessage((error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };
    const handleSimulateScrape = async () => {
        setIsLoading(true);
        try {
            // The seedScrapedInventory is the payload for our simulated scrape
            const { updatedCount, notFoundSkus } = await api.syncInventory(seedScrapedInventory);

            // Update local products state for immediate UI feedback
            const updatedProducts = products.map(p => {
                const scrapedItem = seedScrapedInventory.find(s => s.sku === p.sku);
                if (scrapedItem) {
                    const newStock = scrapedItem.unitsForSale - scrapedItem.allocations;
                    return { ...p, qtyInStock: newStock };
                }
                return p;
            });
            setProducts(updatedProducts);

            // Update log
            const summary = `Sync complete. ${updatedCount} products updated.`;
            const newLogEntry = {
                timestamp: new Date().toISOString(),
                summary: notFoundSkus.length > 0 ? `${summary} Could not find ${notFoundSkus.length} SKUs.` : summary
            };
            setScrapeLog(prev => [newLogEntry, ...prev]);

            showMessage(summary);

        } catch (error) {
            showMessage((error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };
    const handleDownload = (type: 'products' | 'dispensaries') => {
      const headers = type === 'products'
        ? ["sku", "name", "description", "productType", "category", "topTerpenes", "genetics", "feelsLike", "alertBanner", "dohType", "businessUnit"]
        : ["licenseNumber", "name", "address", "phone", "email", "salesRepEmail"];
      
      const dataToDownload = type === 'products' ? products : dispensaries;

      const csvContent = [
        headers.join(','),
        ...dataToDownload.map(item => headers.map(header => {
            const camelHeader = header.replace(/ (\w)/g, (_, c) => c.toUpperCase());
            return `"${(item as any)[camelHeader] || ''}"`;
        }).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `${type}_export.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const handleUploadClick = (type: 'products' | 'dispensaries') => {
        setUploadType(type);
        csvUploadRef.current?.click();
    };

    const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const csvText = e.target?.result as string;
                const lines = csvText.split(/\r\n|\n/).filter(line => line.trim() !== '');
                if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row.");
                
                const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
                const data = lines.slice(1).map(line => {
                    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
                    return headers.reduce((obj, header, index) => {
                        const camelHeader = header.replace(/_([a-z])/g, g => g[1].toUpperCase());
                        obj[camelHeader] = values[index];
                        return obj;
                    }, {} as any);
                });

                if (uploadType === 'products') {
                    const { updatedProducts, message } = await api.bulkUploadProducts(data);
                    setProducts(updatedProducts);
                    showMessage(message);
                } else if (uploadType === 'dispensaries') {
                    const { updatedDispensaries, message } = await api.bulkUploadDispensaries(data);
                    setDispensaries(updatedDispensaries);
                    showMessage(message);
                }
            } catch (error) {
                showMessage((error as Error).message);
            } finally {
                setIsLoading(false);
                if (event.target) event.target.value = '';
            }
        };
        reader.readAsText(file);
    };
    
    const handlePlaceOrder = async (orderItems: OrderItem[], dispensary: Dispensary, onSuccess: () => void) => {
        if (orderItems.length === 0) { showMessage("Your cart is empty."); return; }
        setIsLoading(true);
        try {
            const ordersToCreate: any[] = [];
            const sunshineItems = orderItems.filter(item => item.businessUnit === 'sunshine');
            const fwPfItems = orderItems.filter(item => item.businessUnit === 'fairwinds' || item.businessUnit === 'passion-flower');

            if (sunshineItems.length > 0) {
                ordersToCreate.push({ id: `ord-${Date.now()}-sun`, date: new Date().toISOString(), dispensary, salesRepId: dispensary.salesRepId, items: sunshineItems, businessUnit: 'sunshine-pf' });
            }
            if (fwPfItems.length > 0) {
                 ordersToCreate.push({ id: `ord-${Date.now()}-fw`, date: new Date().toISOString(), dispensary, salesRepId: dispensary.salesRepId, items: fwPfItems, businessUnit: 'fairwinds' });
            }
            await api.placeOrders(ordersToCreate);
            setOrders(prev => [...prev, ...ordersToCreate.map(o => ({...o, salesRep: {name: dispensary.salesRepName, email: dispensary.salesRepEmail}}))]);
            showMessage("Order placed successfully!");
            onSuccess();
        } catch (error) { showMessage((error as Error).message); } 
        finally { setIsLoading(false); }
    };
  
    const handleCreateVMIProposal = async (dispensary: Dispensary, items: OrderItem[], currentBrand: 'fairwinds' | 'sunshine-pf') => {
        if (!currentUser) { showMessage("You must be logged in to create a proposal."); return; }
        setIsLoading(true);
        try {
            const proposalData = { dispensary, items, businessUnit: currentBrand, salesRepId: currentUser.id };
            const newProposal = await api.createVMIProposal(proposalData);
            setVmiOrders(prev => [...prev.filter(p => p.dispensary.id !== dispensary.id), newProposal]);
            showMessage(`New VMI proposal created for ${dispensary.name}.`);
        } catch (error) { showMessage((error as Error).message); } 
        finally { setIsLoading(false); }
    };

    const handleUpdateVMIProposal = async (order: EnhancedVMIOrder, newItems: OrderItem[], updatedBy: 'sales_rep' | 'dispensary') => {
        setIsLoading(true);
        try {
            const { newVersion } = await api.updateVMIProposal(order.id, { items: newItems, updatedBy });
            setVmiOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'pending_review', versions: [...o.versions, newVersion] } : o));
            showMessage(`Proposal for ${order.dispensary.name} updated successfully.`);
        } catch (error) { showMessage((error as Error).message); } 
        finally { setIsLoading(false); }
    };
    
    const handleDeleteVMIProposal = async (orderId: string) => {
        setIsLoading(true);
        try {
            await api.deleteVMIProposal(orderId);
            setVmiOrders(prev => prev.filter(o => o.id !== orderId));
            showMessage("VMI Proposal deleted successfully.");
        } catch (error) { showMessage((error as Error).message); } 
        finally { setIsLoading(false); }
    };
  
    const handleDownloadAllVMIOrders = () => {};

    // --- SETTINGS HANDLERS ---
    const setCategorySortOrder = async (newOrder: CategorySort[]) => {
        const buKey = activeAdminBU === 'sunshine' ? 'sunshine' : 'fairwinds';
        const oldOrders = [...allCategorySortOrders];
        const newAllOrders = [ ...oldOrders.filter(o => o.businessUnit !== buKey), ...newOrder.map(o => ({ categoryName: o.name, sortOrder: o.order, businessUnit: buKey }))];
        setAllCategorySortOrders(newAllOrders); // Optimistic update
        try {
            await api.updateCategorySort(buKey, newOrder);
        } catch (error) {
            setAllCategorySortOrders(oldOrders); // Revert
            showMessage('Failed to save category sort order.');
        }
    };
    const setMobileNavConfig = async (config: MobileNavItem[]) => {
        const oldConfig = [...mobileNavConfig];
        _setMobileNavConfig(config); // Optimistic update
        try {
            await api.updateMobileNav(config);
        } catch (error) {
            _setMobileNavConfig(oldConfig); // Revert
            showMessage('Failed to save mobile nav configuration.');
        }
    };
    const setInventoryThreshold = async (value: number) => {
        const buKey = activeAdminBU === 'sunshine' ? 'sunshine' : 'fairwinds';
        const oldThresholds = { ...inventoryThresholds };
        const newThresholds = { ...inventoryThresholds, [buKey]: value };
        setInventoryThresholds(newThresholds); // Optimistic update
        try {
            await api.updateInventoryThreshold(activeAdminBU, value);
        } catch (error) {
            setInventoryThresholds(oldThresholds); // Revert
            showMessage('Failed to save inventory threshold.');
        }
    };

    // --- CRUD HANDLERS ---
    const handleAddCategory = async (name: string, businessUnit: BusinessUnit) => {
        setIsLoading(true);
        try {
            const newCategoryData = { id: `cat-${Date.now()}`, name, businessUnit };
            const newCategory = await api.createCategory(newCategoryData);
            setCategories(prev => [...prev, newCategory]);
            showMessage(`Category "${newCategory.name}" created successfully.`);
        } catch (error) { showMessage((error as Error).message); } 
        finally { setIsLoading(false); }
    };
    const handleSaveCategory = async (updatedCategory: Category) => {
        setIsLoading(true);
        try {
            const savedCategory = await api.updateCategory(updatedCategory.id, { name: updatedCategory.name });
            setCategories(prev => prev.map(c => c.id === savedCategory.id ? savedCategory : c));
            showMessage(`Category "${savedCategory.name}" updated successfully.`);
        } catch (error) { showMessage((error as Error).message); } 
        finally { setIsLoading(false); }
    };
    const handleDeleteCategory = async (id: string) => {
        setIsLoading(true);
        try {
            await api.deleteCategory(id);
            setCategories(prev => prev.filter(c => c.id !== id));
            showMessage(`Category deleted successfully.`);
        } catch (error) { showMessage((error as Error).message); } 
        finally { setIsLoading(false); }
    };
    const handleAddProductType = async (newProductTypeData: Omit<ProductType, 'id' | 'businessUnit'> & { businessUnit: BusinessUnit }) => {
        setIsLoading(true);
        try {
            const newProductType = await api.createProductType(newProductTypeData);
            setProductTypes(prev => [...prev, newProductType]);
            showMessage(`Product type "${newProductType.name}" created successfully.`);
        } catch (error) { showMessage((error as Error).message); } 
        finally { setIsLoading(false); }
    };
    const handleSaveProductType = async (updatedProductType: ProductType) => {
        setIsLoading(true);
        try {
            const { id, businessUnit, ...updateData } = updatedProductType;
            const savedProductType = await api.updateProductType(id, updateData);
            setProductTypes(prev => prev.map(pt => pt.id === savedProductType.id ? savedProductType : pt));
            showMessage(`Product type "${savedProductType.name}" updated successfully.`);
        } catch (error) { showMessage((error as Error).message); } 
        finally { setIsLoading(false); }
    };
    const handleDeleteProductType = async (id: number) => {
        setIsLoading(true);
        try {
            await api.deleteProductType(id);
            setProductTypes(prev => prev.filter(pt => pt.id !== id));
            showMessage(`Product type deleted successfully.`);
        } catch (error) { showMessage((error as Error).message); } 
        finally { setIsLoading(false); }
    };
    const handleAddAlertBanner = async (newAlertBannerData: Omit<AlertBanner, 'id'>) => {
        setIsLoading(true);
        try {
            const bannerWithId = { ...newAlertBannerData, id: `banner-${Date.now()}` };
            const newAlertBanner = await api.createAlertBanner(bannerWithId);
            setAlertBanners(prev => [...prev, newAlertBanner]);
            showMessage(`Alert banner "${newAlertBanner.text}" created successfully.`);
        } catch (error) { showMessage((error as Error).message); } 
        finally { setIsLoading(false); }
    };
    const handleSaveAlertBanner = async (updatedAlertBanner: AlertBanner) => {
        setIsLoading(true);
        try {
            const { id, businessUnit, ...updateData } = updatedAlertBanner;
            const savedAlertBanner = await api.updateAlertBanner(id, updateData);
            setAlertBanners(prev => prev.map(ab => ab.id === savedAlertBanner.id ? savedAlertBanner : ab));
            showMessage(`Alert banner "${savedAlertBanner.text}" updated successfully.`);
        } catch (error) { showMessage((error as Error).message); } 
        finally { setIsLoading(false); }
    };
    const handleDeleteAlertBanner = async (id: string) => {
        setIsLoading(true);
        try {
            await api.deleteAlertBanner(id);
            setAlertBanners(prev => prev.filter(ab => ab.id !== id));
            showMessage(`Alert banner deleted successfully.`);
        } catch (error) { showMessage((error as Error).message); } 
        finally { setIsLoading(false); }
    };
    const handleAddProduct = async (newProductData: Omit<Product, 'id'>) => {
        setIsLoading(true);
        try {
            const newProduct = await api.createProduct(newProductData);
            setProducts(prev => [...prev, newProduct]);
            showMessage(`Product "${newProduct.name}" created successfully.`);
        } catch (error) { showMessage(`Product creation failed: ${(error as Error).message}.`); } 
        finally { setIsLoading(false); }
    };
    const handleUpdateProduct = async (updatedProductData: Product) => {
        setIsLoading(true);
        try {
            const { id, name, description, productType, category, sku, topTerpenes, genetics, feelsLike, alertBanner, dohType, businessUnit } = updatedProductData;
            const updatePayload = { name, description, productType, category, sku, topTerpenes, genetics, feelsLike, alertBanner, dohType, businessUnit };
            const returnedProductFromServer = await api.updateProduct(id, updatePayload);
            setProducts(prev => prev.map(p => p.id === returnedProductFromServer.id ? returnedProductFromServer : p));
            showMessage(`Product "${returnedProductFromServer.name}" updated successfully.`);
        } catch (error) { showMessage(`Product update failed: ${(error as Error).message}.`); } 
        finally { setIsLoading(false); }
    };
    const handleAddDispensary = async (newDispensaryData: Omit<Dispensary, 'id'>) => {
        setIsLoading(true);
        try {
            const newDispensary = await api.createDispensary(newDispensaryData);
            setDispensaries(prev => [...prev, newDispensary]);
            showMessage(`Dispensary "${newDispensary.name}" created successfully.`);
        } catch (error) { showMessage((error as Error).message); } 
        finally { setIsLoading(false); }
    };
    const handleSaveDispensary = async (updatedDispensary: Dispensary) => {
        setIsLoading(true);
        try {
            const savedDispensary = await api.updateDispensary(updatedDispensary.id, updatedDispensary);
            setDispensaries(prev => prev.map(d => d.id === savedDispensary.id ? savedDispensary : d));
            showMessage(`Dispensary "${savedDispensary.name}" updated successfully.`);
        } catch (error) { showMessage((error as Error).message); } 
        finally { setIsLoading(false); }
    };
    const handleDeleteDispensary = async (id: string) => {
        setIsLoading(true);
        try {
            await api.deleteDispensary(id);
            setDispensaries(prev => prev.filter(d => d.id !== id));
            showMessage(`Dispensary deleted successfully.`);
        } catch (error) { showMessage((error as Error).message); } 
        finally { setIsLoading(false); }
    };
    const handleAddUser = async (newUserData: Omit<UserAccount, 'id'>) => {
        setIsLoading(true);
        try {
            const newUser = await api.createUser(newUserData);
            setUsers(prev => [...prev, newUser]);
            showMessage(`User "${newUser.username}" created.`);
        } catch (error) { showMessage((error as Error).message); } 
        finally { setIsLoading(false); }
    };
    const handleSaveUser = async (updatedUser: UserAccount) => {
        setIsLoading(true);
        try {
            const savedUser = await api.updateUser(updatedUser.id, updatedUser);
            setUsers(prev => prev.map(u => u.id === savedUser.id ? { ...u, ...savedUser } : u));
            if (currentUser?.id === savedUser.id) { setCurrentUser(prev => prev ? { ...prev, ...savedUser } : null); }
            showMessage(`User "${savedUser.username}" updated.`);
        } catch (error) { showMessage((error as Error).message); }
        finally { setIsLoading(false); }
    };
    const handleDeleteUser = async (userId: string) => {
        setIsLoading(true);
        try {
            await api.deleteUser(userId);
            setUsers(prev => prev.filter(u => u.id !== userId));
            showMessage('User deleted.');
        } catch (error) { showMessage((error as Error).message); }
        finally { setIsLoading(false); }
    };
    const handleAddRole = async (newRoleData: Omit<Role, 'id'>) => {
        setIsLoading(true);
        try {
            const roleWithId = { ...newRoleData, id: `role-${Date.now()}`};
            const newRole = await api.createRole(roleWithId);
            setRoles(prev => [...prev, newRole]);
            showMessage(`Role "${newRole.name}" created.`);
        } catch (error) { showMessage((error as Error).message); }
        finally { setIsLoading(false); }
    };
    const handleSaveRole = async (updatedRole: Role) => {
        setIsLoading(true);
        try {
            const savedRole = await api.updateRole(updatedRole.id, updatedRole);
            setRoles(prev => prev.map(r => r.id === savedRole.id ? savedRole : r));
            showMessage(`Role "${savedRole.name}" updated.`);
        } catch (error) { showMessage((error as Error).message); }
        finally { setIsLoading(false); }
    };
    const handleDeleteRole = async (roleId: string) => {
        setIsLoading(true);
        try {
            await api.deleteRole(roleId);
            setRoles(prev => prev.filter(r => r.id !== roleId));
            showMessage('Role deleted.');
        } catch (error) { showMessage((error as Error).message); }
        finally { setIsLoading(false); }
    };

    // --- MEMOIZED DERIVED STATE ---
    const adminData = useMemo(() => ({
          products: products.filter(p => {
              if (activeAdminBU === 'sunshine') return p.businessUnit === 'sunshine';
              return p.businessUnit === 'fairwinds' || p.businessUnit === 'passion-flower';
          }),
          productTypes: productTypes.filter(pt => {
              if (activeAdminBU === 'sunshine') return pt.businessUnit === 'sunshine';
              return pt.businessUnit === 'fairwinds' || pt.businessUnit === 'passion-flower';
          }),
          categories: categories.filter(c => {
              if (activeAdminBU === 'sunshine') return c.businessUnit === 'sunshine';
              return c.businessUnit === 'fairwinds' || c.businessUnit === 'passion-flower';
          }),
          dispensaries: dispensaries,
          alertBanners: alertBanners.filter(ab => {
               if (activeAdminBU === 'sunshine') return ab.businessUnit === 'sunshine';
              return ab.businessUnit === 'fairwinds' || ab.businessUnit === 'passion-flower';
          }),
          orders: orders.filter(o => {
              if (activeAdminBU === 'sunshine' && o.businessUnit === 'sunshine-pf') return true;
              if (activeAdminBU === 'fairwinds' && o.businessUnit === 'fairwinds') return true;
              if (activeAdminBU === 'passion-flower' && o.businessUnit === 'fairwinds') return true; // Assuming PF maps to FW orders
              return false;
          }),
          vmiOrders: vmiOrders.filter(vo => {
              if (activeAdminBU === 'sunshine' && vo.businessUnit === 'sunshine-pf') return true;
              if (activeAdminBU === 'fairwinds' && vo.businessUnit === 'fairwinds') return true;
              if (activeAdminBU === 'passion-flower' && vo.businessUnit === 'fairwinds') return true;
              return false;
          }),
    }), [products, productTypes, categories, dispensaries, alertBanners, orders, vmiOrders, activeAdminBU]);
  
    const inventoryThreshold = useMemo(() => {
        return activeAdminBU === 'sunshine' ? inventoryThresholds.sunshine : inventoryThresholds.fairwinds;
    }, [activeAdminBU, inventoryThresholds]);
    
    const categorySortOrder = useMemo(() => {
        const brandKey = activeAdminBU === 'sunshine' ? 'sunshine' : 'fairwinds';
        const relevantCategories = adminData.categories.map((c: Category) => c.name);
        const sorted = allCategorySortOrders
            .filter(s => s.businessUnit === brandKey)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map(s => ({ name: s.categoryName, order: s.sortOrder }));
        const sortedNames = new Set(sorted.map(s => s.name));
        const newCategories = relevantCategories.filter((name: string) => !sortedNames.has(name));
        const combined = [...sorted, ...newCategories.map((name, i) => ({ name, order: sorted.length + i + 1 }))];
        return combined;
    }, [activeAdminBU, allCategorySortOrders, adminData.categories]);

    const publicData = useMemo(() => ({
          products: products.filter(p => {
              if (p.qtyInStock <= (p.businessUnit === 'sunshine' ? inventoryThresholds.sunshine : inventoryThresholds.fairwinds)) return false;
              if (selectedPublicBrand === 'fairwinds') return p.businessUnit === 'fairwinds';
              if (selectedPublicBrand === 'sunshine-pf') return p.businessUnit === 'sunshine' || p.businessUnit === 'passion-flower';
              return false;
          }),
          productTypes: productTypes.filter(pt => {
              if (selectedPublicBrand === 'fairwinds') return pt.businessUnit === 'fairwinds';
              if (selectedPublicBrand === 'sunshine-pf') return pt.businessUnit === 'sunshine' || pt.businessUnit === 'passion-flower';
              return false;
          }),
          dispensaries: dispensaries,
          alertBanners: alertBanners.filter(ab => {
              if (selectedPublicBrand === 'fairwinds') return ab.businessUnit === 'fairwinds';
              if (selectedPublicBrand === 'sunshine-pf') return ab.businessUnit === 'sunshine' || ab.businessUnit === 'passion-flower';
              return false;
          }),
          orders: orders.filter(o => o.businessUnit === selectedPublicBrand),
          vmiOrders: vmiOrders.filter(vo => vo.businessUnit === selectedPublicBrand),
      }), [products, productTypes, dispensaries, alertBanners, orders, vmiOrders, selectedPublicBrand, inventoryThresholds]);
  
      const { userNotifications, unreadCount, unreadSidebarCounts } = useMemo(() => {
          if (!currentUser) return { userNotifications: [], unreadCount: 0, unreadSidebarCounts: {} };
          const userRole = roles.find(r => r.id === currentUser.roleId);
          const isAdmin = userRole?.name === 'Admin' || userRole?.name === 'Super Admin';
          const filtered = isAdmin ? notifications : notifications.filter(n => n.userId === currentUser.id);
          const counts = filtered.reduce((acc, n) => {
              if (!n.isRead) {
                  if (n.businessUnit === 'sunshine') {
                      if (n.type === 'order-regular') acc.sunshine.regular++; else acc.sunshine.vmi++;
                  } else {
                      if (n.type === 'order-regular') acc.fwpf.regular++; else acc.fwpf.vmi++;
                  }
              }
              return acc;
          }, { sunshine: { regular: 0, vmi: 0 }, fwpf: { regular: 0, vmi: 0 } });
          return { userNotifications: filtered, unreadCount: filtered.filter(n => !n.isRead).length, unreadSidebarCounts: counts };
      }, [notifications, currentUser, roles]);
  
    const markNotificationAsRead = async (id: string) => {
        const originalNotifications = [...notifications];
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        try {
            await api.markNotificationAsRead(id);
        } catch (error) {
            setNotifications(originalNotifications); // Revert on failure
            showMessage((error as Error).message);
        }
    };

    const markNotificationsAsReadForView = async (tab: 'orders-received', businessUnit: BusinessUnit) => {
        const originalNotifications = [...notifications];
        const idsToUpdate: string[] = [];

        const updatedNotifications = notifications.map(n => {
            const buMatch = (businessUnit === 'sunshine' && n.businessUnit === 'sunshine') ||
                            (businessUnit !== 'sunshine' && n.businessUnit === 'fairwinds');
            
            const typeMatch = tab === 'orders-received' && (n.type === 'order-regular' || n.type === 'order-vmi');
            
            if (typeMatch && buMatch && !n.isRead) {
                idsToUpdate.push(n.id);
                return { ...n, isRead: true };
            }
            return n;
        });

        if (idsToUpdate.length > 0) {
            setNotifications(updatedNotifications); // Optimistic update
            try {
                await api.markNotificationsAsReadBulk(idsToUpdate);
            } catch (error) {
                setNotifications(originalNotifications); // Revert on failure
                showMessage((error as Error).message);
            }
        }
    };

    const value: AppContextType = {
        currentUser, setCurrentUser,
        view, setView,
        showLogin, setShowLogin,
        selectedPublicBrand, setSelectedPublicBrand,
        activeAdminBU, setActiveAdminBU,
        products, setProducts,
        allProducts: products,
        dispensaries, setDispensaries,
        users, setUsers,
        roles, setRoles,
        productTypes, setProductTypes,
        alertBanners, setAlertBanners,
        categories, setCategories,
        categorySortOrder, setCategorySortOrder,
        orders, setOrders,
        vmiOrders, setVmiOrders,
        notifications, setNotifications,
        uploadType,
        csvUploadRef,
        messageBox,
        hideMessage,
        showMessage,
        isLoading, setIsLoading,
        scrapedInventory,
        inventoryThreshold, setInventoryThreshold,
        scrapeLog,
        mobileNavConfig, setMobileNavConfig,
        handleLogin, onLogout,
        handleCheckRecoveryEmail,
        handleResetPassword,
        handleSimulateScrape,
        handleDownload,
        handleUploadClick,
        handleCSVUpload,
        handlePlaceOrder,
        handleCreateVMIProposal,
        handleUpdateVMIProposal,
        handleDeleteVMIProposal,
        handleDownloadAllVMIOrders,
        adminData,
        publicData,
        userNotifications,
        unreadCount,
        unreadSidebarCounts,
        markNotificationAsRead,
        markNotificationsAsReadForView,
        handleAddCategory, handleSaveCategory, handleDeleteCategory,
        handleAddProductType, handleSaveProductType, handleDeleteProductType,
        handleAddAlertBanner, handleSaveAlertBanner, handleDeleteAlertBanner,
        handleAddProduct,
        handleUpdateProduct,
        handleAddDispensary, handleSaveDispensary, handleDeleteDispensary,
        handleAddUser, handleSaveUser, handleDeleteUser,
        handleAddRole, handleSaveRole, handleDeleteRole,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}