import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { roleApi } from '../services/api';

const ALL_PERMISSIONS = [
    { key: 'pos', label: 'Ventas (POS)' },
    { key: 'summary', label: 'Resumen del Día' },
    { key: 'inventory', label: 'Inventario' },
    { key: 'transfers', label: 'Traslados' },
    { key: 'lookup', label: 'Consultar' },
    { key: 'replenishment', label: 'Reposición' },
    { key: 'products', label: 'Productos' },
    { key: 'categories', label: 'Categorías' },
    { key: 'suppliers', label: 'Proveedores' },
    { key: 'clients', label: 'Clientes' },
    { key: 'receivable', label: 'Cuentas por Cobrar' },
    { key: 'payable', label: 'Cuentas por Pagar' },
    { key: 'expenses', label: 'Gastos' },
    { key: 'history', label: 'Historial de Ventas' },
    { key: 'closings', label: 'Cortes de Caja' },
    { key: 'reports', label: 'Reportes' },
    { key: 'projections', label: 'Proyecciones' },
    { key: 'admin', label: 'Dashboard Admin' },
    { key: 'users', label: 'Personal' },
    { key: 'branches', label: 'Sucursales' },
    { key: 'settings', label: 'Configuración' },
];

const RoleManagement: React.FC = () => {
    const [roles, setRoles] = useState<any[]>([]);
    const [editingRole, setEditingRole] = useState<any>(null);
    const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        roleApi.getRoles().then(res => setRoles(res.data)).catch(() => toast.error('Error al cargar roles'));
    }, []);

    const openEditor = (role: any) => {
        const perms = role.permissions ? (typeof role.permissions === 'string' ? JSON.parse(role.permissions) : role.permissions) : [];
        setEditingRole(role);
        setSelectedPerms(perms);
    };

    const togglePerm = (key: string) => {
        setSelectedPerms(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]);
    };

    const savePermissions = async () => {
        if (!editingRole) return;
        try {
            setSaving(true);
            await roleApi.updateRole(editingRole.id, { permissions: selectedPerms });
            toast.success(`Permisos de "${editingRole.name}" actualizados`);
            const res = await roleApi.getRoles();
            setRoles(res.data);
            setEditingRole(null);
        } catch (error) {
            toast.error('Error al guardar permisos');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                {roles.map(role => (
                    <div key={role.id} style={{
                        background: 'rgba(15,23,42,0.5)', borderRadius: '16px', border: '1px solid #334155',
                        padding: '1.5rem', flex: '1 1 280px', cursor: 'pointer',
                        transition: 'all 0.2s', opacity: editingRole?.id === role.id ? 0.5 : 1
                    }} onClick={() => !editingRole && openEditor(role)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <Shield size={24} color={role.name === 'Super Admin' ? '#f59e0b' : '#3b82f6'} />
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'white' }}>{role.name}</h3>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{role._count?.users || 0} usuarios</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                            {(() => {
                                const perms = role.permissions ? (typeof role.permissions === 'string' ? JSON.parse(role.permissions) : role.permissions) : [];
                                return perms.slice(0, 5).map((p: string) => (
                                    <span key={p} style={{ fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(59,130,246,0.1)', color: '#60a5fa', fontWeight: 600 }}>
                                        {ALL_PERMISSIONS.find(a => a.key === p)?.label || p}
                                    </span>
                                ));
                            })()}
                            {(() => {
                                const perms = role.permissions ? (typeof role.permissions === 'string' ? JSON.parse(role.permissions) : role.permissions) : [];
                                return perms.length > 5 ? <span style={{ fontSize: '0.6rem', color: '#64748b' }}>+{perms.length - 5}</span> : null;
                            })()}
                        </div>
                    </div>
                ))}
            </div>

            {editingRole && (
                <div style={{ marginTop: '2rem', background: 'rgba(15,23,42,0.5)', borderRadius: '16px', border: '1px solid #334155', padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Shield size={22} color="#f59e0b" /> Permisos: {editingRole.name}
                        </h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn-secondary" onClick={() => setEditingRole(null)}>Cancelar</button>
                            <button className="btn-primary" onClick={savePermissions} disabled={saving}>
                                <Save size={16} /> {saving ? 'Guardando...' : 'Guardar Permisos'}
                            </button>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                        {ALL_PERMISSIONS.map(p => (
                            <label key={p.key} style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1rem',
                                borderRadius: '10px', background: selectedPerms.includes(p.key) ? 'rgba(59,130,246,0.1)' : 'transparent',
                                border: `1px solid ${selectedPerms.includes(p.key) ? 'rgba(59,130,246,0.3)' : '#1e293b'}`,
                                cursor: 'pointer', transition: 'all 0.2s', color: selectedPerms.includes(p.key) ? '#e2e8f0' : '#64748b'
                            }}>
                                {selectedPerms.includes(p.key)
                                    ? <CheckCircle size={18} color="#3b82f6" />
                                    : <XCircle size={18} color="#475569" />
                                }
                                <span style={{ fontSize: '0.85rem', fontWeight: selectedPerms.includes(p.key) ? 700 : 500 }}>{p.label}</span>
                                <input type="checkbox" checked={selectedPerms.includes(p.key)} onChange={() => togglePerm(p.key)} style={{ display: 'none' }} />
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleManagement;