import React from 'react';
import Sidebar from '../components/Sidebar';

const Suppliers: React.FC = () => {
    return (
        <div className="products-page">
            <Sidebar />
            <main className="products-main">
                <header className="page-header">
                    <div className="header-text">
                        <h1>Gestión de Proveedores</h1>
                        <p>Módulo en construcción...</p>
                    </div>
                </header>
                <div className="empty-state">
                    <p>Próximamente podrás administrar el catálogo de proveedores aquí.</p>
                </div>
            </main>
        </div>
    );
};

export default Suppliers;
