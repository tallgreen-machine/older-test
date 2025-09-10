
import type { Product, Dispensary, UserAccount, AlertBanner, ProductType, EnhancedVMIOrder, ScrapedInventoryItem, Order, Role, PermissionSet, Category } from './types';

export const fmt = (n: number) => `$${n.toFixed(2)}`;
export const dohTypes: Product['dohType'][] = ["DOH-General Use", "DOH-High THC", "DOH-High CBD", "None"];

export const seedCategories: Category[] = [
    // Sunshine
    { id: 'cat-sun-1', name: 'Flower', businessUnit: 'sunshine' },
    { id: 'cat-sun-2', name: 'Pre-Rolls', businessUnit: 'sunshine' },
    { id: 'cat-sun-3', name: 'Vape', businessUnit: 'sunshine' },
    { id: 'cat-sun-4', name: 'Edibles', businessUnit: 'sunshine' },
    { id: 'cat-sun-5', name: 'Concentrates', businessUnit: 'sunshine' },
    // Fairwinds
    { id: 'cat-fw-1', name: 'Tinctures', businessUnit: 'fairwinds' },
    { id: 'cat-fw-2', name: 'Capsules', businessUnit: 'fairwinds' },
    { id: 'cat-fw-3', name: 'Topicals', businessUnit: 'fairwinds' },
    { id: 'cat-fw-4', name: 'Vape', businessUnit: 'fairwinds' },
    { id: 'cat-fw-5', name: 'Pets', businessUnit: 'fairwinds' },
    // Passion Flower
    { id: 'cat-pf-1', name: 'Flower', businessUnit: 'passion-flower' },
    { id: 'cat-pf-2', name: 'Infused Pre-Rolls', businessUnit: 'passion-flower' },
];

export const ALL_PERMISSIONS: PermissionSet = {
  products: { view: true, edit: true, create: true, delete: true },
  productTypes: { view: true, edit: true, create: true, delete: true },
  categorySort: { view: true, edit: true },
  alertBanners: { view: true, edit: true, create: true, delete: true },
  ordersRegular: { view: true },
  ordersVmi: { view: true, edit: true, delete: true },
  dispensaries: { view: true, edit: true, create: true, delete: true },
  users: { view: true, edit: true, create: true, delete: true },
  roles: { view: true, edit: true, create: true, delete: true },
  inventory: { view: true, edit: true },
  mobileNav: { view: true, edit: true },
  categories: { view: true, edit: true, create: true, delete: true },
};

const NO_PERMISSIONS = Object.keys(ALL_PERMISSIONS).reduce((acc, key) => {
    acc[key as keyof PermissionSet] = Object.keys(ALL_PERMISSIONS[key as keyof PermissionSet]).reduce((pAcc, pKey) => {
        (pAcc as any)[pKey] = false;
        return pAcc;
    }, {} as any);
    return acc;
}, {} as PermissionSet);

export const seedRoles: Role[] = [
    {
        id: 'role-super-admin',
        name: 'Super Admin',
        permissions: ALL_PERMISSIONS,
    },
    {
        id: 'role-admin',
        name: 'Admin',
        permissions: ALL_PERMISSIONS,
    },
    {
        id: 'role-sales',
        name: 'Sales Rep',
        permissions: {
            ...NO_PERMISSIONS,
            products: { view: true, edit: false, create: false, delete: false },
            ordersRegular: { view: true },
            ordersVmi: { view: true, edit: true, delete: false },
            dispensaries: { view: true, edit: false, create: false, delete: false },
            users: { view: true, edit: false, create: false, delete: false }, // Allows viewing user manager for self-edit
            inventory: { view: true, edit: false },
        },
    }
];

// FIX: Added the missing 'id' property to each ProductType object.
export const seedProductTypes: ProductType[] = [
    // Sunshine
    { id: 1, name: "Flower - 3.5g", price: 25.00, image: "https://placehold.co/400x400/e2e8f0/475569?text=Product", category: "Flower", businessUnit: 'sunshine' },
    { id: 2, name: "Flower - 7g", price: 45.00, image: "https://placehold.co/400x400/e2e8f0/475569?text=Product", category: "Flower", businessUnit: 'sunshine' },
    { id: 3, name: "Vape - 1g", price: 35.00, image: "https://placehold.co/400x400/e2e8f0/475569?text=Product", category: "Vape", businessUnit: 'sunshine' },
    { id: 4, name: "Pre-Roll - 1.5g Infused", price: 15.00, image: "https://placehold.co/400x400/e2e8f0/475569?text=Product", category: "Pre-Rolls", businessUnit: 'sunshine' },
    { id: 5, name: "Edible - 100mg Gummies", price: 20.00, image: "https://placehold.co/400x400/e2e8f0/475569?text=Product", category: "Edibles", businessUnit: 'sunshine' },
    { id: 6, name: "Concentrate - 1g", price: 30.00, image: "https://placehold.co/400x400/e2e8f0/475569?text=Product", category: "Concentrates", businessUnit: 'sunshine' },

    // Fairwinds
    { id: 7, name: "Vape Cartridge - 0.5g", price: 30.00, image: "https://placehold.co/400x400/e2e8f0/475569?text=Product", category: "Vape", businessUnit: 'fairwinds' },
    { id: 8, name: "Tincture - 30ml", price: 55.00, image: "https://placehold.co/400x400/e2e8f0/475569?text=Product", category: "Tinctures", businessUnit: 'fairwinds' },
    { id: 9, name: "Capsules - 10 pack", price: 40.00, image: "https://placehold.co/400x400/e2e8f0/475569?text=Product", category: "Capsules", businessUnit: 'fairwinds' },
    { id: 10, name: "Flow Cream - 50ml", price: 60.00, image: "https://placehold.co/400x400/e2e8f0/475569?text=Product", category: "Topicals", businessUnit: 'fairwinds' },
    { id: 11, name: "Companion Tincture", price: 45.00, image: "https://placehold.co/400x400/e2e8f0/475569?text=Product", category: "Pets", businessUnit: 'fairwinds' },

    // Passion Flower
    { id: 12, name: "PF Flower - 3.5g", price: 30.00, image: "https://placehold.co/400x400/e2e8f0/475569?text=Product", category: "Flower", businessUnit: 'passion-flower' },
    { id: 13, name: "PF Infused Pre-Roll - 1g", price: 18.00, image: "https://placehold.co/400x400/e2e8f0/475569?text=Product", category: "Infused Pre-Rolls", businessUnit: 'passion-flower' },
];

export const seedProducts: Product[] = [
    // Sunshine
    { id: 'prod-sun-1', name: 'Pineapple Express', description: "Sweet, tropical, cedar. Energetic, happy, creative.", productType: 'Flower - 3.5g', category: 'Flower', sku: 'SUN-FL-PEX-35', topTerpenes: 'Terpinolene, Myrcene', genetics: 'Sativa', feelsLike: 'Energetic, Happy', alertBanner: 'new-sun', qtyInStock: 0, dohType: 'DOH-High THC', businessUnit: 'sunshine' },
    { id: 'prod-sun-2', name: 'GG4', description: "Earthy, pungent, pine. Relaxed, happy, euphoric.", productType: 'Flower - 7g', category: 'Flower', sku: 'SUN-FL-GG4-70', topTerpenes: 'Caryophyllene, Limonene', genetics: 'Indica', feelsLike: 'Relaxed, Euphoric', alertBanner: null, qtyInStock: 0, dohType: 'DOH-High THC', businessUnit: 'sunshine' },
    { id: 'prod-sun-3', name: 'Durban Poison Vape', description: "Earthy, sweet, pine. Energetic, focused, creative.", productType: 'Vape - 1g', category: 'Vape', sku: 'SUN-VP-DBP-10', topTerpenes: 'Terpinolene, Myrcene', genetics: 'Sativa', feelsLike: 'Energetic, Focused', alertBanner: null, qtyInStock: 0, dohType: 'DOH-High THC', businessUnit: 'sunshine' },
    { id: 'prod-sun-4', name: 'Glue Infused Pre-Roll', description: "Earthy, pungent, pine. Relaxed, happy, euphoric.", productType: 'Pre-Roll - 1.5g Infused', category: 'Pre-Rolls', sku: 'SUN-PR-GLU-15', topTerpenes: 'Caryophyllene, Myrcene', genetics: 'Hybrid', feelsLike: 'Relaxed, Happy', alertBanner: 'limited-sun', qtyInStock: 0, dohType: 'DOH-High THC', businessUnit: 'sunshine' },
    { id: 'prod-sun-5', name: 'Raspberry Lemonade Gummies', description: "Sweet raspberry with tart lemon. Uplifted, creative, and happy.", productType: 'Edible - 100mg Gummies', category: 'Edibles', sku: 'SUN-ED-RLG-100', topTerpenes: 'N/A', genetics: 'Sativa', feelsLike: 'Uplifted, Creative', alertBanner: null, qtyInStock: 0, dohType: 'DOH-General Use', businessUnit: 'sunshine' },
    { id: 'prod-sun-6', name: 'Animal Mintz Sugar Wax', description: "Sweet, minty, pungent. Relaxed, happy, hungry.", productType: 'Concentrate - 1g', category: 'Concentrates', sku: 'SUN-CN-AMZ-10', topTerpenes: 'Limonene, Caryophyllene', genetics: 'Indica', feelsLike: 'Relaxed, Happy', alertBanner: null, qtyInStock: 0, dohType: 'DOH-High THC', businessUnit: 'sunshine' },
    
    // Fairwinds
    { id: 'prod-fw-1', name: 'Lifestyle Cat2 Vape', description: "The classic cannabis experience for those who like to keep it simple.", productType: 'Vape Cartridge - 0.5g', category: 'Vape', sku: 'FW-VP-LS2-05', topTerpenes: 'N/A', genetics: 'Hybrid', feelsLike: 'Balanced, Relaxed', alertBanner: 'new-fw', qtyInStock: 0, dohType: 'DOH-High THC', businessUnit: 'fairwinds' },
    { id: 'prod-fw-2', name: 'Ratio Series 20:1 Tincture', description: "Clear, calm, and collected. Powerful results with a clear head.", productType: 'Tincture - 30ml', category: 'Tinctures', sku: 'FW-TN-R20-30', topTerpenes: 'N/A', genetics: 'CBD', feelsLike: 'Calm, Clear, Relaxed', alertBanner: null, qtyInStock: 0, dohType: 'DOH-High CBD', businessUnit: 'fairwinds' },
    { id: 'prod-fw-3', name: 'Ratio Series 5:1 Capsules', description: "Support your body and mind to get you through the day.", productType: 'Capsules - 10 pack', category: 'Capsules', sku: 'FW-CP-R5-10', topTerpenes: 'N/A', genetics: 'CBD', feelsLike: 'Focused, Calm', alertBanner: null, qtyInStock: 0, dohType: 'DOH-General Use', businessUnit: 'fairwinds' },
    { id: 'prod-fw-4', name: 'Flow Cream', description: "Cooling menthol & warming capsicum provide instant relief.", productType: 'Flow Cream - 50ml', category: 'Topicals', sku: 'FW-TP-FLW-50', topTerpenes: 'N/A', genetics: 'CBD', feelsLike: 'Relief, Soothing', alertBanner: null, qtyInStock: 0, dohType: 'DOH-General Use', businessUnit: 'fairwinds' },
    { id: 'prod-fw-5', name: 'Companion Bacon Tincture', description: "A daily use tincture to help your best friend live their best life.", productType: 'Companion Tincture', category: 'Pets', sku: 'FW-PT-CMP-30', topTerpenes: 'N/A', genetics: 'CBD', feelsLike: 'Pet Wellness', alertBanner: null, qtyInStock: 0, dohType: 'None', businessUnit: 'fairwinds' },
    { id: 'prod-fw-6', name: 'Digestify Tincture', description: "Support for a happy tummy and a healthy GI tract.", productType: 'Tincture - 30ml', category: 'Tinctures', sku: 'FW-TN-DIG-30', topTerpenes: 'N/A', genetics: 'Herbal', feelsLike: 'Digestive Support', alertBanner: null, qtyInStock: 0, dohType: 'DOH-General Use', businessUnit: 'fairwinds' },
    
    // Passion Flower
    { id: 'prod-pf-1', name: 'Blueberry Flower', description: "Sweet berries, earthy. Relaxed, happy, sleepy.", productType: 'PF Flower - 3.5g', category: 'Flower', sku: 'PF-FL-BBR-35', topTerpenes: 'Myrcene, Caryophyllene', genetics: 'Indica', feelsLike: 'Relaxed, Sleepy', alertBanner: null, qtyInStock: 0, dohType: 'DOH-High THC', businessUnit: 'passion-flower' },
    { id: 'prod-pf-2', name: 'Dutch Treat Infused Pre-Roll', description: "Sweet pine, eucalyptus. Relaxed, happy, euphoric.", productType: 'PF Infused Pre-Roll - 1g', category: 'Infused Pre-Rolls', sku: 'PF-PR-DTR-10', topTerpenes: 'Terpinolene, Myrcene', genetics: 'Indica', feelsLike: 'Relaxed, Euphoric', alertBanner: null, qtyInStock: 0, dohType: 'DOH-High THC', businessUnit: 'passion-flower' },
    { id: 'prod-pf-3', name: 'MAC 1 Flower', description: "Citrus, diesel, spice. Happy, creative, uplifted.", productType: 'PF Flower - 3.5g', category: 'Flower', sku: 'PF-FL-MAC-35', topTerpenes: 'Limonene, Caryophyllene', genetics: 'Hybrid', feelsLike: 'Happy, Creative', alertBanner: null, qtyInStock: 0, dohType: 'DOH-High THC', businessUnit: 'passion-flower' },
];

export const seedDispensaries: Dispensary[] = [
  { id: "disp-1", name: "Sunshine Dispensary — Downtown", address: "123 Main St, Springfield, WA", phone: "(555) 123-4567", licenseNumber: "1234", email: "downtown@sunshine.com", salesRepName: "John Doe", salesRepEmail: "johndoe@sunshine.com", salesRepId: "user-2" },
  { id: "disp-2", name: "Green Leaf Wellness", address: "456 Oak Ave, Metropolis, WA", phone: "(555) 987-6543", licenseNumber: "426849", email: "contact@greenleaf.com", salesRepName: "John Doe", salesRepEmail: "johndoe@sunshine.com", salesRepId: "user-2" },
  { id: "disp-3", name: "The Herbalist", address: "789 Pine Ln, Gotham, WA", phone: "(555) 222-3333", licenseNumber: "654321", email: "orders@theherbalist.com", salesRepName: "Maria Garcia", salesRepEmail: "mariag@fwpf.com", salesRepId: "user-4" },
  { id: "disp-4", name: "Emerald City Cannabis", address: "101 Flower Rd, Central City, WA", phone: "(555) 444-5555", licenseNumber: "111222", email: "manager@emeraldcannabis.com", salesRepName: "Maria Garcia", salesRepEmail: "mariag@fwpf.com", salesRepId: "user-4" },
];

export const seedUsers: UserAccount[] = [
    { id: 'user-1', username: 'superadmin', password: '1234', email: 'jasonc@fairwindsmanufacturing.com', roleId: 'role-super-admin', profilePicture: 'https://placehold.co/150x150/e2e8f0/475569?text=User', businessUnits: ['sunshine', 'fairwinds', 'passion-flower'] },
    { id: 'user-2', username: 'johndoe', password: 'password', email: 'johndoe@sunshine.com', roleId: 'role-sales', profilePicture: 'https://placehold.co/150x150/e2e8f0/475569?text=User', businessUnits: ['sunshine', 'fairwinds', 'passion-flower'] },
    { id: 'user-3', username: 'admin', password: '1234', email: 'admin@sunshine.com', roleId: 'role-admin', profilePicture: 'https://placehold.co/150x150/e2e8f0/475569?text=User', businessUnits: ['sunshine', 'fairwinds', 'passion-flower'] },
    { id: 'user-4', username: 'mariag', password: 'password', email: 'mariag@fwpf.com', roleId: 'role-sales', profilePicture: 'https://placehold.co/150x150/e2e8f0/475569?text=User', businessUnits: ['sunshine', 'fairwinds', 'passion-flower'] },
];

export const seedAlertBanners: AlertBanner[] = [
    { id: 'new-sun', text: 'New', color: '#ef4444', businessUnit: 'sunshine' },
    { id: 'limited-sun', text: 'Limited', color: '#3b82f6', businessUnit: 'sunshine' },
    { id: 'new-fw', text: 'New Item!', color: '#10b981', businessUnit: 'fairwinds' },
];

export const seedOrders: Order[] = [
  {
    id: 'ord-seed-1',
    date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    dispensary: seedDispensaries[2],
    salesRep: { name: 'Maria Garcia', email: 'mariag@fwpf.com' },
    salesRepId: 'user-4',
    items: [
      { id: 'prod-fw-2', name: 'Ratio Series 20:1 Tincture', productType: 'Tincture - 30ml', price: 55.00, orderQty: 5, lineTotal: 275.00, sku: 'FW-TN-R20-30', category: 'Tinctures', businessUnit: 'fairwinds' }
    ],
    businessUnit: 'fairwinds',
  }
];

export const seedEnhancedVMIOrders: EnhancedVMIOrder[] = [
  {
    id: 'vmi-prop-1',
    dispensary: seedDispensaries[0],
    salesRep: { name: 'John Doe', email: 'johndoe@sunshine.com' },
    salesRepId: 'user-2',
    status: 'pending_review',
    link: 'http://example.com/vmi/vmi-prop-1/v2',
    isActive: true,
    versions: [
      {
        versionNumber: 1,
        createdBy: 'sales_rep',
        createdAt: '2025-08-28T10:00:00Z',
        items: [
          { id: 'prod-sun-2', name: 'GG4', productType: "Flower - 7g", price: 45.00, orderQty: 10, lineTotal: 450.00, sku: 'SUN-FL-GG4-70', category: 'Flower', businessUnit: 'sunshine' },
        ],
      },
      {
        versionNumber: 2,
        createdBy: 'dispensary',
        createdAt: '2025-08-29T14:30:00Z',
        items: [
          { id: 'prod-sun-2', name: 'GG4', productType: "Flower - 7g", price: 45.00, orderQty: 8, lineTotal: 360.00, sku: 'SUN-FL-GG4-70', category: 'Flower', businessUnit: 'sunshine' },
        ],
        changes: [
          { type: 'quantity_change', productId: 'prod-sun-2', productName: 'GG4', previousValue: 10, newValue: 8 },
        ]
      }
    ],
    businessUnit: 'sunshine-pf',
  }
];

export const seedScrapedInventory: ScrapedInventoryItem[] = [
    { sku: 'SUN-FL-PEX-35', productName: 'Pineapple Express', unitsForSale: 50, allocations: 5, status: 'active' },
    { sku: 'SUN-FL-GG4-70', productName: 'GG4', unitsForSale: 45, allocations: 2, status: 'active' },
    { sku: 'SUN-VP-DBP-10', productName: 'Durban Poison Vape', unitsForSale: 60, allocations: 10, status: 'active' },
    { sku: 'SUN-PR-GLU-15', productName: 'Glue Infused Pre-Roll', unitsForSale: 30, allocations: 0, status: 'active' },
    { sku: 'SUN-ED-RLG-100', productName: 'Raspberry Lemonade Gummies', unitsForSale: 75, allocations: 15, status: 'active' },
    { sku: 'SUN-CN-AMZ-10', productName: 'Animal Mintz Sugar Wax', unitsForSale: 25, allocations: 5, status: 'active' },
    { sku: 'FW-VP-LS2-05', productName: 'Lifestyle Cat2 Vape', unitsForSale: 80, allocations: 3, status: 'active' },
    { sku: 'FW-TN-R20-30', productName: 'Ratio Series 20:1 Tincture', unitsForSale: 40, allocations: 7, status: 'active' },
    { sku: 'FW-CP-R5-10', productName: 'Ratio Series 5:1 Capsules', unitsForSale: 55, allocations: 10, status: 'active' },
    { sku: 'FW-TP-FLW-50', productName: 'Flow Cream', unitsForSale: 35, allocations: 5, status: 'active' },
    { sku: 'FW-PT-CMP-30', productName: 'Companion Bacon Tincture', unitsForSale: 0, allocations: 0, status: 'inactive' },
    { sku: 'FW-TN-DIG-30', productName: 'Digestify Tincture', unitsForSale: 33, allocations: 3, status: 'active' },
    { sku: 'PF-FL-BBR-35', productName: 'Blueberry Flower', unitsForSale: 65, allocations: 12, status: 'active' },
    { sku: 'PF-PR-DTR-10', productName: 'Dutch Treat Infused Pre-Roll', unitsForSale: 90, allocations: 20, status: 'active' },
    { sku: 'PF-FL-MAC-35', productName: 'MAC 1 Flower', unitsForSale: 50, allocations: 8, status: 'active' },
];
