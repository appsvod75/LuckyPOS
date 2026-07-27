import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Building2, Package, Phone, Mail, MapPin, User } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { providerApi } from '../services/api';
import VirtualKeyboard from '../components/VirtualKeyboard';
import { AnimatePresence } from 'framer-motion';

interface Provider {
    id: number;
    name: string;
    vendor: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    isActive: boolean;
    createdAt: string;
}

const Suppliers: React.FC = () => {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Provider | null>(null);

    const [formName, setFormName] = useState('');
    const [formVendor, setFormVendor] = useState('');
    const [formPhone, setFormPhone] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formAddress, setFormAddress] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [activeKeyboard, setActiveKeyboard] = useState<'qwerty' | null>(null);
    const [activeField, setActiveField] = useState<string | null>(null);

    useEffect(() => {
        fetchProviders();
    }, []);

    const fetchProviders = async () => {
        try {
            setIsLoading(true);
            const res = await providerApi.getProviders();
            setProviders(res.data);
        } catch (error) {
            toast.error('Error al cargar proveedores');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormName('');
        setFormVendor('');
        setFormPhone('');
        setFormEmail('');
        setFormAddress('');
    };

    const openCreateModal = () => {
        resetForm();
        setEditingProvider(null);
        setIsModalOpen(true);
    };

    const openEditModal = (provider: Provider) => {
        setEditingProvider(provider);
        setFormName(provider.name);
        setFormVendor(provider.vendor || '');
        setFormPhone(provider.phone || '');
        setFormEmail(provider.email || '');
        setFormAddress(provider.address || '');
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formName.trim()) {
            toast.error('El nombre del proveedor es obligatorio');
            return;
        }
        try {
            setIsSubmitting(true);
            const data = {
                name: formName.trim(),
                vendor: formVendor.trim() || undefined,
                phone: formPhone.trim() || undefined,
                email: formEmail.trim() || undefined,
                address: formAddress.trim() || undefined
            };
            if (editingProvider) {
                await providerApi.updateProvider(editingProvider.id, data);
                toast.success('Proveedor actualizado');
            } else {
                await providerApi.createProvider(data);
                toast.success('Proveedor creado');
            }
            setIsModalOpen(false);
            resetForm();
            fetchProviders();
        } catch (error) {
            toast.error(editingProvider ? 'Error al actualizar proveedor' : 'Error al crear proveedor');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await providerApi.deleteProvider(deleteTarget.id);
            toast.success('Proveedor desactivado');
            setDeleteTarget(null);
            fetchProviders();
        } catch (error) {
            toast.error('Error al desactivar proveedor');
        }
    };

    return (
        <div className="suppliers-page">
            <Sidebar />
            <main className="dashboard-main">
                <header className="dash-header">
                    <div>
                        <h1>Proveedores</h1>
                        <p>Gestión de proveedores y contactos</p>
                    </div>
                    <button onClick={openCreateModal} className="btn-primary">
                        <Plus size={20} /> Nuevo Proveedor
                    </button>
                </header>

                <div className="table-container">
                    {isLoading ? (
                        <div className="loading-state">Cargando proveedores...</div>
                    ) : providers.length === 0 ? (
                        <div className="empty-state">
                            <Building2 size={48} className="empty-icon" />
                            <p>No hay proveedores registrados</p>
                            <button onClick={openCreateModal} className="btn-secondary mt-4">
                                Registrar un proveedor
                            </button>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Contacto</th>
                                    <th>Teléfono</th>
                                    <th>Email</th>
                                    <th>Dirección</th>
                                    <th className="text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {providers.map((p) => (
                                    <tr key={p.id}>
                                        <td className="font-medium">{p.name}</td>
                                        <td>
                                            {p.vendor ? (
                                                <span className="flex items-center gap-1">
                                                    <User size={14} className="text-slate-500" />
                                                    {p.vendor}
                                                </span>
                                            ) : (
                                                <span className="text-slate-500">---</span>
                                            )}
                                        </td>
                                        <td>
                                            {p.phone ? (
                                                <span className="flex items-center gap-1">
                                                    <Phone size={14} className="text-slate-500" />
                                                    {p.phone}
                                                </span>
                                            ) : (
                                                <span className="text-slate-500">---</span>
                                            )}
                                        </td>
                                        <td>
                                            {p.email ? (
                                                <span className="flex items-center gap-1">
                                                    <Mail size={14} className="text-slate-500" />
                                                    {p.email}
                                                </span>
                                            ) : (
                                                <span className="text-slate-500">---</span>
                                            )}
                                        </td>
                                        <td>
                                            {p.address ? (
                                                <span className="flex items-center gap-1">
                                                    <MapPin size={14} className="text-slate-500" />
                                                    {p.address}
                                                </span>
                                            ) : (
                                                <span className="text-slate-500">---</span>
                                            )}
                                        </td>
                                        <td className="text-right">
                                            <div className="table-actions">
                                                <button className="btn-icon-action edit" onClick={() => openEditModal(p)} title="Editar">
                                                    <Edit size={16} />
                                                </button>
                                                <button className="btn-icon-action delete" onClick={() => setDeleteTarget(p)} title="Desactivar">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingProvider ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-body">
                            <div className="form-group">
                                <label>Nombre del Proveedor *</label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={e => setFormName(e.target.value)}
                                    placeholder="Ej. Distribuidora Farmacéutica S.A."
                                    required
                                    autoFocus
                                    onFocus={() => { setActiveField('name'); setActiveKeyboard('qwerty'); }}
                                    inputMode="none"
                                />
                            </div>
                            <div className="form-group">
                                <label>Nombre del Contacto / Vendedor</label>
                                <input
                                    type="text"
                                    value={formVendor}
                                    onChange={e => setFormVendor(e.target.value)}
                                    placeholder="Ej. Juan Pérez"
                                    onFocus={() => { setActiveField('vendor'); setActiveKeyboard('qwerty'); }}
                                    inputMode="none"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Teléfono</label>
                                    <input
                                        type="tel"
                                        value={formPhone}
                                        onChange={e => setFormPhone(e.target.value)}
                                        placeholder="Ej. 7777-8888"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={formEmail}
                                        onChange={e => setFormEmail(e.target.value)}
                                        placeholder="correo@ejemplo.com"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Dirección</label>
                                <textarea
                                    value={formAddress}
                                    onChange={e => setFormAddress(e.target.value)}
                                    placeholder="Dirección completa"
                                    rows={2}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Guardando...' : editingProvider ? 'Guardar Cambios' : 'Crear Proveedor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
                    <div className="modal-content" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Desactivar Proveedor</h2>
                            <button className="close-btn" onClick={() => setDeleteTarget(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p>¿Estás seguro de desactivar a <strong>{deleteTarget.name}</strong>?</p>
                            <p className="text-sm text-slate-400 mt-2">Podrás reactivarlo después si es necesario.</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn-secondary" onClick={() => setDeleteTarget(null)}>Cancelar</button>
                            <button type="button" className="btn-primary" onClick={handleDelete} style={{ background: '#dc2626' }}>
                                <Trash2 size={18} /> Desactivar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {activeKeyboard === 'qwerty' && (
                    <VirtualKeyboard
                        value={
                            activeField === 'name' ? formName :
                            activeField === 'vendor' ? formVendor : ''
                        }
                        onChange={(val) => {
                            if (activeField === 'name') setFormName(val);
                            else if (activeField === 'vendor') setFormVendor(val);
                        }}
                        onClose={() => setActiveKeyboard(null)}
                        onConfirm={() => setActiveKeyboard(null)}
                        title={`EDITANDO ${activeField?.toUpperCase()}`}
                    />
                )}
            </AnimatePresence>

            <style>{`
                .suppliers-page { display: flex; height: 100vh; background: #0f172a; color: white; overflow: hidden; }
                .dashboard-main { flex: 1; overflow-y: auto; padding: 2rem 4rem; }
                .dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .dash-header h1 { font-size: 2rem; font-weight: 800; margin: 0; }
                .dash-header p { color: #94a3b8; margin-top: 0.25rem; }
                .btn-primary { display: flex; align-items: center; gap: 0.5rem; background: #3b82f6; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; transition: background 0.2s; }
                .btn-primary:hover:not(:disabled) { background: #2563eb; }
                .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
                .btn-secondary { background: rgba(255,255,255,0.1); color: white; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; transition: background 0.2s; }
                .btn-secondary:hover { background: rgba(255,255,255,0.15); }
                .table-container { background: #1e293b; border-radius: 12px; border: 1px solid #334155; overflow: hidden; }
                .data-table { width: 100%; border-collapse: collapse; }
                .data-table th, .data-table td { padding: 1rem 1.25rem; text-align: left; border-bottom: 1px solid #334155; }
                .data-table th { background: rgba(15, 23, 42, 0.5); font-weight: 600; color: #94a3b8; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
                .data-table tr:hover { background: rgba(255,255,255,0.02); }
                .data-table tr:last-child td { border-bottom: none; }
                .text-right { text-align: right !important; }
                .font-medium { font-weight: 500; }
                .loading-state, .empty-state { padding: 4rem; text-align: center; color: #94a3b8; display: flex; flex-direction: column; align-items: center; justify-content: center; }
                .empty-icon { color: #475569; margin-bottom: 1rem; }
                .table-actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
                .btn-icon-action { background: transparent; border: none; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
                .btn-icon-action.edit { color: #3b82f6; }
                .btn-icon-action.edit:hover { background: rgba(59, 130, 246, 0.15); }
                .btn-icon-action.delete { color: #ef4444; }
                .btn-icon-action.delete:hover { background: rgba(239, 68, 68, 0.15); }
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
                .modal-content { background: #1e293b; width: 100%; max-width: 540px; border-radius: 16px; border: 1px solid #334155; box-shadow: 0 20px 40px rgba(0,0,0,0.4); overflow: hidden; }
                .modal-header { padding: 1.5rem; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; }
                .modal-header h2 { font-size: 1.25rem; font-weight: 700; margin: 0; }
                .close-btn { background: none; border: none; color: #94a3b8; font-size: 1.5rem; cursor: pointer; }
                .close-btn:hover { color: white; }
                .modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
                .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
                .form-group label { font-size: 0.875rem; font-weight: 600; color: #cbd5e1; }
                .form-group input, .form-group textarea { background: #0f172a; border: 1px solid #334155; padding: 0.75rem 1rem; border-radius: 8px; color: white; font-size: 1rem; outline: none; transition: border-color 0.2s; font-family: inherit; }
                .form-group input:focus, .form-group textarea:focus { border-color: #3b82f6; }
                .form-group textarea { resize: vertical; min-height: 60px; }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; padding-top: 0.5rem; }
                .flex { display: flex; }
                .items-center { align-items: center; }
                .gap-1 { gap: 0.25rem; }
                .text-sm { font-size: 0.875rem; }
                .mt-4 { margin-top: 1rem; }
                .mt-2 { margin-top: 0.5rem; }
                .text-slate-400 { color: #94a3b8; }
                .text-slate-500 { color: #64748b; }
            `}</style>
        </div>
    );
};

export default Suppliers;