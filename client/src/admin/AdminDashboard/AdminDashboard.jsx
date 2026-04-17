import React, { useState, useEffect } from 'react';
import { Package, Tags, TrendingUp } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { categories, products } = useOutletContext();
    
    const [stats, setStats] = useState({
        activeProducts: 0,
        inventoryValue: 0,
        totalCategories: 0,
        totalStock: 0
    });

    useEffect(() => {
            if (products) {
                // 1. DEFINIMOS LA VARIABLE AQUÍ ABAJO
                let cumulativeStock = 0;

                const totalValue = products.reduce((acc, curr) => {
                    const price = Number(curr.price) || 0;

                    const totalProductStock = curr.variants?.reduce((sum, variant) => {
                        return sum + (Number(variant.stock) || 0);
                    }, 0) || 0;

                    // 2. VAMOS SUMANDO AL TOTAL GLOBAL
                    cumulativeStock += totalProductStock;

                    return acc + (price * totalProductStock);
                }, 0);

                setStats({
                    activeProducts: products.length,
                    inventoryValue: totalValue,
                    totalCategories: categories?.length || 0,
                    totalStock: cumulativeStock // <--- AHORA SÍ EXISTE
                });
            }
        }, [products, categories]);

    return (
        <div className="dashboard-content">
            <h1>Resumen de Plataforma</h1>
            <p className="text-muted">Estado en tiempo real de NutriPoint.</p>

            <div className="stats-grid">
                <div className="stat-card glass">
                    <div className="stat-icon"><Package size={24} color="var(--primary)" /></div>
                    <div className="stat-body">
                        <h3>{stats.activeProducts}</h3>
                        <span>Productos Activos</span>
                    </div>
                </div>

                {/* Nueva Carta: Unidades Totales */}
                <div className="stat-card glass">
                    <div className="stat-icon"><Package size={24} color="#f59e0b" /></div> {/* Color naranja/ámbar */}
                    <div className="stat-body">
                        <h3>{stats.totalStock}</h3>
                        <span>Unidades en Stock</span>
                    </div>
                </div>
                
                <div className="stat-card glass">
                    <div className="stat-icon"><Tags size={24} color="#a855f7" /></div>
                    <div className="stat-body">
                        <h3>{stats.totalCategories}</h3>
                        <span>Categorías</span>
                    </div>
                </div>

                <div className="stat-card glass">
                    <div className="stat-icon"><TrendingUp size={24} color="#22c55e" /></div>
                    <div className="stat-body">
                        <h3>{stats.inventoryValue.toLocaleString('es-AR')}</h3>
                        <span>Valor Total Inventario</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;