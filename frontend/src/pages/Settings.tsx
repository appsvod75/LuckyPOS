import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { configApi, backupApi } from '../services/api';
import RoleManagement from './RoleManagement';
import { 
  Settings as SettingsIcon, Save, Building, MapPin, Phone, Globe, Image as ImageIcon, Key, 
  StickyNote, Clock, List, ArrowUp, ArrowDown, GripVertical, TriangleAlert, ShieldAlert, 
  Trash2, RefreshCcw, X, CreditCard, ChevronRight, CheckCircle2, AlertCircle, ShoppingCart, 
  Eye, EyeOff, ShieldCheck, Lock as LockIcon, LayoutDashboard
} from 'lucide-react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const PinModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: (pin: string) => void; title: string; description: string }> = ({ isOpen, onClose, onConfirm, title, description }) => {
    const [pin, setPin] = useState('');

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="modal-overlay" style={{ zIndex: 2000 }}>
                    <motion.div 
                        className="modal-content"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        style={{ 
                            maxWidth: '430px', 
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            background: '#0f172a',
                            borderRadius: '24px',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6), 0 0 40px rgba(239, 68, 68, 0.1)',
                            overflow: 'hidden'
                        }}
                    >
                        <div className="modal-header" style={{ 
                            padding: '1.5rem 2rem',
                            borderBottom: '1px solid rgba(239, 68, 68, 0.1)',
                            background: 'rgba(239, 68, 68, 0.05)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#f87171', margin: 0, fontSize: '1.3rem' }}>
                                <ShieldAlert size={28} className="animate-pulse" />
                                {title}
                            </h2>
                            <button 
                                onClick={onClose} 
                                style={{ 
                                    background: 'rgba(255,255,255,0.05)', 
                                    border: 'none', 
                                    color: '#94a3b8', 
                                    width: '36px', 
                                    height: '36px', 
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                className="hover-brightness"
                                onMouseOver={e => {
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                    e.currentTarget.style.color = 'white';
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                    e.currentTarget.style.color = '#94a3b8';
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body" style={{ padding: '2rem' }}>
                            <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.6' }}>{description}</p>
                            <div className="field">
                                <label style={{ display: 'block', color: '#64748b', marginBottom: '0.75rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>PIN de Seguridad</label>
                                <input
                                    type="password"
                                    autoFocus
                                    value={pin}
                                    onChange={e => setPin(e.target.value)}
                                    placeholder="••••••"
                                    maxLength={6}
                                    style={{ 
                                        width: '100%', padding: '1.25rem', borderRadius: '16px', 
                                        background: 'rgba(0,0,0,0.3)', border: '1px solid #334155', 
                                        color: '#f8fafc', fontSize: '1.8rem', textAlign: 'center',
                                        letterSpacing: '0.4em', fontWeight: 'bold'
                                    }}
                                    onKeyDown={e => e.key === 'Enter' && onConfirm(pin)}
                                />
                            </div>
                        </div>
                        <div style={{ padding: '0 2rem 2rem', display: 'flex', gap: '1rem' }}>
                            <button 
                                onClick={onClose}
                                style={{ 
                                    flex: 1, padding: '1rem', borderRadius: '14px', 
                                    background: '#1e293b', color: '#94a3b8', 
                                    border: '1px solid #334155', fontWeight: 600, 
                                    cursor: 'pointer', transition: 'all 0.2s' 
                                }}
                                onMouseOver={e => {
                                    e.currentTarget.style.background = '#334155';
                                    e.currentTarget.style.color = 'white';
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.background = '#1e293b';
                                    e.currentTarget.style.color = '#94a3b8';
                                }}
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={() => onConfirm(pin)}
                                style={{ 
                                    flex: 1.5, padding: '1rem', borderRadius: '14px', 
                                    background: 'linear-gradient(135deg, #ef4444, #b91c1c)', 
                                    color: 'white', border: 'none', fontWeight: 700, 
                                    cursor: 'pointer', transition: 'all 0.3s',
                                    boxShadow: '0 8px 20px -5px rgba(239, 68, 68, 0.4)'
                                }}
                                onMouseOver={e => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 12px 25px -5px rgba(239, 68, 68, 0.6)';
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 8px 20px -5px rgba(239, 68, 68, 0.4)';
                                }}
                            >
                                Confirmar Acción
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const DASHBOARD_MODULES = [
    'Punto de Venta','Inventario','Reposición de Stock','Productos','Categorías',
    'Proveedores','Clientes','Cuentas por Cobrar','Cuentas por Pagar',
    'Personal','Sucursales','Gastos','Historial','Resumen Día','Cortes Caja',
    'Configuración','Reportes','Proyecciones','Traslados','Consultar'
];

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState('business');
    const [showApiKey, setShowApiKey] = useState(false);
    const [config, setConfig] = useState<any>({
        businessName: '',
        address: '',
        phone: '',
        logoUrl: '',
        geminiApiKey: '',
        ticketHeader: '',
        ticketFooter: '',
        isAutoClosingEnabled: true,
        autoClosingTime: '23:59',
        emailWebhookUrl: '',
        enableEmailTickets: false,
        enableQrCode: false,
        ticketWidth: '58mm',
        sidebarConfig: [] as { key: string; label: string; enabled: boolean }[],
        adminPin: '',
    });
    const [loading, setLoading] = useState(false);
    const [dangerModal, setDangerModal] = useState<{ isOpen: boolean; type: 'sales' | 'inventory' | 'products' | null }>({ isOpen: false, type: null });
    const [backups, setBackups] = useState<any[]>([]);
    const [isBackingUp, setIsBackingUp] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    useEffect(() => {
        if (activeTab === 'backup') {
            backupApi.getBackups().then(res => setBackups(res.data)).catch(() => {});
        }
    }, [activeTab]);

    const fetchConfig = async () => {
        try {
            const res = await configApi.getConfig();
            if (res.data) {
                setConfig({
                    businessName: res.data.businessName || '',
                    address: res.data.address || '',
                    phone: res.data.phone || '',
                    logoUrl: res.data.logoUrl || '',
                    geminiApiKey: res.data.geminiApiKey || '',
                    ticketHeader: res.data.ticketHeader || '',
                    ticketFooter: res.data.ticketFooter || '',
                    isAutoClosingEnabled: res.data.autoClosingTime !== '',
                    autoClosingTime: res.data.autoClosingTime || '23:59',
                    emailWebhookUrl: res.data.emailWebhookUrl || '',
                    enableEmailTickets: res.data.enableEmailTickets || false,
                    enableQrCode: res.data.enableQrCode || false,
                    ticketWidth: res.data.ticketWidth || '58mm',
                    adminPin: res.data.adminPin || '',
                    sidebarConfig: (() => {
                        const ALL_SIDEBAR_KEYS = [
                            { key: 'pos', label: 'Ventas (POS)', enabled: true },
                            { key: 'summary', label: 'Resumen Día', enabled: true },
                            { key: 'inventory', label: 'Inventario', enabled: true },
                            { key: 'replenishment', label: 'Reposición', enabled: true },
                            { key: 'products', label: 'Productos', enabled: true },
                            { key: 'categories', label: 'Categorías', enabled: false },
                            { key: 'suppliers', label: 'Proveedores', enabled: false },
                            { key: 'clients', label: 'Clientes', enabled: true },
                            { key: 'receivable', label: 'CxC', enabled: false },
                            { key: 'payable', label: 'CxP', enabled: false },
                            { key: 'expenses', label: 'Gastos', enabled: true },
                            { key: 'history', label: 'Hist. Ventas', enabled: true },
                            { key: 'closings', label: 'Cortes Caja', enabled: false },
                            { key: 'users', label: 'Personal', enabled: false },
                            { key: 'branches', label: 'Sucursales', enabled: false },
                            { key: 'reports', label: 'Reportes', enabled: false },
                            { key: 'lookup', label: 'Consultar', enabled: true },
                            { key: 'admin', label: 'Dashboard', enabled: true },
                            { key: 'settings', label: 'Configuración', enabled: false }
                        ];
                        const sc = res.data.sidebarConfig;
                        let saved: any[] = [];
                        if (sc && typeof sc === 'object' && !Array.isArray(sc)) {
                            saved = sc.sidebar || [];
                        } else if (Array.isArray(sc)) {
                            saved = sc;
                        }
                        if (saved.length === 0) return ALL_SIDEBAR_KEYS;
                        // Merge: keep saved order/state, add missing new items at the end
                        const savedKeys = new Set(saved.map((s: any) => s.key));
                        const newItems = ALL_SIDEBAR_KEYS.filter(k => !savedKeys.has(k.key));
                        return [...saved, ...newItems];
                    })(),
                    dashOrder: (() => {
                        const sc = res.data.sidebarConfig;
                        if (sc && typeof sc === 'object' && !Array.isArray(sc) && sc.dashboard && sc.dashboard.length > 0) {
                            const saved = sc.dashboard;
                            return [...saved, ...DASHBOARD_MODULES.filter(m => !saved.includes(m))];
                        }
                        return [...DASHBOARD_MODULES];
                    })()
                });
            }
        } catch (error) {
            toast.error('Error al cargar configuración');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const saveData = {
                ...config,
                sidebarConfig: {
                    sidebar: config.sidebarConfig,
                    dashboard: config.dashOrder
                }
            };
            delete saveData.dashOrder;
            await configApi.updateConfig(saveData);
            toast.success('Configuración guardada correctamente');
            window.dispatchEvent(new Event('config-updated'));
        } catch (error) {
            toast.error('Error al guardar configuración');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'business', label: 'Negocio', icon: <Building size={18} /> },
        { id: 'printing', label: 'IA e Impresión', icon: <StickyNote size={18} /> },
        { id: 'automation', label: 'Automatización', icon: <Clock size={18} /> },
        { id: 'sidebar', label: 'Barra Lateral', icon: <List size={18} /> },
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'roles', label: 'Roles', icon: <ShieldCheck size={18} /> },
        { id: 'backup', label: 'Backups', icon: <RefreshCcw size={18} /> },
        { id: 'danger', label: 'Zona de Peligro', icon: <TriangleAlert size={18} color="#ef4444" /> }
    ];

    const handleConfirmReset = async (pin: string) => {
        if (!dangerModal.type) return;
        
        try {
            setLoading(true);
            if (dangerModal.type === 'sales') {
                await configApi.resetSales(pin);
                toast.success('Historial de ventas reiniciado correctamente');
            } else if (dangerModal.type === 'inventory') {
                await configApi.resetInventory(pin);
                toast.success('Stock de inventario reiniciado a cero');
            } else if (dangerModal.type === 'products') {
                await configApi.resetProducts(pin);
                toast.success('Todos los productos eliminados correctamente');
            }
            setDangerModal({ isOpen: false, type: null });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al procesar solicitud');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="products-page">
            <Sidebar />
            <main className="products-main" style={{ 
                height: '100vh', 
                display: 'flex', 
                flexDirection: 'column', 
                background: '#0f172a',
                overflow: 'hidden'
            }}>
                <div style={{
                    zIndex: 50,
                    background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(12px)',
                    padding: '1.5rem 1.5rem 0.5rem 1.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
                }}>
                    <header className="page-header" style={{ marginBottom: '1rem' }}>
                        <div className="header-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div className="header-icon-container" style={{
                                    background: 'rgba(99, 102, 241, 0.15)',
                                    width: '56px', height: '56px',
                                    borderRadius: '16px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#6366f1',
                                    border: '1px solid rgba(99, 102, 241, 0.2)'
                                }}>
                                    <SettingsIcon size={28} />
                                </div>
                                <div>
                                    <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', margin: 0 }}>Configuración Maestra</h1>
                                    <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>Parámetros globales del sistema</p>
                                </div>
                            </div>

                            {activeTab !== 'danger' && (
                                <button 
                                    type="submit" 
                                    form="settings-form"
                                    className="btn-main" 
                                    disabled={loading} 
                                    style={{ 
                                        padding: '0.85rem 2rem', 
                                        fontSize: '1rem', 
                                        boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.3)',
                                        height: 'fit-content'
                                    }}
                                >
                                    <Save size={20} />
                                    {loading ? 'Guardando...' : 'Aplicar Cambios'}
                                </button>
                            )}
                        </div>
                    </header>

                    <div className="settings-tabs" style={{ display: 'flex', gap: '0.5rem', background: 'rgba(30, 41, 59, 0.5)', padding: '0.5rem', borderRadius: '16px', border: '1px solid #334155', width: 'fit-content' }}>
                        {tabs.map((tab: any) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    padding: '0.6rem 1.25rem', borderRadius: '12px',
                                    border: 'none', cursor: 'pointer', fontWeight: 700,
                                    fontSize: '0.85rem', transition: 'all 0.2s',
                                    background: activeTab === tab.id ? '#3b82f6' : 'transparent',
                                    color: activeTab === tab.id ? 'white' : '#94a3b8'
                                }}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <form id="settings-form" onSubmit={handleSave} className="settings-form" style={{ padding: '1.5rem 1.5rem 4rem 1.5rem', flex: 1, overflowY: 'auto' }}>
                    {activeTab === 'business' && (
                        <div className="settings-section animate-in fade-in slide-in-from-bottom-2" style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '2.5rem', borderRadius: '24px', border: '1px solid #334155' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem', fontSize: '1.4rem', color: 'white' }}>
                                <Building size={24} color="#6366f1" /> Datos del Negocio
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                <div className="field">
                                    <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Nombre Comercial</label>
                                    <input
                                        type="text"
                                        value={config.businessName}
                                        onChange={e => setConfig({ ...config, businessName: e.target.value })}
                                        placeholder="Ej: Farmacia La Esperanza"
                                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', background: '#0f172a', border: '1px solid #334155', color: 'white' }}
                                    />
                                </div>

                                <div className="field">
                                    <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Teléfono</label>
                                    <input
                                        type="text"
                                        value={config.phone}
                                        onChange={e => setConfig({ ...config, phone: e.target.value })}
                                        placeholder="+503 2222-2222"
                                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', background: '#0f172a', border: '1px solid #334155', color: 'white' }}
                                    />
                                </div>

                                <div className="field" style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Dirección</label>
                                    <input
                                        type="text"
                                        value={config.address}
                                        onChange={e => setConfig({ ...config, address: e.target.value })}
                                        placeholder="Ciudad, Calle, Edificio..."
                                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', background: '#0f172a', border: '1px solid #334155', color: 'white' }}
                                    />
                                </div>

                                <div className="field" style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.5rem', fontSize: '0.875rem' }}>URL del Logo</label>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <input
                                            type="text"
                                            value={config.logoUrl}
                                            onChange={e => setConfig({ ...config, logoUrl: e.target.value })}
                                            placeholder="https://ejemplo.com/logo.png"
                                            style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '12px', background: '#0f172a', border: '1px solid #334155', color: 'white' }}
                                        />
                                        {config.logoUrl && (
                                            <div style={{ width: '56px', height: '56px', borderRadius: '12px', overflow: 'hidden', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #334155' }}>
                                                <img src={config.logoUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="field" style={{ gridColumn: 'span 2', marginTop: '1rem', borderTop: '1px solid #334155', paddingTop: '1.5rem' }}>
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', color: '#f59e0b', fontSize: '1rem' }}>
                                        <LockIcon size={18} /> PIN de Administrador (Zona de Peligro)
                                    </h4>
                                    <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.5rem', fontSize: '0.875rem' }}>PIN de Super Admin (6 dígitos)</label>
                                    <input
                                        type="password"
                                        maxLength={6}
                                        value={config.adminPin}
                                        onChange={e => setConfig({ ...config, adminPin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                        placeholder="020518"
                                        style={{ width: '100%', maxWidth: '200px', padding: '0.75rem 1rem', borderRadius: '12px', background: '#0f172a', border: '1px solid #f59e0b', color: 'white', textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.2rem' }}
                                    />
                                    <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                                        Este PIN se usa para las acciones destructivas (reset de ventas, inventario, productos).
                                        Si se deja vacío, se usará el configurado en el archivo .env del servidor.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'printing' && (
                        <div className="settings-section animate-in fade-in slide-in-from-bottom-2" style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '2rem', borderRadius: '24px', border: '1px solid #334155' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                {/* Sección IA */}
                                <div style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', color: '#f59e0b', fontSize: '1.1rem' }}>
                                        <Key size={20} /> Inteligencia Artificial
                                    </h4>
                                    <div className="field">
                                        <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.4rem', fontSize: '0.75rem' }}>Gemini API Key</label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type={showApiKey ? "text" : "password"}
                                                value={config.geminiApiKey}
                                                onChange={e => setConfig({ ...config, geminiApiKey: e.target.value })}
                                                placeholder="AIzaSy..."
                                                style={{ width: '100%', padding: '0.6rem 2.5rem 0.6rem 0.8rem', borderRadius: '10px', background: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '0.9rem' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowApiKey(!showApiKey)}
                                                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                            >
                                                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.5rem' }}>Para autogeneración de fichas médicas.</p>
                                    </div>
                                </div>

                                {/* Sección Impresión */}
                                <div style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', color: '#3b82f6', fontSize: '1.1rem' }}>
                                        <Building size={20} /> Formato de Ticket
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className="field">
                                            <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.4rem', fontSize: '0.75rem' }}>Ancho</label>
                                            <select
                                                value={config.ticketWidth}
                                                onChange={e => setConfig({ ...config, ticketWidth: e.target.value })}
                                                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', background: '#1e293b', border: '1px solid #334155', color: 'white', fontSize: '0.9rem', fontWeight: 700 }}
                                            >
                                                <option value="58mm">58mm</option>
                                                <option value="80mm">80mm</option>
                                            </select>
                                        </div>
                                        <div className="field">
                                             <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.4rem', fontSize: '0.75rem' }}>Tickets Email</label>
                                             <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', height: '38px', background: '#1e293b', padding: '0 0.8rem', borderRadius: '10px', border: '1px solid #334155' }}>
                                                 <input
                                                     type="checkbox"
                                                     checked={config.enableEmailTickets}
                                                     onChange={(e) => setConfig({ ...config, enableEmailTickets: e.target.checked })}
                                                     style={{ width: '16px', height: '16px', accentColor: '#10b981' }}
                                                 />
                                                 <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>{config.enableEmailTickets ? 'SÍ' : 'NO'}</span>
                                             </label>
                                         </div>
                                         <div className="field">
                                             <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.4rem', fontSize: '0.75rem' }}>Código QR en Ticket</label>
                                             <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', height: '38px', background: '#1e293b', padding: '0 0.8rem', borderRadius: '10px', border: '1px solid #334155' }}>
                                                 <input
                                                     type="checkbox"
                                                     checked={config.enableQrCode}
                                                     onChange={(e) => setConfig({ ...config, enableQrCode: e.target.checked })}
                                                     style={{ width: '16px', height: '16px', accentColor: '#10b981' }}
                                                 />
                                                 <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>{config.enableQrCode ? 'SÍ' : 'NO'}</span>
                                             </label>
                                         </div>
                                     </div>
                                </div>
                            </div>

                            {/* Textareas y Webhook (Fila inferior) */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                                <div className="field">
                                    <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.4rem', fontSize: '0.75rem' }}>Encabezado del Ticket</label>
                                    <textarea
                                        value={config.ticketHeader}
                                        onChange={e => setConfig({ ...config, ticketHeader: e.target.value })}
                                        placeholder="¡Gracias por su compra!"
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', background: '#0f172a', border: '1px solid #334155', color: 'white', minHeight: '80px', fontSize: '0.85rem', resize: 'none' }}
                                    />
                                </div>
                                <div className="field">
                                    <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.4rem', fontSize: '0.75rem' }}>Pie del Ticket</label>
                                    <textarea
                                        value={config.ticketFooter}
                                        onChange={e => setConfig({ ...config, ticketFooter: e.target.value })}
                                        placeholder="No se aceptan devoluciones..."
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', background: '#0f172a', border: '1px solid #334155', color: 'white', minHeight: '80px', fontSize: '0.85rem', resize: 'none' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', color: '#10b981', fontSize: '1rem' }}>
                                    <Globe size={20} /> Integración Email (Webhook)
                                </h4>
                                <div className="field">
                                    <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.4rem', fontSize: '0.75rem' }}>URL de Google Apps Script</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            value={config.emailWebhookUrl}
                                            onChange={e => setConfig({ ...config, emailWebhookUrl: e.target.value })}
                                            placeholder="https://script.google.com/macros/s/.../exec"
                                            style={{ 
                                                flex: 1, padding: '0.75rem 1rem', borderRadius: '12px', 
                                                background: '#0f172a', border: '1px solid #334155', 
                                                color: 'white', fontSize: '0.9rem',
                                                opacity: config.enableEmailTickets ? 1 : 0.6
                                            }}
                                        />
                                        <div style={{ 
                                            background: config.enableEmailTickets ? '#10b98120' : '#334155', 
                                            color: config.enableEmailTickets ? '#10b981' : '#64748b', 
                                            padding: '0 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', fontSize: '0.75rem', fontWeight: 800 
                                        }}>
                                            {config.enableEmailTickets ? 'ACTIVO' : 'INACTIVO'}
                                        </div>
                                    </div>
                                    {!config.enableEmailTickets && (
                                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                                            * Habilita el envío de tickets por email arriba para activar este webhook.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'automation' && (
                        <div className="settings-section animate-in fade-in slide-in-from-bottom-2" style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '2.5rem', borderRadius: '24px', border: '1px solid #334155' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem', fontSize: '1.4rem', color: 'white' }}>
                                <Clock size={24} color="#3b82f6" /> Cierre Automatizado de Día
                            </h3>

                            <div style={{ padding: '1.5rem', background: '#0f172a', borderRadius: '16px', border: '1px solid #1e293b' }}>
                                <div className="field" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={config.isAutoClosingEnabled}
                                            onChange={(e) => setConfig({ ...config, isAutoClosingEnabled: e.target.checked })}
                                            style={{ width: '22px', height: '22px', accentColor: '#3b82f6' }}
                                        />
                                        Habilitar Cierre Automático
                                    </label>
                                </div>

                                {config.isAutoClosingEnabled && (
                                    <div className="field animate-in fade-in slide-in-from-top-2">
                                        <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Hora de Ejecución Diaria</label>
                                        <input
                                            type="time"
                                            value={config.autoClosingTime}
                                            onChange={e => setConfig({ ...config, autoClosingTime: e.target.value })}
                                            style={{ width: '200px', padding: '0.75rem 1rem', borderRadius: '12px', background: '#1e293b', border: '1px solid #334155', color: 'white', colorScheme: 'dark', fontSize: '1.2rem', textAlign: 'center' }}
                                        />
                                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '1rem' }}>
                                            ⚠️ Al activarse, el sistema consolidará las ventas y gastos del día a la hora indicada.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'roles' && (
                        <div className="settings-section animate-in fade-in slide-in-from-bottom-2" style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '2.5rem', borderRadius: '24px', border: '1px solid #334155' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem', fontSize: '1.4rem', color: 'white' }}>
                                <ShieldCheck size={24} color="#f59e0b" /> Gestión de Roles y Permisos
                            </h3>
                            <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
                                Selecciona un rol para editar sus permisos. Cada permiso habilita o deshabilita un módulo en el sistema.
                            </p>
                            <RoleManagement />
                        </div>
                    )}

                    {activeTab === 'dashboard' && (
                        <div className="settings-section animate-in fade-in slide-in-from-bottom-2" style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '2rem', borderRadius: '24px', border: '1px solid #334155' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', fontSize: '1.4rem', color: 'white' }}>
                                <LayoutDashboard size={24} color="#10b981" /> Orden del Dashboard Principal
                            </h3>
                            <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '1.5rem' }}>
                                Arrastra los módulos para reordenar el panel principal del dashboard. Los cambios se guardan automáticamente.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxWidth: '600px', margin: '0 auto' }}>
                                {config.dashOrder.map((title: string, idx: number) => (
                                    <div key={title} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', padding: '0.6rem 1rem', borderRadius: '12px', border: '1px solid #1e293b', borderLeft: '4px solid #10b981' }}>
                                        <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'white' }}>{title}</span>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button type="button" disabled={idx === 0} onClick={() => {
                                                const newOrder = [...config.dashOrder];
                                                [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
                                                setConfig({ ...config, dashOrder: newOrder });
                                            }} style={{ padding: '6px', borderRadius: '8px', cursor: idx === 0 ? 'default' : 'pointer', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: idx === 0 ? '#1e293b' : '#94a3b8' }}>
                                                <ArrowUp size={18} />
                                            </button>
                                            <button type="button" disabled={idx === config.dashOrder.length - 1} onClick={() => {
                                                const newOrder = [...config.dashOrder];
                                                [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
                                                setConfig({ ...config, dashOrder: newOrder });
                                            }} style={{ padding: '6px', borderRadius: '8px', cursor: idx === config.dashOrder.length - 1 ? 'default' : 'pointer', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: idx === config.dashOrder.length - 1 ? '#1e293b' : '#94a3b8' }}>
                                                <ArrowDown size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'sidebar' && (
                        <div className="settings-section animate-in fade-in slide-in-from-bottom-2" style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '1.5rem 2rem', borderRadius: '24px', border: '1px solid #334155' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', fontSize: '1.4rem', color: 'white' }}>
                                <List size={24} color="#8b5cf6" /> Configuración de Barra Lateral
                            </h3>
                            <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '1.5rem' }}>
                                Selecciona qué módulos estarán visibles en el menú rápido y arrastra hacia arriba los más importantes.
                            </p>

                            <Reorder.Group
                                axis="y"
                                values={config.sidebarConfig}
                                onReorder={(newOrder) => setConfig({ ...config, sidebarConfig: newOrder })}
                                className="sidebar-config-list"
                                style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    gap: '0.4rem', 
                                    maxWidth: '600px', 
                                    margin: '0 auto',
                                    paddingRight: '10px'
                                }}
                            >
                                <AnimatePresence mode="popLayout">
                                    {config.sidebarConfig.map((item: any, index: number) => (
                                        <Reorder.Item
                                            key={item.key}
                                            value={item}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            layout
                                            style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                background: '#0f172a', padding: '0.6rem 1rem', borderRadius: '12px', border: '1px solid #1e293b',
                                                transition: 'background 0.2s, border 0.2s', borderLeft: item.enabled ? '4px solid #8b5cf6' : '1px solid #1e293b'
                                            }}
                                            whileDrag={{
                                                scale: 1.02,
                                                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                                                background: '#1e293b',
                                                borderColor: '#8b5cf6',
                                                zIndex: 10
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ color: '#475569', cursor: 'grab', display: 'flex', alignItems: 'center' }} className="drag-handle">
                                                    <GripVertical size={20} />
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={item.enabled}
                                                    onChange={(e) => {
                                                        const newConfig = [...config.sidebarConfig];
                                                        newConfig[index].enabled = e.target.checked;
                                                        setConfig({ ...config, sidebarConfig: newConfig });
                                                    }}
                                                    style={{ width: '18px', height: '18px', accentColor: '#8b5cf6', cursor: 'pointer' }}
                                                />
                                                <span style={{ fontWeight: 600, fontSize: '0.95rem', color: item.enabled ? 'white' : '#64748b' }}>{item.label}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    type="button"
                                                    disabled={index === 0}
                                                    onClick={() => {
                                                        const newConfig = [...config.sidebarConfig];
                                                        const temp = newConfig[index];
                                                        newConfig[index] = newConfig[index - 1];
                                                        newConfig[index - 1] = temp;
                                                        setConfig({ ...config, sidebarConfig: newConfig });
                                                    }}
                                                    style={{ padding: '6px', borderRadius: '8px', cursor: index === 0 ? 'default' : 'pointer', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: index === 0 ? '#1e293b' : '#94a3b8' }}
                                                >
                                                    <ArrowUp size={18} />
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={index === config.sidebarConfig.length - 1}
                                                    onClick={() => {
                                                        const newConfig = [...config.sidebarConfig];
                                                        const temp = newConfig[index];
                                                        newConfig[index] = newConfig[index + 1];
                                                        newConfig[index + 1] = temp;
                                                        setConfig({ ...config, sidebarConfig: newConfig });
                                                    }}
                                                    style={{ padding: '6px', borderRadius: '8px', cursor: index === config.sidebarConfig.length - 1 ? 'default' : 'pointer', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: index === config.sidebarConfig.length - 1 ? '#1e293b' : '#94a3b8' }}
                                                >
                                                    <ArrowDown size={18} />
                                                </button>
                                            </div>
                                        </Reorder.Item>
                                    ))}
                                </AnimatePresence>
                            </Reorder.Group>
                        </div>
                    )}

                    {activeTab === 'backup' && (
                        <div className="settings-section animate-in fade-in slide-in-from-bottom-2" style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '2.5rem', borderRadius: '24px', border: '1px solid #334155' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', fontSize: '1.4rem', color: 'white' }}>
                                <RefreshCcw size={24} color="#3b82f6" /> Backups de Base de Datos
                            </h3>
                            <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
                                Los backups se crean con mysqldump y se almacenan en el servidor.
                                Puedes descargarlos o eliminarlos desde aquí.
                            </p>

                            <button
                                onClick={async () => {
                                    try {
                                        setIsBackingUp(true);
                                        await backupApi.createBackup();
                                        toast.success('Backup creado exitosamente');
                                        const res = await backupApi.getBackups();
                                        setBackups(res.data);
                                    } catch (error: any) {
                                        toast.error(error.response?.data?.message || 'Error al crear backup');
                                    } finally {
                                        setIsBackingUp(false);
                                    }
                                }}
                                disabled={isBackingUp}
                                className="btn-main"
                                style={{ marginBottom: '2rem' }}
                            >
                                <RefreshCcw size={18} className={isBackingUp ? 'animate-spin' : ''} />
                                {isBackingUp ? 'Creando backup...' : 'Crear Backup Ahora'}
                            </button>

                            <div style={{ background: '#0f172a', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #334155', background: 'rgba(15,23,42,0.5)' }}>Archivo</th>
                                            <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #334155', background: 'rgba(15,23,42,0.5)' }}>Tamaño</th>
                                            <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #334155', background: 'rgba(15,23,42,0.5)' }}>Fecha</th>
                                            <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #334155', background: 'rgba(15,23,42,0.5)' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {backups.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                                                    <RefreshCcw size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                                                    <p>No hay backups todavía. Crea el primero.</p>
                                                </td>
                                            </tr>
                                        ) : backups.map((b, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                                                <td style={{ padding: '0.75rem 1rem', color: '#e2e8f0', fontSize: '0.85rem' }}>{b.filename}</td>
                                                <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.85rem' }}>{(b.size / 1024).toFixed(1)} KB</td>
                                                <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.85rem' }}>{new Date(b.createdAt).toLocaleString()}</td>
                                                <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                        <a
                                                            href={backupApi.getDownloadUrl(b.filename)}
                                                            download
                                                            style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none' }}
                                                        >
                                                            Descargar
                                                        </a>
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    await backupApi.deleteBackup(b.filename);
                                                                    toast.success('Backup eliminado');
                                                                    const res = await backupApi.getBackups();
                                                                    setBackups(res.data);
                                                                } catch (error) {
                                                                    toast.error('Error al eliminar backup');
                                                                }
                                                            }}
                                                            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'danger' && (
                        <div className="settings-section animate-in fade-in slide-in-from-bottom-2" style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', fontSize: '1.4rem', color: '#ef4444' }}>
                                <TriangleAlert size={24} /> Zona de Peligro (Acciones Críticas)
                            </h3>
                            <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '2rem' }}>
                                Estas acciones son irreversibles y solo deben ejecutarse por el Super Administrador para limpieza de datos.
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '2rem', borderRadius: '20px', border: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ color: '#ef4444', marginBottom: '1rem' }}><Trash2 size={32} /></div>
                                    <h4 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '0.75rem' }}>Borrar Historial de Ventas</h4>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>
                                        Elimina permanentemente todas las ventas, cierres de caja, gastos y aplicaciones de pago de clientes. Los productos y clientes permanecerán intactos.
                                    </p>
                                    <button 
                                        type="button"
                                        onClick={() => setDangerModal({ isOpen: true, type: 'sales' })}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                                        onMouseOver={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)')}
                                        onMouseOut={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                                    >
                                        Limpiar Ventas y Finanzas
                                    </button>
                                </div>

                                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '2rem', borderRadius: '20px', border: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ color: '#f59e0b', marginBottom: '1rem' }}><RefreshCcw size={32} /></div>
                                    <h4 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '0.75rem' }}>Reiniciar Stock (Pruebas)</h4>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>
                                        Pone todos los niveles de stock en cero para todas las sucursales y elimina todos los registros de lotes y vencimientos. Ideal para inicio de inventario físico.
                                    </p>
                                    <button 
                                        type="button"
                                        onClick={() => setDangerModal({ isOpen: true, type: 'inventory' })}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                                        onMouseOver={e => (e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)')}
                                        onMouseOut={e => (e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)')}
                                    >
                                        Reiniciar Inventario a Cero
                                    </button>
                                </div>

                                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '2rem', borderRadius: '20px', border: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ color: '#ef4444', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <ShoppingCart size={32} />
                                        <TriangleAlert size={20} className="animate-pulse" />
                                    </div>
                                    <h4 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '0.75rem' }}>Eliminar Todos los Productos</h4>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>
                                        ¡ATENCIÓN! Esta acción borrará TODOS los productos y variantes. Las categorías se conservarán intactas. Acción irreversible.
                                    </p>
                                    <button 
                                        type="button"
                                        onClick={() => setDangerModal({ isOpen: true, type: 'products' })}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                        onMouseOver={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)')}
                                        onMouseOut={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)')}
                                    >
                                        Borrar Todos los Productos
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </form>

                <PinModal 
                    isOpen={dangerModal.isOpen}
                    onClose={() => setDangerModal({ isOpen: false, type: null })}
                    onConfirm={handleConfirmReset}
                    title={
                        dangerModal.type === 'sales' ? "Confirmar Borrado de Ventas" : 
                        dangerModal.type === 'inventory' ? "Confirmar Reinicio de Stock" :
                        "Confirmar Borrado de Productos"
                    }
                    description={
                        dangerModal.type === 'sales' ? "Esta acción eliminará TODO el historial financiero. No hay marcha atrás. Ingresa el PIN de Super Admin para proceder." :
                        dangerModal.type === 'inventory' ? "Se pondrán todos los stocks a cero y se borrarán los lotes. Ingresa el PIN de Super Admin para proceder." :
                        "Se eliminarán TODOS los productos permanentemente. Las categorías se conservarán. Ingresa el PIN de Super Admin para proceder."
                    }
                />
            </main>
        </div >
    );
};

export default Settings;
