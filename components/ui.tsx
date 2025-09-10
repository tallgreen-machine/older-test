import React, { useState } from "react";
import type { UserAccount, Product } from '../types';
import { X, Plus, Minus, Pencil, Trash2, ShieldCheck, Tag, DollarSign, Hash, Barcode, Layers, Package, ChevronDown } from 'lucide-react';
import { fmt } from '../constants';
import { useAppContext } from '../contexts/AppContext';

// FIX: Added `size` prop to support icon buttons without default padding.
export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string, variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'secondary', size?: 'default' | 'icon' }> = ({ className = '', variant = 'default', size = 'default', children, ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  };

  const sizeClasses = size === 'default' ? 'px-4 py-2' : '';

  return (
    <button className={`${baseClasses} ${variants[variant]} ${sizeClasses} ${className}`} {...props}>
      {children}
    </button>
  );
};

// FIX: Updated Card component to accept style and other HTML attributes.
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`bg-card text-card-foreground border border-border rounded-lg shadow-sm ${className}`} {...props}>
    {children}
  </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { className?: string }> = ({ className = '', ...props }) => (
  <input className={`block w-full h-10 rounded-md border border-input bg-background focus:border-primary focus:ring-ring sm:text-sm px-3 transition-colors hover:border-foreground/50 ${className}`} {...props} />
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { className?: string }> = ({ className = '', ...props }) => (
  <textarea className={`block w-full rounded-md border border-input bg-background focus:border-primary focus:ring-ring sm:text-sm p-3 transition-colors hover:border-foreground/50 ${className}`} {...props} />
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { className?: string }> = ({ className = '', children, ...props }) => (
    <select className={`block w-full h-10 rounded-md border border-input bg-background focus:border-primary focus:ring-ring sm:text-sm px-3 transition-colors hover:border-foreground/50 ${className}`} {...props}>
      {children}
    </select>
);

export const StyledModal = ({ title, onClose, sidebar, children, footer, size = 'xl' }: { title: string, onClose: () => void, sidebar?: React.ReactNode, children: React.ReactNode, footer?: React.ReactNode, size?: 'md' | 'lg' | 'xl' | '2xl' | '4xl' }) => {
    const sizeClasses = {
        md: 'max-w-md',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        '2xl': 'max-w-5xl',
        '4xl': 'max-w-7xl',
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div
                className={`bg-card text-card-foreground rounded-xl shadow-2xl w-full flex flex-col max-h-[90vh] animate-fade-in-up ${sizeClasses[size]}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-border">
                    <h2 className="text-xl font-semibold text-foreground">{title}</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent">
                        <X size={24} />
                    </button>
                </div>

                {/* Body with optional sidebar */}
                <div className="flex-grow flex overflow-hidden">
                    {sidebar && (
                        <div className="w-1/4 flex-shrink-0 bg-muted/50 border-r border-border overflow-y-auto p-4">
                            {sidebar}
                        </div>
                    )}
                    <div className="flex-grow overflow-y-auto p-6">
                        {children}
                    </div>
                </div>

                {/* Footer */}
                {footer && (
                    <div className="flex-shrink-0 flex items-center justify-end p-4 border-t border-border bg-muted/50 rounded-b-xl">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export const FormField = ({ label, children, className }: { label: string, children: React.ReactNode, className?: string }) => (
    <div className={className}>
        <label className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
        {children}
    </div>
);

export const RibbonBanner = ({ text, color }: { text?: string, color?: string }) => {
  if (!text || !color) return null;
  
  // This wrapper creates a clipping mask for the rotated ribbon.
  // It's positioned at the top-left of its relative parent.
  return (
    <div className="absolute top-0 left-0 w-24 h-24 overflow-hidden z-10 pointer-events-none">
      <div className="relative w-full h-full">
        {/* This is the ribbon itself, rotated into position. */}
        <div
          className="absolute transform -rotate-45 text-center text-white font-semibold shadow-md py-1 text-xs"
          style={{
            backgroundColor: color,
            left: '-34px', // Adjusts horizontal position
            top: '22px',  // Adjusts vertical position
            width: '130px', // The width of the ribbon before rotation
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};

export const MessageBox = ({ message, onClose }: { message: string, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex items-center justify-center p-4">
      <div className="bg-card rounded-md p-6 w-full max-w-sm text-center shadow-xl animate-fade-in-up">
        <p className="text-card-foreground">{message}</p>
        <PrimaryButton onClick={onClose} className="mt-6 w-full">OK</PrimaryButton>
      </div>
    </div>
  );
};

const DOHGeneralUseBadge: React.FC<{ className?: string }> = ({ className }) => (
    <img src="https://images.squarespace-cdn.com/content/v1/599cd4b8be6594696a8970a6/771fad4d-e7ae-4933-8f8f-b720aeb50a98/generalUseBlack.png?format=200w" alt="DOH General Use Compliant" className={className} />
);

const DOHHighTHCBadge: React.FC<{ className?: string }> = ({ className }) => (
    <img src="https://images.squarespace-cdn.com/content/v1/599cd4b8be6594696a8970a6/1615e441-53fd-4861-abba-936a09166adc/highTHCBlack.png?format=200w" alt="DOH High THC Compliant" className={className} />
);

const DOHHighCBDBadge: React.FC<{ className?: string }> = ({ className }) => (
    <img src="https://images.squarespace-cdn.com/content/v1/599cd4b8be6594696a8970a6/d8a6e694-b9db-44f8-b046-5e7803828f88/highCBDBlack.png?format=200w" alt="DOH High CBD Compliant" className={className} />
);

export const DOHBadge = ({ dohType, className = '' }: { dohType: Product['dohType'], className?: string }) => {
    if (dohType === 'None' || !dohType) return null;
    const badgeMap: { [key in Exclude<Product['dohType'], 'None'>]: JSX.Element | null } = {
        'DOH-General Use': <DOHGeneralUseBadge className={className} />,
        'DOH-High THC': <DOHHighTHCBadge className={className} />,
        'DOH-High CBD': <DOHHighCBDBadge className={className} />,
    };
    return badgeMap[dohType as Exclude<Product['dohType'], 'None'>] || null;
};

export const PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }> = ({ className = '', ...props }) => (
  <Button className={`bg-primary text-primary-foreground hover:bg-primary/90 ${className}`} {...props} />
);

export const SectionHeader = ({ children, count }: { children: React.ReactNode, count?: number }) => (
  <h2 className="text-2xl font-bold text-foreground mb-4">
    {children} {count !== undefined && <span className="text-lg font-medium text-muted-foreground ml-2">({count})</span>}
  </h2>
);

export const LoginModal = ({ onClose }: { onClose: () => void }) => {
    const { handleLogin, handleCheckRecoveryEmail, handleResetPassword } = useAppContext();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [recoveryState, setRecoveryState] = useState<'login' | 'enter_email' | 'reset_password'>('login');
    const [recoveryEmail, setRecoveryEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // FIX: Updated handleLoginSubmit to be an async function to correctly handle the promise returned by handleLogin, resolving the type error when setting the error state.
    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const loginError = await handleLogin(username, password);
        if (loginError) {
            setError(loginError);
        }
    };

    const handleRecoveryEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const accountExists = await handleCheckRecoveryEmail(recoveryEmail);
        if (accountExists) {
            setRecoveryState('reset_password');
        } else {
            setError('No account found for this email address.');
        }
    };

    const handlePasswordResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (newPassword.length < 4) {
            setError('Password must be at least 4 characters long.');
            return;
        }
        await handleResetPassword(recoveryEmail, newPassword);
        onClose();
    };

    const renderContent = () => {
        switch (recoveryState) {
            case 'enter_email':
                return (
                    <form onSubmit={handleRecoveryEmailSubmit} className="space-y-4">
                        <h2 className="text-xl font-semibold text-center text-foreground">Password Recovery</h2>
                        <p className="text-sm text-center text-muted-foreground">Enter your email to reset your password.</p>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Email</label>
                            <Input type="email" value={recoveryEmail} onChange={e => setRecoveryEmail(e.target.value)} required />
                        </div>
                        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                        <PrimaryButton type="submit" className="w-full !mt-6">Continue</PrimaryButton>
                        <Button type="button" variant="ghost" onClick={() => setRecoveryState('login')} className="w-full text-sm text-primary hover:underline">Back to Login</Button>
                    </form>
                );
            case 'reset_password':
                 return (
                    <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
                        <h2 className="text-xl font-semibold text-center text-foreground">Reset Your Password</h2>
                        <p className="text-sm text-center text-muted-foreground">Enter a new password for {recoveryEmail}.</p>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">New Password</label>
                            <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                        </div>
                         <div>
                            <label className="text-sm font-medium text-muted-foreground">Confirm New Password</label>
                            <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                        </div>
                        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                        <PrimaryButton type="submit" className="w-full !mt-6">Reset Password</PrimaryButton>
                    </form>
                );
            case 'login':
            default:
                return (
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                        <h2 className="text-xl font-semibold text-center text-foreground flex items-center justify-center gap-2">
                            <ShieldCheck className="w-6 h-6 text-muted-foreground"/>
                            <span>Admin Login</span>
                        </h2>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Username</label>
                            <Input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Password</label>
                            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                        <PrimaryButton type="submit" className="w-full !mt-6">Login</PrimaryButton>
                        <Button type="button" variant="ghost" onClick={() => setRecoveryState('enter_email')} className="w-full text-sm text-primary hover:underline">Forgot Password?</Button>
                    </form>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <Card className="p-8 w-full max-w-sm relative animate-fade-in-up">
                <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"><X size={24} /></button>
                {renderContent()}
            </Card>
        </div>
    );
};

export const Logo = ({ className }: { className?: string }) => (
    <img src="https://fairwindscannabis.com/wp-content/uploads/2025/09/SS-logo-trimmed.png" alt="Sunshine Menu Logo" className={`h-10 object-contain ${className}`} />
);

export const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string, message: string }) => {
    if (!isOpen) return null;
    return (
        <StyledModal title={title} onClose={onClose} size="md" footer={
            <div className="flex justify-center gap-4">
                <Button onClick={onClose} variant="outline">Cancel</Button>
                <Button onClick={onConfirm} variant="destructive">Confirm</Button>
            </div>
        }>
            <p className="text-center text-muted-foreground">{message}</p>
        </StyledModal>
    );
};


// --- Reusable Product Display Components ---

// --- Components for Product Menus (Public/VMI) ---

interface ProductMenuProps {
    product: Product;
    details: { price: number; image: string; bannerText?: string; bannerColor?: string; };
    orderQty: number;
    onQuantityChange: (product: Product, quantity: number) => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
}

export const ProductMenuTableRow: React.FC<ProductMenuProps> = ({ product, details, orderQty, onQuantityChange, isExpanded, onToggleExpand }) => (
    <React.Fragment>
        <tr className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
            <td className="p-4 align-top">
                <div className="flex items-start gap-4 relative">
                    <RibbonBanner text={details.bannerText} color={details.bannerColor} />
                    <div className="w-24 h-24 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                        <img src={details.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <p className="font-bold text-base text-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                        <DOHBadge dohType={product.dohType} className="w-12 h-12 mt-2" />
                    </div>
                </div>
            </td>
            <td className="p-4 align-top text-sm text-muted-foreground hidden md:table-cell">
                <p><strong className="text-foreground">Genetics:</strong> {product.genetics}</p>
                <p><strong className="text-foreground">Feels Like:</strong> {product.feelsLike}</p>
                <p><strong className="text-foreground">Top Terpenes:</strong> {product.topTerpenes}</p>
            </td>
            <td className="p-4 align-top text-center font-semibold text-foreground">{fmt(details.price)}</td>
            <td className="p-4 align-top text-center text-muted-foreground hidden md:table-cell">{product.qtyInStock}</td>
            <td className="p-4 align-top">
                <div className="flex items-center justify-center gap-1">
                    <Button variant="outline" size="icon" className="w-8 h-8 rounded-full" onClick={() => onQuantityChange(product, Math.max(0, orderQty - 1))}><Minus size={16} /></Button>
                    <Input type="number" value={orderQty} onChange={(e) => onQuantityChange(product, parseInt(e.target.value, 10) || 0)} className="w-20 h-8 text-center px-4" />
                    <Button variant="outline" size="icon" className="w-8 h-8 rounded-full" onClick={() => onQuantityChange(product, orderQty + 1)}><Plus size={16} /></Button>
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={onToggleExpand}>
                         <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </Button>
                </div>
            </td>
        </tr>
        {isExpanded && (
             <tr className="border-b border-border last:border-0 md:hidden">
                <td colSpan={5} className="p-4 bg-accent/50">
                     <div className="space-y-2 text-sm text-muted-foreground">
                        <p><strong className="text-foreground">Stock:</strong> {product.qtyInStock}</p>
                        <p><strong className="text-foreground">Genetics:</strong> {product.genetics}</p>
                        <p><strong className="text-foreground">Feels Like:</strong> {product.feelsLike}</p>
                        <p><strong className="text-foreground">Top Terpenes:</strong> {product.topTerpenes}</p>
                    </div>
                </td>
            </tr>
        )}
    </React.Fragment>
);

export const ProductMenuCard: React.FC<Omit<ProductMenuProps, 'isExpanded' | 'onToggleExpand'>> = ({ product, details, orderQty, onQuantityChange }) => (
    <Card className="relative flex overflow-hidden" key={product.id}>
        <RibbonBanner text={details.bannerText} color={details.bannerColor} />
        {/* Left side: Image */}
        <div className="w-28 flex-shrink-0 bg-secondary">
            <img src={details.image} alt={product.name} className="w-full h-full object-cover" />
        </div>
        {/* Right side: Details */}
        <div className="p-3 flex flex-col flex-grow justify-between">
            <div>
                <div className="flex items-start gap-2">
                    <DOHBadge dohType={product.dohType} className="w-8 h-8 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-base leading-tight">{product.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{product.description}</p>
                    </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                    <p><strong className="text-foreground">Genetics:</strong> {product.genetics}</p>
                    <p><strong className="text-foreground">Feels Like:</strong> {product.feelsLike}</p>
                </div>
            </div>
            <div className="flex items-center justify-between mt-2">
                <span className="font-semibold text-lg">{fmt(details.price)}</span>
                <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="w-8 h-8 rounded-full" onClick={() => onQuantityChange(product, Math.max(0, orderQty - 1))}><Minus size={16} /></Button>
                    <Input type="number" value={orderQty} onChange={(e) => onQuantityChange(product, parseInt(e.target.value, 10) || 0)} className="w-16 h-8 text-center px-4" />
                    <Button variant="outline" size="icon" className="w-8 h-8 rounded-full" onClick={() => onQuantityChange(product, orderQty + 1)}><Plus size={16} /></Button>
                </div>
            </div>
        </div>
    </Card>
);

// --- Components for Product Management (Admin) ---

interface ProductAdminProps {
    product: Product & { price: number; image: string; bannerText?: string; bannerColor?: string; };
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
    canEdit: boolean;
    canDelete: boolean;
    isExpanded: boolean;
    onToggleExpand: () => void;
    isFwPfView: boolean;
}

export const ProductAdminTableRow: React.FC<ProductAdminProps> = ({ product, onEdit, onDelete, canEdit, canDelete, isExpanded, onToggleExpand, isFwPfView }) => (
    <React.Fragment>
        <tr className="hover:bg-accent/50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="w-10 h-10 rounded-lg bg-secondary overflow-hidden relative">
                    <RibbonBanner text={product.bannerText} color={product.bannerColor} />
                    {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" /> : null}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">{product.name}</td>
            <td className="px-6 py-4 whitespace-nowrap text-muted-foreground hidden lg:table-cell">{product.sku}</td>
            <td className="px-6 py-4 whitespace-nowrap text-muted-foreground hidden lg:table-cell">{product.category}</td>
            {isFwPfView && <td className="px-6 py-4 whitespace-nowrap text-muted-foreground hidden lg:table-cell capitalize">{product.businessUnit.replace('-',' ')}</td>}
            <td className="px-6 py-4 whitespace-nowrap text-center text-muted-foreground hidden lg:table-cell">{fmt(product.price)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-center text-muted-foreground hidden lg:table-cell">{product.qtyInStock}</td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="flex gap-2 justify-center">
                    {canEdit && <Button onClick={() => onEdit(product)} variant="ghost" className="p-2 h-auto"><Pencil className="w-4 h-4" /></Button>}
                    {canDelete && <Button onClick={() => onDelete(product)} variant="ghost" className="p-2 h-auto text-red-600 hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>}
                    <Button variant="ghost" size="icon" className="lg:hidden p-2 h-auto" onClick={onToggleExpand}>
                        <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </Button>
                </div>
            </td>
        </tr>
        {isExpanded && (
            <tr className="lg:hidden">
                <td colSpan={isFwPfView ? 8 : 7} className="p-4 bg-accent/50">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><strong className="text-foreground block">SKU:</strong> {product.sku}</div>
                        <div><strong className="text-foreground block">Category:</strong> {product.category}</div>
                        {isFwPfView && <div><strong className="text-foreground block">Brand:</strong> <span className="capitalize">{product.businessUnit.replace('-', ' ')}</span></div>}
                        <div><strong className="text-foreground block">Price:</strong> {fmt(product.price)}</div>
                        <div><strong className="text-foreground block">Stock:</strong> {product.qtyInStock}</div>
                    </div>
                </td>
            </tr>
        )}
    </React.Fragment>
);

export const ProductAdminCard: React.FC<Omit<ProductAdminProps, 'isExpanded' | 'onToggleExpand' | 'isFwPfView'>> = ({ product, onEdit, onDelete, canEdit, canDelete }) => (
    <div>
        {/* Top: Name & Actions */}
        <div className="flex justify-between items-start mb-3 pb-3 border-b border-border">
            <h3 className="font-semibold text-lg text-foreground pr-2">{product.name}</h3>
            <div className="flex items-center gap-1 -mt-2 -mr-2 flex-shrink-0">
                {canEdit && <Button onClick={() => onEdit(product)} variant="ghost" className="p-2 h-auto"><Pencil size={16} /></Button>}
                {canDelete && <Button onClick={() => onDelete(product)} variant="ghost" className="p-2 h-auto text-red-600 hover:bg-destructive/10"><Trash2 size={16} /></Button>}
            </div>
        </div>

        {/* Bottom: Image and Details in a grid */}
        <div className="grid grid-cols-2 gap-4">
            {/* Left side: Image */}
            <div className="col-span-1">
                <div className="aspect-square w-full rounded-lg bg-secondary overflow-hidden relative">
                    <RibbonBanner text={product.bannerText} color={product.bannerColor} />
                    {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <Package size={32} className="text-muted-foreground" />
                        </div>
                    )}
                </div>
            </div>

            {/* Right side: Details */}
            <div className="col-span-1 space-y-2 text-sm text-muted-foreground">
                <p className="flex items-start">
                    <Layers size={14} className="mr-2 text-muted-foreground flex-shrink-0 mt-0.5"/> 
                    <div><span className="font-medium text-foreground">Type:</span><br/>{product.productType}</div>
                </p>
                <p className="flex items-start">
                    <Tag size={14} className="mr-2 text-muted-foreground flex-shrink-0 mt-0.5"/> 
                    <div><span className="font-medium text-foreground">Category:</span><br/>{product.category}</div>
                </p>
                <p className="flex items-start">
                    <Barcode size={14} className="mr-2 text-muted-foreground flex-shrink-0 mt-0.5"/> 
                    <div><span className="font-medium text-foreground">SKU:</span><br/>{product.sku}</div>
                </p>
                 <p className="flex items-start">
                    <DollarSign size={14} className="mr-2 text-muted-foreground flex-shrink-0 mt-0.5"/> 
                    <div><span className="font-medium text-foreground">Price:</span><br/>{fmt(product.price)}</div>
                </p>
                <p className="flex items-start">
                    <Hash size={14} className="mr-2 text-muted-foreground flex-shrink-0 mt-0.5"/> 
                    <div><span className="font-medium text-foreground">Stock:</span><br/>{product.qtyInStock}</div>
                </p>
            </div>
        </div>
    </div>
);