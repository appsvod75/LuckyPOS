import React, { useState, useEffect } from 'react';
import { 
    X, Pill, DollarSign, Package, Check, Layers, Info, Hash, AlertCircle,
    Image as ImageIcon, Plus, Trash2, Truck, Store, CheckCircle2 
} from 'lucide-react';
import { productApi, providerApi } from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import VirtualKeyboard from './VirtualKeyboard';
import NumericKeyboard from './NumericKeyboard';
import { placeholder } from '../utils/placeholder';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveSuccess: (product: any) => void;
    editingProduct?: any;
    initialName?: string;
    categories?: any[];
    providers?: any[];
}

const ProductModal: React.FC<ProductModalProps> = ({ 
    isOpen, 
    onClose, 
    onSaveSuccess, 
    editingProduct, 
    initialName,
    categories: propCategories,
    providers: propProviders
}) => {
    const [categories, setCategories] = useState<any[]>(propCategories || []);
    const [providers, setProviders] = useState<any[]>(propProviders || []);
    const [loading, setLoading] = useState(false);
    const [loadingAi, setLoadingAi] = useState(false);
    const [showNewCatForm, setShowNewCatForm] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [isSavingCat, setIsSavingCat] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        categoryId: '',
        basePrice: '',
        isMedicine: false,
        isService: false,
        description: '',
        imageUrl: '',
        variants: [] as any[],
        minStock: '5',
        maxStock: '100',
        providerIds: [] as number[]
    });

    const [activeKeyboard, setActiveKeyboard] = useState<'qwerty' | 'numeric' | null>(null);
    const [activeField, setActiveField] = useState<string | null>(null);
    const [activeVariantIdx, setActiveVariantIdx] = useState<number | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        // Sync local states if props change or load for the first time
        if (propCategories && propCategories.length > 0) {
            setCategories(propCategories);
        } else if (categories.length === 0) {
            fetchCategories();
        }

        if (propProviders && propProviders.length > 0) {
            setProviders(propProviders);
        } else if (providers.length === 0) {
            fetchProviders();
        }

        if (editingProduct) {
            setFormData({
                name: editingProduct.name,
                sku: editingProduct.sku || '',
                categoryId: editingProduct.categoryId?.toString() || '',
                basePrice: editingProduct.basePrice?.toString() || editingProduct.base_price?.toString() || '',
                isMedicine: !!editingProduct.isMedicine || !!editingProduct.is_medicine,
                isService: !!editingProduct.isService || !!editingProduct.is_service,
                description: editingProduct.description || '',
                imageUrl: editingProduct.imageUrl || '',
                variants: editingProduct.variants || [],
                minStock: (editingProduct.minStock || editingProduct.min_stock)?.toString() || '5',
                maxStock: (editingProduct.maxStock || editingProduct.max_stock)?.toString() || '100',
                providerIds: editingProduct.providers?.map((p: any) => p.id) || []
            });
        } else {
            setFormData({
                name: initialName || '',
                sku: '',
                categoryId: '',
                basePrice: '',
                isMedicine: false,
                isService: false,
                description: '',
                imageUrl: '',
                variants: [],
                minStock: '5',
                maxStock: '100',
                providerIds: []
            });
        }
    }, [isOpen, editingProduct, initialName, propCategories, propProviders]);

    const fetchCategories = async () => {
        try {
            const res = await productApi.getCategories();
            setCategories(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchProviders = async () => {
        try {
            const res = await providerApi.getProviders();
            setProviders(res.data);
        } catch (err) { console.error(err); }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const sanitizedPayload = {
            ...formData,
            name: formData.name.trim().toUpperCase(),
            sku: formData.sku && formData.sku.trim() !== "" ? formData.sku.trim().toUpperCase() : '',
            categoryId: formData.categoryId || null,
            basePrice: formData.basePrice || '0',
            minStock: formData.minStock || '0',
            maxStock: formData.maxStock || '0',
            variants: formData.variants
                .filter(v => v.name.trim() !== '' && v.quantity !== '' && v.price !== '')
                .map(v => ({
                    ...v,
                    name: v.name.trim().toUpperCase(),
                    quantity: v.quantity || '1',
                    price: v.price || '0'
                }))
        };

        try {
            let res;
            if (editingProduct) {
                res = await productApi.updateProduct(editingProduct.id, sanitizedPayload);
            } else {
                res = await productApi.createProduct(sanitizedPayload);
            }
            onSaveSuccess(res.data);
            toast.success('Producto guardado correctamente');
            onClose();
        } catch (err: any) {
            console.error('Error saving product:', err);
            const msg = err.response?.data?.message || 'Error al guardar producto';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePermanent = async () => {
        if (!editingProduct) return;
        const loadingToast = toast.loading('Eliminando permanentemente...');
        try {
            await productApi.deleteProductPermanent(editingProduct.id);
            toast.success('Producto eliminado del sistema definitivamente', { id: loadingToast });
            onSaveSuccess(null);
            onClose();
        } catch (err: any) {
            const msg = err.response?.data?.message || 'No se puede eliminar: tiene historial de ventas.';
            toast.error(msg, { id: loadingToast });
        }
    };

    const handleGenerateAi = async () => {
        if (!formData.name) return toast.error('Ingrese el nombre de la medicina');
        setLoadingAi(true);
        try {
            const res = await productApi.generateMedicalInfo(formData.name);
            const info = res.data;
            const aiDescription = `
🧪 Ficha Técnica Generada por IA:
------------------------------------------
• Principio Activo: ${info.principioActivo}
• Acción: ${info.paraQueSirve}
• Dosis Adulto: ${info.dosisAdulto}
• Dosis Niños: ${info.dosisNino}
• Contraindicaciones: ${info.contraindicaciones}
• Efectos Secundarios: ${info.efectosSecundarios}
            `.trim();
            setFormData({ ...formData, description: aiDescription, isMedicine: true });
            toast.success('¡Ficha médica generada exitosamente!');
        } catch (err) {
            toast.error('Error al generar información con IA');
        } finally {
            setLoadingAi(false);
        }
    };

    const handleAddCategory = async () => {
        if (!newCatName.trim()) return;
        setIsSavingCat(true);
        const randomColors = ['#ef4444', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#06b6d4'];
        const colorHex = randomColors[Math.floor(Math.random() * randomColors.length)];
        try {
            const res = await productApi.createCategory({ name: newCatName, colorHex });
            setCategories([...categories, res.data]);
            setFormData({ ...formData, categoryId: res.data.id.toString() });
            setNewCatName('');
            setShowNewCatForm(false);
            toast.success('Categoría añadida');
        } catch (err) {
            toast.error('Error al crear categoría');
        } finally {
            setIsSavingCat(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="modal-overlay" style={{ zIndex: 3000 }}>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="product-modal"
                >
                    <header className="modal-header">
                        <div className="header-info">
                            <div className="icon-badge">
                                {formData.isMedicine ? <Pill size={24} /> : <Package size={24} />}
                            </div>
                            <div>
                                <h2>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                                <p>{editingProduct ? `ID: #${editingProduct.id} • SKU: ${editingProduct.sku || 'N/A'}` : 'Complete la información para el catálogo'}</p>
                            </div>
                        </div>
                        <button className="btn-close" onClick={onClose}>
                            <X size={24} />
                        </button>
                    </header>

                    <form onSubmit={handleSave} className="modal-body custom-scroll">
                        <div className="form-sections">
                            {/* SECCIÓN 1: GENERAL */}
                            <div className="p-section main-info">
                                <h3 className="section-title"><Package size={16} /> Información General</h3>
                                <div className="general-top-grid">
                                    <div className="field flex-75">
                                        <label>Nombre del Producto / Descripción</label>
                                        <input
                                            required
                                            type="text"
                                            autoFocus={!editingProduct}
                                            placeholder="EJ: PARACETAMOL 500MG"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                                            onFocus={() => { setActiveField('name'); setActiveKeyboard('qwerty'); }}
                                            inputMode="none"
                                        />
                                    </div>
                                    <div className="field flex-25">
                                        <label>SKU (Opcional)</label>
                                        <input
                                            type="text"
                                            placeholder="SKU-001"
                                            value={formData.sku}
                                            onChange={e => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                                            onFocus={() => { setActiveField('sku'); setActiveKeyboard('qwerty'); }}
                                            inputMode="none"
                                        />
                                    </div>
                                </div>

                                <div className="general-bottom-grid">
                                    <div className="toggles-compact">
                                        <label className={`compact-toggle ${formData.isMedicine ? 'active' : ''}`}>
                                            <input type="checkbox" hidden checked={formData.isMedicine} onChange={e => {
                                                const isMed = e.target.checked;
                                                let newCatId = formData.categoryId;
                                                if (isMed) {
                                                    // Buscamos FARMACIA de manera insensible a mayúsculas
                                                    const farmCat = categories.find(c => c.name.toString().toUpperCase().includes('FARMACIA'));
                                                    if (farmCat) newCatId = farmCat.id.toString();
                                                }
                                                setFormData({ ...formData, isMedicine: isMed, categoryId: newCatId });
                                            }} />
                                            <Pill size={14} />
                                            <span>Medicina</span>
                                        </label>
                                        <label className={`compact-toggle ${formData.isService ? 'active' : ''}`}>
                                            <input type="checkbox" hidden checked={formData.isService} onChange={e => setFormData({ ...formData, isService: e.target.checked })} />
                                            <CheckCircle2 size={14} />
                                            <span>Servicio</span>
                                        </label>
                                    </div>
                                    
                                    <div className="field category-field">
                                        <label>Categoría</label>
                                        <div className="category-select-wrapper">
                                            <select
                                                required
                                                value={formData.categoryId}
                                                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                                            >
                                                <option value="">Seleccione...</option>
                                                {categories.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                            <button type="button" className="btn-add-inline" onClick={() => setShowNewCatForm(!showNewCatForm)}>
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                        {showNewCatForm && (
                                            <div className="new-cat-inline">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    placeholder="Nueva..."
                                                    value={newCatName}
                                                    onChange={e => setNewCatName(e.target.value.toUpperCase())}
                                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                                                    onFocus={() => { setActiveField('newCatName'); setActiveKeyboard('qwerty'); }}
                                                    inputMode="none"
                                                />
                                                <button type="button" className="btn-save-cat" onClick={handleAddCategory} disabled={isSavingCat}>
                                                    {isSavingCat ? '...' : <Check size={14} />}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* SECCIÓN 2: STOCK Y PRECIOS */}
                            <div className="p-section pricing-section">
                                <h3 className="section-title"><DollarSign size={16} /> Stock y Precios</h3>
                                <div className="stock-pricing-grid">
                                    <div className="field">
                                        <label>Stock Mínimo</label>
                                        <input type="number" value={formData.minStock} onFocus={e => { e.target.select(); setActiveField('minStock'); setActiveKeyboard('numeric'); }} onChange={e => setFormData({ ...formData, minStock: e.target.value })} inputMode="none" />
                                    </div>
                                    <div className="field">
                                        <label>Stock Máximo</label>
                                        <input type="number" value={formData.maxStock} onFocus={e => { e.target.select(); setActiveField('maxStock'); setActiveKeyboard('numeric'); }} onChange={e => setFormData({ ...formData, maxStock: e.target.value })} inputMode="none" />
                                    </div>
                                    <div className="field highlight">
                                        <label>Precio de Venta (Base)</label>
                                        <div className="input-with-icon">
                                            <DollarSign size={18} />
                                            <input required type="number" step="0.01" value={formData.basePrice} 
                                                onChange={e => setFormData({ ...formData, basePrice: e.target.value })} 
                                                onFocus={() => { setActiveField('basePrice'); setActiveKeyboard('numeric'); }}
                                                inputMode="none"
                                                onBlur={e => {
                                                    const val = parseFloat(e.target.value);
                                                    if(!isNaN(val)) setFormData({ ...formData, basePrice: val.toFixed(2) });
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECCIÓN 3: IMAGEN */}
                            <div className="p-section image-section">
                                <h3 className="section-title"><ImageIcon size={16} /> Imagen del Producto</h3>
                                <div className="image-horizontal-grid">
                                    <div className="field full-input">
                                        <label>URL de la imagen</label>
                                        <input type="url" placeholder="https://ejemplo.com/foto.jpg" value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} onFocus={() => { setActiveField('imageUrl'); setActiveKeyboard('qwerty'); }} inputMode="none" />
                                    </div>
                                    <div className="image-preview-box">
                                        {formData.imageUrl ? (
                                            <img src={formData.imageUrl} alt="Preview" onError={e => e.currentTarget.src=placeholder('Error', 100)} />
                                        ) : (
                                            <ImageIcon size={32} />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* SECCIÓN 4: IA Y TIERS */}
                            <div className="p-section ia-tiers-grid">
                                <div className="ia-column">
                                    <div className="section-header">
                                        <h3 className="section-title"><Info size={16} /> Información Técnica (IA)</h3>
                                        <button type="button" className="btn-ai" onClick={handleGenerateAi} disabled={loadingAi}>
                                            {loadingAi ? 'Generando...' : <><Pill size={14} /> Generar</>}
                                        </button>
                                    </div>
                                    <textarea 
                                        className="modern-textarea" 
                                        placeholder="Descripción o ficha generada..." 
                                        value={formData.description} 
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        onFocus={() => { setActiveField('description'); setActiveKeyboard('qwerty'); }}
                                        inputMode="none"
                                    />
                                </div>
                                <div className="tiers-column">
                                    <div className="section-header">
                                        <h3 className="section-title"><Layers size={16} /> Tiers</h3>
                                        <button type="button" className="btn-add-tier" onClick={() => setFormData({...formData, variants: [...formData.variants, {name: '', quantity: '', price: ''}]})}>
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <div className="variants-list custom-scroll">
                                        {formData.variants.length > 0 && (
                                            <div className="variant-header">
                                                <span>Unidad</span>
                                                <span>Cant</span>
                                                <span>Precio</span>
                                                <span></span>
                                            </div>
                                        )}
                                        {formData.variants.map((v, idx) => (
                                            <div key={idx} className="variant-row-compact">
                                                <input type="text" placeholder="Unidad" value={v.name} onChange={e => {
                                                    const nv = [...formData.variants]; nv[idx].name = e.target.value.toUpperCase(); setFormData({...formData, variants: nv});
                                                }} onFocus={() => { setActiveField('variantName'); setActiveVariantIdx(idx); setActiveKeyboard('qwerty'); }} inputMode="none" />
                                                <input type="number" placeholder="Cant" value={v.quantity} onChange={e => {
                                                    const nv = [...formData.variants]; nv[idx].quantity = e.target.value; setFormData({...formData, variants: nv});
                                                }} onFocus={() => { setActiveField('variantQty'); setActiveVariantIdx(idx); setActiveKeyboard('numeric'); }} inputMode="none" />
                                                <input type="number" step="0.01" placeholder="Precio" value={v.price} 
                                                    onChange={e => {
                                                        const nv = [...formData.variants]; nv[idx].price = e.target.value; setFormData({...formData, variants: nv});
                                                    }} 
                                                    onFocus={() => { setActiveField('variantPrice'); setActiveVariantIdx(idx); setActiveKeyboard('numeric'); }}
                                                    inputMode="none"
                                                    onBlur={e => {
                                                        const val = parseFloat(e.target.value);
                                                        if(!isNaN(val)) {
                                                            const nv = [...formData.variants]; nv[idx].price = val.toFixed(2); setFormData({...formData, variants: nv});
                                                        }
                                                    }}
                                                />
                                                <button type="button" className="btn-del-tier" onClick={() => setFormData({...formData, variants: formData.variants.filter((_, i) => i !== idx)})}>
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        {formData.variants.length === 0 && <p style={{color: '#64748b', fontSize: '0.75rem', textAlign: 'center', marginTop: '1rem'}}>No hay tiers personalizados</p>}
                                    </div>
                                </div>
                            </div>

                            {/* SECCIÓN 5: PROVEEDORES */}
                            <div className="p-section providers-section">
                                <h3 className="section-title"><Truck size={16} /> Proveedores</h3>
                                <div className="provider-scroll-grid">
                                    {providers.map(p => {
                                        const isSelected = formData.providerIds.includes(p.id);
                                        return (
                                            <div key={p.id} className={`p-chip ${isSelected ? 'selected' : ''}`} onClick={() => {
                                                const newIds = isSelected ? formData.providerIds.filter(id => id !== p.id) : [...formData.providerIds, p.id];
                                                setFormData({ ...formData, providerIds: newIds });
                                            }}>
                                                {isSelected ? <CheckCircle2 size={12} /> : <Store size={12} />}
                                                <span>{p.name}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* SECCIÓN 5: DANGER ZONE (Solo edición) */}
                            {editingProduct && (
                                <div className="p-section danger-zone animate-in">
                                    <div className="danger-header">
                                        <AlertCircle size={20} />
                                        <h3>Zona de Peligro</h3>
                                    </div>
                                    <div className="danger-content">
                                        <p>Elimina permanentemente este producto del catálogo. Esta acción no se puede deshacer y fallará si el producto tiene historial de ventas.</p>
                                        <button type="button" className="btn-danger-outline" onClick={() => {
                                            if(window.confirm('¿ESTÁS SEGURO? Esta acción es irreversible.')) handleDeletePermanent();
                                        }}>
                                            Eliminar Definitivamente
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <footer className="modal-footer">
                            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
                            <button type="submit" className="btn-save" disabled={loading}>
                                {loading ? 'Procesando...' : <><Check size={20} /> {editingProduct ? 'Actualizar Producto' : 'Guardar Producto'}</>}
                            </button>
                        </footer>
                    </form>

                    <AnimatePresence>
                        {activeKeyboard === 'qwerty' && (
                            <VirtualKeyboard 
                                value={
                                    activeField === 'name' ? formData.name :
                                    activeField === 'sku' ? formData.sku :
                                    activeField === 'newCatName' ? newCatName :
                                    activeField === 'description' ? formData.description :
                                    activeField === 'imageUrl' ? formData.imageUrl :
                                    activeField === 'variantName' && activeVariantIdx !== null ? formData.variants[activeVariantIdx].name :
                                    ''
                                }
                                onChange={(val) => {
                                    if (activeField === 'name') setFormData({ ...formData, name: val });
                                    else if (activeField === 'sku') setFormData({ ...formData, sku: val });
                                    else if (activeField === 'newCatName') setNewCatName(val);
                                    else if (activeField === 'description') setFormData({ ...formData, description: val });
                                    else if (activeField === 'imageUrl') setFormData({ ...formData, imageUrl: val });
                                    else if (activeField === 'variantName' && activeVariantIdx !== null) {
                                        const nv = [...formData.variants]; nv[activeVariantIdx].name = val; setFormData({ ...formData, variants: nv });
                                    }
                                }}
                                onClose={() => setActiveKeyboard(null)}
                                onConfirm={() => setActiveKeyboard(null)}
                                title={`EDITANDO ${activeField?.toUpperCase()}`}
                            />
                        )}
                        {activeKeyboard === 'numeric' && (
                            <NumericKeyboard 
                                value={
                                    activeField === 'minStock' ? formData.minStock :
                                    activeField === 'maxStock' ? formData.maxStock :
                                    activeField === 'basePrice' ? formData.basePrice :
                                    activeField === 'variantQty' && activeVariantIdx !== null ? formData.variants[activeVariantIdx].quantity.toString() :
                                    activeField === 'variantPrice' && activeVariantIdx !== null ? formData.variants[activeVariantIdx].price.toString() :
                                    ''
                                }
                                onChange={(val) => {
                                    if (activeField === 'minStock') setFormData({ ...formData, minStock: val });
                                    else if (activeField === 'maxStock') setFormData({ ...formData, maxStock: val });
                                    else if (activeField === 'basePrice') setFormData({ ...formData, basePrice: val });
                                    else if (activeField === 'variantQty' && activeVariantIdx !== null) {
                                        const nv = [...formData.variants]; nv[activeVariantIdx].quantity = val; setFormData({ ...formData, variants: nv });
                                    }
                                    else if (activeField === 'variantPrice' && activeVariantIdx !== null) {
                                        const nv = [...formData.variants]; nv[activeVariantIdx].price = val; setFormData({ ...formData, variants: nv });
                                    }
                                }}
                                onClose={() => setActiveKeyboard(null)}
                                onConfirm={() => setActiveKeyboard(null)}
                                title={`INGRESANDO ${activeField?.toUpperCase()}`}
                            />
                        )}
                    </AnimatePresence>

                    <style>{`
                        .modal-overlay {
                            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                            background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px);
                            display: flex; align-items: center; justify-content: center; padding: 20px;
                        }
                        .product-modal {
                            background: #1e293b; border-radius: 28px; border: 1px solid #334155;
                            display: flex; flex-direction: column; max-height: 90vh;
                            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); overflow: hidden;
                        }
                        .modal-header {
                            padding: 1.5rem 2rem; background: #1e293b; border-bottom: 1px solid #334155;
                            display: flex; justify-content: space-between; align-items: center;
                        }
                        .header-info { display: flex; gap: 1.25rem; align-items: center; }
                        .icon-badge {
                            width: 48px; height: 48px; background: rgba(59, 130, 246, 0.1);
                            color: #3b82f6; border-radius: 14px; display: flex;
                            align-items: center; justify-content: center;
                        }
                        .modal-header h2 { font-size: 1.5rem; font-weight: 800; color: white; margin-bottom: 0.25rem; }
                        .modal-header p { font-size: 0.85rem; color: #94a3b8; }
                        .btn-close { background: none; border: none; color: #64748b; cursor: pointer; transition: color 0.2s; }
                        .btn-close:hover { color: white; }

                        .modal-body { padding: 1.5rem 2rem; overflow-y: auto; flex: 1; }
                        .form-sections { display: flex; flex-direction: column; gap: 1rem; }

                        input, select {
                            background: #0f172a; border: 1px solid #334155; border-radius: 12px;
                            padding: 0.6rem 0.8rem; color: white; font-size: 0.85rem; outline: none; transition: all 0.2s;
                            width: 100%;
                            cursor: pointer;
                        }
                        input:focus, select:focus { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
                        select option { background: #1e293b; color: white; }
                        
                        .p-section { background: rgba(30, 41, 59, 0.3); border: 1px solid #334155; border-radius: 18px; padding: 1.25rem; }
                        .section-title { font-size: 0.75rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }

                        .field { display: flex; flex-direction: column; gap: 0.4rem; }
                        .field label { font-size: 0.75rem; font-weight: 700; color: #64748b; margin-left: 0.2rem; text-transform: uppercase; }
                        
                        .general-top-grid { display: flex; gap: 1.25rem; }
                        .flex-75 { flex: 3; }
                        .flex-25 { flex: 1; }

                        .general-bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-top: 1rem; align-items: end; }
                        .toggles-compact { display: flex; gap: 0.75rem; }
                        .compact-toggle {
                            flex: 1; background: #0f172a; border: 1px solid #334155; border-radius: 12px;
                            padding: 0.75rem; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; transition: all 0.2s;
                        }
                        .compact-toggle.active { background: rgba(59, 130, 246, 0.1); border-color: #3b82f6; }
                        .compact-toggle span { font-size: 0.8rem; font-weight: 700; color: #64748b; }
                        .compact-toggle.active span { color: #3b82f6; }

                        .stock-pricing-grid { display: grid; grid-template-columns: 1fr 1fr 1.5fr; gap: 1rem; }
                        
                        .image-horizontal-grid { display: flex; gap: 1.25rem; align-items: end; }
                        .full-input { flex: 1; }
                        .image-preview-box { width: 100px; height: 100px; background: #0f172a; border: 1px dashed #334155; border-radius: 12px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
                        .image-preview-box img { width: 100%; height: 100%; object-fit: contain; }

                        .ia-tiers-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 1.5rem; }
                        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
                        .btn-ai, .btn-add-tier { padding: 0.4rem 0.8rem; border-radius: 10px; font-size: 0.7rem; font-weight: 800; cursor: pointer; border: none; display: flex; align-items: center; gap: 0.4rem; }
                        .btn-ai { background: #8b5cf6; color: white; }
                        .btn-add-tier { background: #10b981; color: white; padding: 0.4rem; }

                        .variant-header { display: grid; grid-template-columns: 1.5fr 1fr 1.2fr 30px; gap: 0.4rem; margin-bottom: 0.5rem; padding: 0 0.4rem; }
                        .variant-header span { font-size: 0.65rem; font-weight: 800; color: #64748b; text-transform: uppercase; }

                        .variant-row-compact { display: grid; grid-template-columns: 1.5fr 1fr 1.2fr 30px; gap: 0.4rem; margin-bottom: 0.4rem; }
                        .variant-row-compact input { padding: 0.4rem 0.6rem; font-size: 0.8rem; }
                        .btn-del-tier { background: none; border: none; color: #ef4444; cursor: pointer; opacity: 0.6; }
                        
                        .modern-textarea { 
                            width: 100%; min-height: 120px; font-size: 0.8rem; 
                            background: #0f172a; border: 1px solid #334155; border-radius: 12px;
                            color: #cbd5e1; padding: 0.8rem; outline: none; transition: all 0.2s;
                            resize: none; line-height: 1.6;
                        }
                        .modern-textarea:focus { border-color: #8b5cf6; box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1); }

                        .provider-scroll-grid { display: flex; flex-wrap: wrap; gap: 0.4rem; }
                        .p-chip { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 0.4rem 0.6rem; font-size: 0.7rem; font-weight: 700; color: #94a3b8; cursor: pointer; display: flex; align-items: center; gap: 0.4rem; }
                        .p-chip.selected { background: rgba(16, 185, 129, 0.1); border-color: #10b981; color: #10b981; }

                        .confirm-modal-v2 { } /* placeholder */

                        .danger-zone { background: rgba(239, 68, 68, 0.03); border: 2px dashed rgba(239, 68, 68, 0.2); }
                        .danger-header { display: flex; align-items: center; gap: 0.75rem; color: #ef4444; margin-bottom: 1rem; }
                        .danger-header h3 { font-size: 1rem; font-weight: 900; text-transform: uppercase; }
                        .danger-content { display: flex; justify-content: space-between; align-items: center; gap: 2rem; }
                        .danger-content p { font-size: 0.85rem; color: #94a3b8; }
                        .btn-danger-outline {
                            padding: 0.75rem 1.25rem; border: 1px solid #ef4444; background: transparent;
                            color: #ef4444; border-radius: 12px; font-weight: 800; font-size: 0.75rem;
                            cursor: pointer; transition: all 0.2s; white-space: nowrap;
                        }
                        .btn-danger-outline:hover { background: #ef4444; color: white; }

                        .modal-footer {
                            padding: 1.5rem 2rem; background: #1e293b; border-top: 1px solid #334155;
                            display: flex; justify-content: flex-end; gap: 1rem;
                        }
                        .btn-cancel { background: transparent; border: 1px solid #334155; color: #94a3b8; padding: 0.85rem 2rem; border-radius: 14px; font-weight: 700; cursor: pointer; }
                        .btn-save { background: #3b82f6; color: white; border: none; padding: 0.85rem 2.5rem; border-radius: 14px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 0.75rem; box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3); }
                        .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

                        .custom-scroll::-webkit-scrollbar { width: 6px; }
                        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
                        .custom-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }

                        @media (max-width: 768px) {
                            .field-grid, .field-grid.three-cols, .tiers-ai-grid, .image-providers-grid { grid-template-columns: 1fr; }
                            .danger-content { flex-direction: column; text-align: center; }
                        }
                    `}</style>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ProductModal;
