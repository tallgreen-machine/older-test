import React, { useState, useMemo } from "react";
// FIX: Import the 'User' icon from 'lucide-react'.
import { Store, Package, ShoppingCart, Eye, LogOut, Users, User, ShieldCheck, ChevronDown, Menu, MoreHorizontal, RefreshCw, Layers, ListOrdered, Tag, Smartphone, Database, LayoutDashboard, Pencil, Folder, BellRing, Inbox, Bug } from "lucide-react";
import type { Dispensary, Product, ProductType, CategorySort, AlertBanner, UserAccount, Order, EnhancedVMIOrder, ScrapedInventoryItem, ScrapeLogEntry, MobileNavItem, Role, PermissionSet, BusinessUnit, Category, Notification, CombinedOrder } from '../../types';
import { Button, Card } from '../ui';
import { AdminSidebar } from './AdminSidebar';
import { DispensaryManager } from './managers/DispensaryManager';
import { ProductManager } from './managers/ProductManager';
import { UserManager } from './managers/UserManager';
import { RoleManager } from './managers/RoleManager';
import { OrdersReceivedManager } from './managers/OrdersReceivedManager';
// FIX: Import `DataScrapeLogModal` from its own module instead of from `InventorySyncManager` to resolve the export error.
import { InventorySyncManager } from './managers/InventorySyncManager';
import { DataScrapeLogModal } from './managers/DataScrapeLogModal';
import { ProductTypesManager } from './managers/ProductTypesManager';
import { CategorySortManager } from './managers/CategorySortManager';
import { AlertBannersManager } from './managers/AlertBannersManager';
import { MobileNavManager } from './managers/MobileNavManager';
import { CategoryManager } from './managers/CategoryManager';
import { AddDispensaryModal, AddProductModal, AddUserModal, UserProfileCardModal } from '../forms';
import { iconMap } from './icons';
import { MoreMenuModal } from './MoreMenuModal';
import { usePermissions } from '../../hooks/usePermissions';
import { useAppContext } from '../../contexts/AppContext';
import { safeTimeSince } from "../../utils";
import { DebugPanel } from './DebugPanel';

export const AdminView = () => {
    const appContext = useAppContext();
    const {
        onLogout,
        currentUser: user,
        setCurrentUser,
        setView,
        activeAdminBU: activeBusinessUnit,
        setActiveAdminBU: setActiveBusinessUnit,
        adminData,
        allProducts,
        setProducts,
        setDispensaries,
        setSelectedPublicBrand,
        handleDownload,
        handleUploadClick,
        users,
        setUsers,
        roles,
        setRoles,
        setProductTypes,
        setAlertBanners,
        setCategories,
        categorySortOrder,
        setCategorySortOrder,
        setOrders,
        setVmiOrders,
        scrapedInventory,
        inventoryThreshold,
        setInventoryThreshold,
        handleSimulateScrape,
        scrapeLog,
        mobileNavConfig,
        setMobileNavConfig,
        handleDownloadAllVMIOrders,
        userNotifications: notifications,
        unreadCount,
        unreadSidebarCounts,
        markNotificationAsRead,
        markNotificationsAsReadForView,
        showMessage,
        handleAddProduct,
        handleAddUser,
        handleSaveUser,
        handleDeleteUser,
        handleAddRole,
        handleSaveRole,
        handleDeleteRole,
        handleAddDispensary,
        handleSaveDispensary,
        handleDeleteDispensary,
        csvUploadRef,
        handleCSVUpload,
    } = appContext;
    
    const permissions = usePermissions();

    const onSwitchView = () => {
        setView('public');
        setSelectedPublicBrand(['sunshine', 'passion-flower'].includes(activeBusinessUnit) ? 'sunshine-pf' : 'fairwinds');
    };
    const onSwitchToVMI = () => {
        setView('vmi');
        setSelectedPublicBrand(['sunshine', 'passion-flower'].includes(activeBusinessUnit) ? 'sunshine-pf' : 'fairwinds');
    };
    
	const [adminTab, setAdminTab] = useState('products');
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [showAddDispensaryModal, setShowAddDispensaryModal] = useState(false);
	const [showAddProductModal, setShowAddProductModal] = useState(false);
	const [showAddUserModal, setShowAddUserModal] = useState(false);
	const [showMoreModal, setShowMoreModal] = useState(false);
	const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isDataDropdownOpen, setIsDataDropdownOpen] = useState(false);
    const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
	const [showScrapeLog, setShowScrapeLog] = useState(false);
	const [userToEdit, setUserToEdit] = useState<UserAccount | null>(null);
    const [showDebug, setShowDebug] = useState(false);

    const topNavItems = useMemo(() => [
        { label: 'Dispensaries', tab: 'dispensaries', icon: <Store className="w-4 h-4 mr-2"/>, permission: permissions.dispensaries.view },
        { label: 'Alert Banners', tab: 'alertBanners', icon: <Tag className="w-4 h-4 mr-2"/>, permission: permissions.alertBanners.view },
        { label: 'Categories', tab: 'categories', icon: <Folder className="w-4 h-4 mr-2"/>, permission: permissions.categories.view },
        { label: 'Mobile Nav', tab: 'mobileNav', icon: <Smartphone className="w-4 h-4 mr-2"/>, permission: permissions.mobileNav.view },
    ], [permissions]);

    const settingsNavItems = useMemo(() => [
        { label: 'Users', tab: 'users', icon: <Users className="w-4 h-4 mr-2"/>, permission: permissions.users.view },
        { label: 'Roles & Permissions', tab: 'roles', icon: <ShieldCheck className="w-4 h-4 mr-2"/>, permission: permissions.roles.view },
    ], [permissions]);

    const visibleNavItems = useMemo(() => mobileNavConfig.filter(i => i.isVisible).sort((a,b) => a.order - b.order).slice(0, 4), [mobileNavConfig]);
    const hiddenNavItems = useMemo(() => {
        const visibleIds = new Set(visibleNavItems.map(i => i.id));
        // FIX: Corrected the filtering logic for hidden navigation items by checking `item.id` against the set of visible IDs, instead of the entire `item` object.
        return mobileNavConfig.filter(i => !visibleIds.has(i.id)).sort((a,b) => a.order - b.order);
    }, [mobileNavConfig, visibleNavItems]);

    const handleMobileNavClick = (tabId: MobileNavItem['id']) => {
        if (tabId === 'inventory-fwpf') {
            setActiveBusinessUnit('fairwinds');
            setAdminTab('inventory');
        } else if (tabId === 'inventory-ss') {
            setActiveBusinessUnit('sunshine');
            setAdminTab('inventory');
        } else {
            setAdminTabAndMarkRead(tabId as string);
        }
    };
    
    const setAdminTabAndMarkRead = (tab: string) => {
        if (tab === 'orders-received') {
            markNotificationsAsReadForView('orders-received', activeBusinessUnit);
        }
        setAdminTab(tab);
    }

	const onSaveUser = (updatedUser: UserAccount) => {
        handleSaveUser(updatedUser);
        setUserToEdit(null);
    };

    const combinedOrders = useMemo((): CombinedOrder[] => [
        ...adminData.orders.map(o => ({ ...o, type: 'regular' as const })),
        ...adminData.vmiOrders.map(v => ({ ...v, type: 'vmi' as const }))
    ], [adminData.orders, adminData.vmiOrders]);
    
    const debugData = {
        view: appContext.view,
        currentUser: appContext.currentUser,
        activeAdminBU: appContext.activeAdminBU,
        selectedPublicBrand: appContext.selectedPublicBrand,
        isLoading: appContext.isLoading,
        allProducts: appContext.allProducts,
        dispensaries: appContext.dispensaries,
        users: appContext.users,
        roles: appContext.roles,
        productTypes: appContext.productTypes,
        alertBanners: appContext.alertBanners,
        categories: appContext.categories,
        categorySortOrder: appContext.categorySortOrder,
        orders: appContext.orders,
        vmiOrders: appContext.vmiOrders,
        notifications: appContext.notifications,
        scrapedInventory: appContext.scrapedInventory,
        mobileNavConfig: appContext.mobileNavConfig,
        adminData: appContext.adminData,
        publicData: appContext.publicData,
    };

    if (!user) return null;

	return (
		<div className="min-h-screen bg-background">
            <input
                type="file"
                ref={csvUploadRef}
                onChange={handleCSVUpload}
                className="hidden"
                accept=".csv"
            />
			<header className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-40 flex items-center justify-between px-4 md:px-6">
				<div className="flex items-center gap-2">
					<button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-muted-foreground hover:bg-accent rounded-md">
						<Menu size={24} />
					</button>
					<a href="#" className="flex items-center gap-2 text-lg font-semibold text-foreground hover:text-primary">
						<LayoutDashboard className="w-5 h-5" />
						<span className="hidden md:inline">Dashboard</span>
					</a>
				</div>

				{/* Desktop Top Nav */}
				<nav className="hidden md:flex items-center">
                    {/* FIX: Corrected the logic for rendering desktop navigation items by wrapping it in an IIFE to ensure it's a valid JSX expression. This resolves errors where variables like 'navItem' and 'navComponent' were reported as not found due to invalid block structure. */}
                    {(() => {
                        // Define all potential components
                        const navComponents = [
                            ...topNavItems.filter(i => i.permission).map(navItem => (
                                <Button 
                                    key={navItem.tab} 
                                    variant={adminTab === navItem.tab ? 'ghost' : 'ghost'} 
                                    onClick={() => setAdminTab(navItem.tab)}
                                    className={`px-3 text-sm ${adminTab === navItem.tab ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}
                                >
                                    {navItem.icon} {navItem.label}
                                </Button>
                            )),
                            permissions.inventory.view && (
                                <div key="data-dropdown" className="relative" onMouseEnter={() => setIsDataDropdownOpen(true)} onMouseLeave={() => setIsDataDropdownOpen(false)}>
                                    <Button 
                                        variant='ghost'
                                        className={`px-3 text-sm ${adminTab === 'inventory' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}
                                    >
                                        <Database className="w-4 h-4 mr-2" />
                                        Data
                                        <ChevronDown size={16} className={`ml-1.5 transition-transform ${isDataDropdownOpen ? 'rotate-180' : ''}`} />
                                    </Button>
                                    {isDataDropdownOpen && (
                                        <div className="absolute top-full right-0 w-64 bg-popover rounded-lg shadow-lg border border-border z-20 animate-fade-in-down">
                                            <button onClick={() => { setActiveBusinessUnit('fairwinds'); setAdminTab('inventory'); setIsDataDropdownOpen(false); }} className="w-full text-left px-4 py-3 text-base text-popover-foreground hover:bg-accent flex items-center">
                                                <RefreshCw className="w-5 h-5 mr-3 text-muted-foreground" /> Fairwinds / PF Inventory Sync
                                            </button>
                                            <button onClick={() => { setActiveBusinessUnit('sunshine'); setAdminTab('inventory'); setIsDataDropdownOpen(false); }} className="w-full text-left px-4 py-3 text-base text-popover-foreground hover:bg-accent flex items-center">
                                                <RefreshCw className="w-5 h-5 mr-3 text-muted-foreground" /> Sunshine Inventory Sync
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ),
                            <Button 
                                key="regular-menu"
                                variant='ghost' 
                                onClick={onSwitchView}
                                className='text-muted-foreground px-3 text-sm'
                            >
                                <Eye className="w-4 h-4 mr-2"/>
                                Regular Menu
                            </Button>
                        ].filter(Boolean);

                        // Map over them and add dividers
                        return navComponents.map((navComponent, navIndex) => (
                            <React.Fragment key={navIndex}>
                                {navComponent}
                                {navIndex < navComponents.length - 1 && (
                                    <div className="w-px h-6 bg-gradient-to-b from-transparent via-border to-transparent mx-1"></div>
                                )}
                            </React.Fragment>
                        ));
                    })()}
				</nav>

				{/* Profile Dropdown */}
				<div className="flex items-center gap-2">
                    {/* Debug Button */}
                    <button onClick={() => setShowDebug(true)} className="p-2 text-muted-foreground hover:bg-accent rounded-md" aria-label="Open Debug Panel">
                        <Bug size={20} />
                    </button>
                    {/* Notifications Dropdown */}
                    <div className="relative" onMouseEnter={() => setIsNotificationDropdownOpen(true)} onMouseLeave={() => setIsNotificationDropdownOpen(false)}>
                        <button className="p-2 text-muted-foreground hover:bg-accent rounded-md relative">
                            <BellRing size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-card"></span>
                            )}
                        </button>
                         {isNotificationDropdownOpen && (
                            <div className="absolute top-full right-0 w-80 bg-popover rounded-lg shadow-lg border border-border z-20 animate-fade-in-down">
                                <div className="p-3 font-semibold border-b border-border">Notifications</div>
                                <div className="max-h-96 overflow-y-auto">
                                    {notifications.length > 0 ? notifications.map(n => (
                                        <button key={n.id} onClick={() => { markNotificationAsRead(n.id); setAdminTabAndMarkRead(n.link); setActiveBusinessUnit(n.businessUnit); setIsNotificationDropdownOpen(false); }} className={`w-full text-left px-4 py-3 text-sm text-popover-foreground hover:bg-accent flex gap-3 ${!n.isRead ? 'bg-primary/10' : ''}`}>
                                            {!n.isRead && <span className="h-2 w-2 rounded-full bg-primary block mt-1.5 flex-shrink-0"></span>}
                                            <div className="flex-grow">
                                                <p className={!n.isRead ? 'font-semibold' : ''}>{n.message}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{safeTimeSince(n.timestamp)}</p>
                                            </div>
                                        </button>
                                    )) : (
                                        <p className="p-4 text-center text-muted-foreground text-sm">No notifications yet.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="w-px h-6 bg-gradient-to-b from-transparent via-border to-transparent"></div>

					<div className="relative" onMouseEnter={() => setIsProfileDropdownOpen(true)} onMouseLeave={() => setIsProfileDropdownOpen(false)}>
						<div 
							className="flex items-center gap-2 cursor-pointer p-1 rounded-md hover:bg-accent"
						>
							<div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
								{user.profilePicture ? <img src={user.profilePicture} alt={user.username} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-muted-foreground" />}
							</div>
							<p className="hidden md:block font-semibold text-sm text-foreground pr-1">{user.username}</p>
							<ChevronDown size={16} className={`text-muted-foreground transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
						</div>
						{isProfileDropdownOpen && (
							<div className="absolute top-full right-0 w-64 bg-popover rounded-lg shadow-lg border border-border z-20 animate-fade-in-down">
								<div className="px-4 py-3 border-b border-border">
									<p className="text-base font-semibold text-popover-foreground truncate">{user.username}</p>
									<p className="text-sm text-muted-foreground truncate">{user.email}</p>
								</div>
								<div className="py-1">
									<button
                                        onClick={() => {
                                            setUserToEdit(user);
                                            setIsProfileDropdownOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-3 text-base text-popover-foreground hover:bg-accent flex items-center"
                                    >
                                        <Pencil className="w-5 h-5 mr-3 text-muted-foreground" />
                                        <span>Edit Profile</span>
                                    </button>
									<div className="px-4 pt-2 pb-1 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Settings</div>
									{settingsNavItems.filter(item => item.permission).map(item => (
										<button
											key={item.tab}
											onClick={() => {
												setAdminTab(item.tab);
												setIsProfileDropdownOpen(false);
											}}
											className="w-full text-left px-4 py-3 text-base text-popover-foreground hover:bg-accent flex items-center"
										>
											{React.cloneElement(item.icon, { className: "w-5 h-5 mr-3 text-muted-foreground" })}
											<span>{item.label}</span>
										</button>
									))}
								</div>
								<div className="border-t border-border"></div>
								<div className="py-1">
									<button onClick={onLogout} className="w-full text-left px-4 py-3 text-base text-red-600 hover:bg-red-50 dark:hover:bg-destructive/20 flex items-center">
										<LogOut className="w-5 h-5 mr-3" /> Logout
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</header>
			
			<div className="flex pt-16">
				<AdminSidebar 
					adminTab={adminTab}
					setAdminTab={setAdminTabAndMarkRead}
					isSidebarOpen={isSidebarOpen}
					setIsSidebarOpen={setIsSidebarOpen}
					onSwitchToVMI={onSwitchToVMI}
					permissions={permissions}
					activeBusinessUnit={activeBusinessUnit}
					setActiveBusinessUnit={setActiveBusinessUnit}
                    unreadCounts={unreadSidebarCounts}
				/>
				<main className={`flex-1 pb-20 md:pb-0`}>
					<div className={adminTab === 'orders-received' ? '' : 'p-6 md:p-8'}>
						{adminTab === 'dispensaries' && permissions.dispensaries.view && <DispensaryManager dispensaries={adminData.dispensaries} onSave={handleSaveDispensary} onDelete={handleDeleteDispensary} handleDownload={handleDownload} handleUploadClick={handleUploadClick} setShowAddDispensaryModal={setShowAddDispensaryModal} permissions={permissions.dispensaries} />}
						{adminTab === 'products' && permissions.products.view && <ProductManager products={adminData.products} setProducts={setProducts} productTypes={adminData.productTypes} setProductTypes={setProductTypes} alertBanners={adminData.alertBanners} categories={adminData.categories} showMessage={showMessage} handleDownload={handleDownload} handleUploadClick={handleUploadClick} setShowAddProductModal={setShowAddProductModal} permissions={permissions.products} activeBusinessUnit={activeBusinessUnit} />}
						{adminTab === 'users' && permissions.users.view && <UserManager users={users} onDelete={handleDeleteUser} setShowAddUserModal={setShowAddUserModal} currentUser={user} onEditUser={setUserToEdit} roles={roles} permissions={permissions.users} />}
						{adminTab === 'roles' && permissions.roles.view && <RoleManager roles={roles} onAdd={handleAddRole} onSave={handleSaveRole} onDelete={handleDeleteRole} users={users} permissions={permissions.roles} />}
						{adminTab === 'productTypes' && permissions.productTypes.view && <ProductTypesManager productTypes={adminData.productTypes} setProductTypes={setProductTypes} categories={adminData.categories} showMessage={showMessage} permissions={permissions.productTypes} activeBusinessUnit={activeBusinessUnit} />}
						{adminTab === 'categorySort' && permissions.categorySort.view && <CategorySortManager categorySortOrder={categorySortOrder} setCategorySortOrder={setCategorySortOrder} permissions={permissions.categorySort} activeBusinessUnit={activeBusinessUnit} />}
						{adminTab === 'alertBanners' && permissions.alertBanners.view && <AlertBannersManager alertBanners={adminData.alertBanners} setAlertBanners={setAlertBanners} permissions={permissions.alertBanners} activeBusinessUnit={activeBusinessUnit} />}
						{adminTab === 'categories' && permissions.categories.view && <CategoryManager categories={adminData.categories} setCategories={setCategories} permissions={permissions.categories} activeBusinessUnit={activeBusinessUnit} products={allProducts} />}
                        {adminTab === 'orders-received' && (permissions.ordersRegular.view || permissions.ordersVmi.view) && 
                            <OrdersReceivedManager 
                                orders={combinedOrders}
                                setOrders={setOrders}
                                setVmiOrders={setVmiOrders}
                                showMessage={showMessage}
                                permissions={{ regular: permissions.ordersRegular, vmi: permissions.ordersVmi }}
                                activeBusinessUnit={activeBusinessUnit}
                                currentUser={user}
                                users={users}
                                roles={roles}
                            />
                        }
						{adminTab === 'inventory' && permissions.inventory.view && <InventorySyncManager scrapedInventory={scrapedInventory} inventoryThreshold={inventoryThreshold} setInventoryThreshold={setInventoryThreshold} onSimulateScrape={handleSimulateScrape} onViewLog={() => setShowScrapeLog(true)} lastScrapeTimestamp={scrapeLog[0]?.timestamp} permissions={permissions.inventory} activeBusinessUnit={activeBusinessUnit} />}
						{adminTab === 'mobileNav' && permissions.mobileNav.view && <MobileNavManager mobileNavConfig={mobileNavConfig} setMobileNavConfig={setMobileNavConfig} showMessage={showMessage} permissions={permissions.mobileNav} />}
					</div>
				</main>
			</div>

			{showAddDispensaryModal && <AddDispensaryModal onClose={() => setShowAddDispensaryModal(false)} onSave={(dispensary) => { handleAddDispensary(dispensary); setShowAddDispensaryModal(false); }} />}
			{showAddProductModal && <AddProductModal onClose={() => setShowAddProductModal(false)} onSave={handleAddProduct} productTypes={adminData.productTypes} alertBanners={adminData.alertBanners} categories={adminData.categories} activeBusinessUnit={activeBusinessUnit} />}
			{showAddUserModal && <AddUserModal onClose={() => setShowAddUserModal(false)} onSave={handleAddUser} roles={roles} />}
            {showScrapeLog && <DataScrapeLogModal isOpen={showScrapeLog} onClose={() => setShowScrapeLog(false)} log={scrapeLog} />}
            {showMoreModal && <MoreMenuModal onClose={() => setShowMoreModal(false)} onLogout={onLogout} onSwitchView={onSwitchView} handleMobileNavClick={handleMobileNavClick} hiddenItems={hiddenNavItems} />}
			{userToEdit && <UserProfileCardModal user={userToEdit} onSave={onSaveUser} onClose={() => setUserToEdit(null)} roles={roles} currentUser={user} permissions={permissions.users} />}
            {showDebug && <DebugPanel data={debugData} onClose={() => setShowDebug(false)} />}


            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-30 grid grid-cols-5 text-center">
                {visibleNavItems.map(item => {
                    const Icon = iconMap[item.icon] || <Package />;
                    const isActive = adminTab === item.id;
                    return (
                        <Button
                            key={item.id}
                            onClick={() => handleMobileNavClick(item.id)}
                            variant="ghost"
                            className={`flex flex-col items-center justify-center h-16 w-full rounded-none text-xs p-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                        >
                            {React.cloneElement(Icon, { size: 24, className: 'mb-1' })}
                            <span>{item.label}</span>
                        </Button>
                    );
                })}
                 <Button
                    onClick={() => setShowMoreModal(true)}
                    variant="ghost"
                    className="flex flex-col items-center justify-center h-16 w-full rounded-none text-xs p-1 text-muted-foreground"
                >
                    <MoreHorizontal size={24} className="mb-1" />
                    <span>More</span>
                </Button>
            </div>
		</div>
	);
};