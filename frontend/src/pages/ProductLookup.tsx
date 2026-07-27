import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { productApi } from '../services/api';
import { Search, Camera, Package, DollarSign, Layers, AlertCircle, CheckCircle2, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductLookup: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showScanner, setShowScanner] = useState(false);
    const [cameraError, setCameraError] = useState('');
    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [barcodeResult, setBarcodeResult] = useState('');
    const searchRef = useRef<HTMLDivElement>(null);

    // Load all products once
    useEffect(() => {
        productApi.getProducts(undefined, true).then(res => setAllProducts(res.data)).catch(() => {});
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filteredResults = searchQuery.trim()
        ? allProducts.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.sku && p.sku.toLowerCase() === searchQuery.toLowerCase())
          ).slice(0, 12)
        : [];

    useEffect(() => {
        return () => stopCamera();
    }, []);

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
    };

    const startCamera = async () => {
        setCameraError('');
        setShowScanner(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
            scanBarcode();
        } catch (err) {
            setCameraError('No se pudo acceder a la cámara. Verifica los permisos.');
            setShowScanner(false);
        }
    };

    const scanBarcode = () => {
        const BD = (window as any).BarcodeDetector;
        if (!BD) {
            setCameraError('Tu navegador no soporta detección de códigos. Ingresa el código manualmente.');
            setShowScanner(false);
            stopCamera();
            return;
        }
        const detector = new BD({ formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'qr', 'upc_a', 'upc_e'] });
        if (!detector) return;
        if (!detector) {
            setCameraError('Tu navegador no soporta detección de códigos. Ingresa el código manualmente.');
            setShowScanner(false);
            stopCamera();
            return;
        }

        const scan = async () => {
            if (!videoRef.current || videoRef.current.readyState !== 4) {
                setTimeout(scan, 500);
                return;
            }
            try {
                const codes = await detector.detect(videoRef.current);
                if (codes.length > 0) {
                    const code = codes[0].rawValue;
                    setBarcodeResult(code);
                    setSearchQuery(code);
                    stopCamera();
                    setShowScanner(false);
                    const found = allProducts.find(p => p.sku && p.sku.toLowerCase() === code.toLowerCase());
                    if (found) selectProduct(found);
                    else setError('Producto no encontrado con ese código');
                    return;
                }
            } catch (e) { }
            setTimeout(scan, 1000);
        };
        scan();
    };

    const selectProduct = (p: any) => {
        setProduct(p);
        setSearchQuery(p.name);
        setError('');
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    return (
        <div className="products-page" style={{ background: '#0f172a', color: 'white' }}>
            <Sidebar />
            <main style={{ flex: 1, padding: '2rem 4rem', overflow: 'auto' }}>
                <header style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Consultar Producto</h1>
                    <p style={{ color: '#94a3b8' }}>Busca por nombre, SKU o escanea el código de barras</p>
                </header>

                <div ref={searchRef} style={{ display: 'flex', gap: '1rem', maxWidth: '600px', marginBottom: '2rem', position: 'relative' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', zIndex: 5 }} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => { setSearchQuery(e.target.value); setShowDropdown(true); }}
                            onFocus={() => setShowDropdown(true)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && filteredResults.length > 0) {
                                    setShowDropdown(false);
                                    selectProduct(filteredResults[0]);
                                }
                            }}
                            placeholder="Nombre o código de barras..."
                            style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none' }}
                            autoFocus
                        />
                        {barcodeResult && (
                            <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>Código: {barcodeResult}</div>
                        )}
                        {showDropdown && filteredResults.length > 0 && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, marginTop: '0.25rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                                {filteredResults.map(p => (
                                    <div key={p.id}
                                        onClick={() => { setShowDropdown(false); selectProduct(p); }}
                                        style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid #0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.15s' }}
                                        onMouseEnter={e => (e.currentTarget.style.background = '#0f172a')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <div>
                                            <span style={{ fontWeight: 600, color: 'white' }}>{p.name}</span>
                                            {p.sku && <span style={{ marginLeft: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>SKU: {p.sku}</span>}
                                        </div>
                                        <span style={{ fontWeight: 900, color: '#10b981' }}>
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p.base_price)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button onClick={startCamera} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '0 1.2rem', cursor: 'pointer', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                        <Camera size={20} /> Escanear
                    </button>
                </div>

                {showScanner && (
                    <div style={{ maxWidth: '600px', marginBottom: '2rem', borderRadius: '16px', overflow: 'hidden', border: '2px solid #3b82f6', position: 'relative' }}>
                        <video ref={videoRef} style={{ width: '100%', display: 'block' }} playsInline muted />
                        <div style={{ position: 'absolute', inset: 0, border: '3px dashed rgba(59,130,246,0.5)', borderRadius: '16px', pointerEvents: 'none' }} />
                        <button onClick={() => { stopCamera(); setShowScanner(false); }} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.7)', border: 'none', color: 'white', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <X size={18} />
                        </button>
                        <p style={{ position: 'absolute', bottom: '0.5rem', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.7)', padding: '0.3rem 1rem', borderRadius: '20px', fontSize: '0.8rem', color: '#94a3b8' }}>Enfoca el código de barras</p>
                    </div>
                )}

                {cameraError && (
                    <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', marginBottom: '1rem', maxWidth: '600px' }}>
                        {cameraError}
                    </div>
                )}

                {loading && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '2rem', color: '#94a3b8' }}>
                        <Loader2 className="animate-spin" size={24} /> Buscando producto...
                    </div>
                )}

                {error && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '2rem', background: 'rgba(239,68,68,0.05)', borderRadius: '16px', border: '1px solid rgba(239,68,68,0.2)', maxWidth: '600px' }}>
                        <AlertCircle size={24} color="#ef4444" />
                        <div>
                            <p style={{ fontWeight: 700, color: '#ef4444' }}>No encontrado</p>
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No hay un producto con ese nombre o código de barras.</p>
                        </div>
                    </div>
                )}

                <AnimatePresence>
                    {product && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            style={{ maxWidth: '720px', background: '#1e293b', borderRadius: '20px', border: '1px solid #334155', overflow: 'hidden' }}
                        >
                            {product.imageUrl && (
                                <div style={{ height: '200px', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    <img src={product.imageUrl} alt={product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
                                </div>
                            )}
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                    <div>
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{product.name}</h2>
                                        {product.sku && <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.25rem' }}>SKU: {product.sku}</p>}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {product.is_medicine && <span style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }}>MEDICINA</span>}
                                        {product.is_service && <span style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }}>SERVICIO</span>}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Layers size={16} /> Precios
                                    </p>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                                        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1a2332 100%)', padding: '1.25rem', borderRadius: '16px', border: '1px solid #10b981', textAlign: 'center' }}>
                                            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981', margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Base</p>
                                            <p style={{ fontSize: '2rem', fontWeight: 900, color: '#10b981', margin: '0' }}>{formatCurrency(product.base_price)}</p>
                                        </div>
                                        {product.variants && product.variants.slice(0, 2).map((v: any, i: number) => (
                                            <div key={i} style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1a2332 100%)', padding: '1.25rem', borderRadius: '16px', border: '1px solid #2d3a4e', textAlign: 'center' }}>
                                                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{v.name}</p>
                                                <p style={{ fontSize: '2rem', fontWeight: 900, color: '#10b981', margin: '0 0 0.25rem 0' }}>{formatCurrency(v.price)}</p>
                                                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>{v.quantity} und. — {(v.price / v.quantity).toFixed(2)} c/u</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default ProductLookup;