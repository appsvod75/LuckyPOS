import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { socket, socketEvents } from './services/socket';
import { Toaster } from 'react-hot-toast';
import './styles/dashboard-routes.css';
import Login from './pages/Login';
import POS from './pages/POS';
import AdminDashboard from './pages/AdminDashboard';
import Inventory from './pages/Inventory';
import Products from './pages/Products';
import Clients from './pages/Clients';
import Audit from './pages/Audit';
import Categories from './pages/Categories';
import Suppliers from './pages/Suppliers';
import Reports from './pages/Reports';
import AccountsReceivable from './pages/AccountsReceivable';
import AccountsPayable from './pages/AccountsPayable';
import Settings from './pages/Settings';
import UserManagement from './pages/UserManagement';
import BranchManagement from './pages/BranchManagement';
import Replenishment from './pages/Replenishment';
import Expenses from './pages/Expenses';
import SalesHistory from './pages/SalesHistory';
import CashClosings from './pages/CashClosings';
import Projections from './pages/Projections';
import DailySummary from './pages/DailySummary';
import Transfers from './pages/Transfers';
import ProductLookup from './pages/ProductLookup';
import { CartProvider } from './context/CartContext';
import ReloadPrompt from './components/ReloadPrompt';
import PWAInstallBanner from './components/PWAInstallBanner';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

const App: React.FC = () => {
    useEffect(() => {
        // --- MANEJO DE ERRORES DE CARGA (Assets) ---
        const handleAssetError = (e: ErrorEvent) => {
            const errorMsg = String(e.message || '');
            const isAssetError = errorMsg.includes('Failed to fetch dynamically imported module') ||
                errorMsg.includes('Load chunk failed') ||
                errorMsg.includes('Unexpected token') ||
                errorMsg.includes('is not a valid JSON');

            if (isAssetError) {
                console.log('🔄 Error de carga de assets detectado (posible versión nueva). Recargando...');
                window.location.reload();
            }
        };

        window.addEventListener('error', handleAssetError, true);

        // --- AVISO DE ACTUALIZACIÓN EXITOSA ---
        if (localStorage.getItem('app_just_updated') === 'true') {
            setTimeout(() => {
                import('react-hot-toast').then(({ toast }) => {
                    toast.success('¡App actualizada a la última versión! ✨', { duration: 5000, icon: '🎉' });
                });
                localStorage.removeItem('app_just_updated');
            }, 800);
        }

        // --- COMPROBACIÓN DE VERSIÓN ---
        const checkVersion = async () => {
            try {
                console.log('🔍 Buscando actualizaciones...');
                const response = await fetch('/version.json?t=' + Date.now());
                if (response.ok) {
                    const data = await response.json();
                    const serverVersion = data.version;
                    const localVersion = localStorage.getItem('app_version');

                    if (localVersion && serverVersion && String(serverVersion) !== String(localVersion)) {
                        console.log('🚀 ¡Nueva versión detectada! Limpiando caché y actualizando...');
                        localStorage.setItem('app_version', String(serverVersion));
                        localStorage.setItem('app_just_updated', 'true');
                        
                        import('react-hot-toast').then(({ toast }) => {
                            toast.success('Nueva versión detectada. Actualizando...', { duration: 4000, icon: '🚀' });
                        });

                        if ('caches' in window) {
                            const cacheNames = await caches.keys();
                            await Promise.all(cacheNames.map(name => caches.delete(name)));
                        }
                        if (navigator.serviceWorker) {
                            const regs = await navigator.serviceWorker.getRegistrations();
                            for (let reg of regs) { await reg.unregister(); }
                        }
                        
                        setTimeout(() => window.location.reload(), 2000);
                    } else if (!localVersion && serverVersion) {
                        localStorage.setItem('app_version', String(serverVersion));
                    }
                }
            } catch (vErr) {
                console.error('Error en checkVersion (silencioso)', vErr);
            }
        };

        checkVersion();

        // Verificar al retomar la pestaña
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                setTimeout(checkVersion, 1000);
            }
        };

        // --- SOCKET.IO REAL-TIME EVENT HANDLERS ---
        socket.on(socketEvents.FORCE_LOGOUT, (data: any) => {
            console.log('⚠️ CIERRE FORZADO RECIBIDO:', data.message);
            import('react-hot-toast').then(({ toast }) => {
                toast.error('Sesión finalizada por cierre de sistema.', { duration: 10000 });
            });
            setTimeout(() => {
                localStorage.clear();
                window.location.replace('/login');
            }, 3000);
        });

        socket.on(socketEvents.USER_CREATED, (data: any) => {
            import('react-hot-toast').then(({ toast }) => toast.success(`Nuevo usuario: ${data.name}`, { duration: 3000 }));
        });
        socket.on(socketEvents.USER_UPDATED, (data: any) => {
            import('react-hot-toast').then(({ toast }) => toast.success(`Usuario actualizado: ${data.name}`, { duration: 3000 }));
        });

        socket.on(socketEvents.PRODUCT_CREATED, (data: any) => {
            import('react-hot-toast').then(({ toast }) => toast.success(`Nuevo producto: ${data.name}`, { duration: 3000 }));
        });
        socket.on(socketEvents.PRODUCT_UPDATED, (data: any) => {
            import('react-hot-toast').then(({ toast }) => toast.success(`Producto actualizado: ${data.name || data.productId}`, { duration: 3000 }));
        });
        socket.on(socketEvents.PRODUCT_DELETED, (data: any) => {
            import('react-hot-toast').then(({ toast }) => toast('Producto eliminado', { icon: '🗑️', duration: 3000 }));
        });

        socket.on(socketEvents.CATEGORY_CREATED, () => {
            import('react-hot-toast').then(({ toast }) => toast.success('Nueva categoría creada', { duration: 2000 }));
        });
        socket.on(socketEvents.CATEGORY_UPDATED, () => {
            import('react-hot-toast').then(({ toast }) => toast.success('Categoría actualizada', { duration: 2000 }));
        });
        socket.on(socketEvents.CATEGORY_DELETED, () => {
            import('react-hot-toast').then(({ toast }) => toast('Categoría eliminada', { icon: '🗑️', duration: 2000 }));
        });

        socket.on(socketEvents.SALE_CREATED, (data: any) => {
            import('react-hot-toast').then(({ toast }) => toast.success(`Venta #${data.saleId} registrada`, { duration: 2000 }));
        });

        socket.on(socketEvents.SALE_DELETED, () => {
            import('react-hot-toast').then(({ toast }) => toast('Venta anulada', { icon: '🗑️', duration: 3000 }));
        });

        socket.on(socketEvents.PURCHASE_CREATED, (data: any) => {
            import('react-hot-toast').then(({ toast }) => toast.success(`Compra #${data.purchaseId} registrada`, { duration: 2000 }));
        });
        socket.on(socketEvents.PURCHASE_UPDATED, () => {
            import('react-hot-toast').then(({ toast }) => toast.success('Compra actualizada', { duration: 2000 }));
        });

        socket.on(socketEvents.CLIENT_CREATED, (data: any) => {
            import('react-hot-toast').then(({ toast }) => toast.success(`Cliente registrado: ${data.name || data.data?.name}`, { duration: 3000 }));
        });
        socket.on(socketEvents.CLIENT_UPDATED, () => {
            import('react-hot-toast').then(({ toast }) => toast.success('Cliente actualizado', { duration: 2000 }));
        });

        socket.on(socketEvents.PROVIDER_CREATED, (data: any) => {
            import('react-hot-toast').then(({ toast }) => toast.success(`Nuevo proveedor: ${data.name}`, { duration: 2000 }));
        });
        socket.on(socketEvents.PROVIDER_UPDATED, (data: any) => {
            import('react-hot-toast').then(({ toast }) => toast.success(`Proveedor actualizado: ${data.name}`, { duration: 2000 }));
        });
        socket.on(socketEvents.PROVIDER_DELETED, () => {
            import('react-hot-toast').then(({ toast }) => toast('Proveedor desactivado', { icon: '🏢', duration: 2000 }));
        });

        socket.on(socketEvents.BRANCH_CREATED, (data: any) => {
            import('react-hot-toast').then(({ toast }) => toast.success(`Nueva sucursal: ${data.name}`, { duration: 3000 }));
        });
        socket.on(socketEvents.BRANCH_UPDATED, (data: any) => {
            import('react-hot-toast').then(({ toast }) => toast.success(`Sucursal actualizada: ${data.name}`, { duration: 3000 }));
        });
        socket.on(socketEvents.BRANCH_DELETED, () => {
            import('react-hot-toast').then(({ toast }) => toast('Sucursal desactivada', { icon: '🏪', duration: 3000 }));
        });

        socket.on(socketEvents.EXPENSE_CREATED, () => {
            import('react-hot-toast').then(({ toast }) => toast.success('Gasto registrado', { duration: 2000 }));
        });
        socket.on(socketEvents.EXPENSE_UPDATED, () => {
            import('react-hot-toast').then(({ toast }) => toast.success('Gasto actualizado', { duration: 2000 }));
        });
        socket.on(socketEvents.EXPENSE_DELETED, () => {
            import('react-hot-toast').then(({ toast }) => toast('Gasto eliminado', { icon: '🗑️', duration: 2000 }));
        });

        socket.on(socketEvents.CLOSING_UPDATED, () => {
            import('react-hot-toast').then(({ toast }) => toast.success('Cierre de caja recalculado', { duration: 3000 }));
        });

        socket.on(socketEvents.CONFIG_UPDATED, () => {
            import('react-hot-toast').then(({ toast }) => toast.success('Configuración actualizada', { duration: 2000 }));
        });

        socket.on(socketEvents.GOAL_UPDATED, () => {
            import('react-hot-toast').then(({ toast }) => toast.success('Meta de ventas actualizada', { duration: 2000 }));
        });

        socket.on(socketEvents.DATA_RESET, (data: any) => {
            import('react-hot-toast').then(({ toast }) => toast(`Reset de datos: ${data.type}`, { icon: '⚠️', duration: 4000 }));
        });

        socket.on(socketEvents.BACKUP_CREATED, () => {
            import('react-hot-toast').then(({ toast }) => toast.success('Backup creado', { duration: 2000 }));
        });

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            window.removeEventListener('error', handleAssetError, true);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            Object.values(socketEvents).forEach(event => socket.off(event));
        };
    }, []);

    return (
        <CartProvider>
            <PWAInstallBanner />
            <ReloadPrompt />
            <Toaster
                position="top-center"
                reverseOrder={false}
                gutter={12}
                containerStyle={{
                    top: 80, // Offset to leave space for PWA notification or just top margin
                }}
                toastOptions={{
                    style: {
                        background: 'rgba(17, 24, 39, 0.8)',
                        backdropFilter: 'blur(10px)',
                        color: '#fff',
                        border: '1px solid rgba(52, 211, 153, 0.2)',
                        padding: '12px 24px',
                        borderRadius: '9999px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
                        fontWeight: '900',
                        textTransform: 'uppercase',
                        fontStyle: 'italic',
                        fontSize: '14px',
                        letterSpacing: '0.05em'
                    },
                    success: {
                        style: {
                            border: '1px solid rgba(52, 211, 153, 0.5)',
                            color: '#34d399',
                            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)'
                        },
                        iconTheme: { primary: '#34d399', secondary: '#064e3b' }
                    },
                    error: {
                        style: {
                            border: '1px solid rgba(244, 63, 94, 0.5)',
                            color: '#f43f5e',
                            boxShadow: '0 8px 32px rgba(239, 68, 68, 0.2)'
                        },
                        iconTheme: { primary: '#f43f5e', secondary: '#4c0519' }
                    },
                    loading: {
                        style: {
                            border: '1px solid rgba(59, 130, 246, 0.5)',
                            color: '#60a5fa',
                            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.2)'
                        }
                    }
                }}
            />
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/pos"
                        element={
                            <ProtectedRoute>
                                <POS />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/summary"
                        element={
                            <ProtectedRoute>
                                <DailySummary />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/inventory"
                        element={
                            <ProtectedRoute>
                                <Inventory />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/products"
                        element={
                            <ProtectedRoute>
                                <Products />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/expenses"
                        element={
                            <ProtectedRoute>
                                <Expenses />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/sales-history"
                        element={
                            <ProtectedRoute>
                                <SalesHistory />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/closings"
                        element={
                            <ProtectedRoute>
                                <CashClosings />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/projections"
                        element={
                            <ProtectedRoute>
                                <Projections />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/lookup"
                        element={
                            <ProtectedRoute>
                                <ProductLookup />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/audit"
                        element={
                            <ProtectedRoute>
                                <Audit />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/clients"
                        element={
                            <ProtectedRoute>
                                <Clients />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/categories"
                        element={
                            <ProtectedRoute>
                                <Categories />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/suppliers"
                        element={
                            <ProtectedRoute>
                                <Suppliers />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports"
                        element={
                            <ProtectedRoute>
                                <Reports />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/receivable"
                        element={
                            <ProtectedRoute>
                                <AccountsReceivable />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/payable"
                        element={
                            <ProtectedRoute>
                                <AccountsPayable />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <Settings />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/users"
                        element={
                            <ProtectedRoute>
                                <UserManagement />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/branches"
                        element={
                            <ProtectedRoute>
                                <BranchManagement />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/replenishment"
                        element={
                            <ProtectedRoute>
                                <Replenishment />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                {(() => {
                                    const user = JSON.parse(localStorage.getItem('user') || '{}');
                                    const isAdmin = user.role === 'Admin' || user.role === 'Super Admin';
                                    return isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/pos" replace />;
                                })()}
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Router>
        </CartProvider>
    );
};

export default App;
