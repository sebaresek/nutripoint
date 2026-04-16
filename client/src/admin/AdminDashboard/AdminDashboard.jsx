import React, { useState, useEffect } from 'react';
import { Package, Tags, TrendingUp } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { categories, products } = useOutletContext();
    
    const [stats, setStats] = useState({
        activeProducts: 0,
        inventoryValue: 0,
        totalCategories: 0
    });

    useEffect(() => {
        if (products) {
            const totalValue = products.reduce((acc, curr) => {
                // 1. Aseguramos que el precio sea un número [cite: 2]
                const price = Number(curr.price) || 0;

                // 2. Corregimos el origen del stock: 
                // En tu esquema, el stock está en 'variants', no en el producto raíz 
                const totalProductStock = curr.variants?.reduce((sum, variant) => {
                    return sum + (Number(variant.stock) || 0);
                }, 0) || 0;

                // 3. Sumamos al acumulador: (Precio del producto * Stock total de sus variantes)
                return acc + (price * totalProductStock);
            }, 0);

            setStats({
                activeProducts: products.length,
                inventoryValue: totalValue,
                totalCategories: categories?.length || 0
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
                        <h3>ARS {stats.inventoryValue.toLocaleString('es-AR')}</h3>
                        <span>Valor Total Inventario</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;