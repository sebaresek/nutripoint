import React, { useState } from 'react';
import { LayoutDashboard, BarChart3, Package, Lock,ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import './AdminLayout.css'; 

const AdminLayout = ({ products, setProducts, categories, setCategories }) => {
    const { user, loginWithEmail, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        try {
        const userCredential = await loginWithEmail(email, password);
        if (userCredential.user.email !== 'nutripoint.ar@gmail.com') {
            await logout();
            setErrorMsg('No tienes permisos de administrador');
        }
        } catch (err) {
        setErrorMsg('Credenciales incorrectas');
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    // Login Screen
    if (!user || user.email !== 'nutripoint.ar@gmail.com') {
        return (
        <div className="login-container container">
            <div className="login-card glass">
            <Lock size={48} color="var(--primary)" />
            <h2>Panel de Administrador</h2>
            {errorMsg && <p className="error-msg">{errorMsg}</p>}
            <form onSubmit={handleLogin}>
                <input 
                type="email" 
                placeholder="Correo electrónico" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass"
                required
                autoFocus
                />
                <input 
                type="password" 
                placeholder="Contraseña" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass"
                required
                />
                <button type="submit" className="btn-primary">Ingresar</button>
            </form>
            <button className="back-btn" onClick={() => navigate('/')}>Volver a la tienda</button>
            </div>
        </div>
        );
    }

  // Admin Dashboard Layout
    return (
        <div className="admin-container container animate-fade-in">
        <div className="admin-sidebar">
            <div className="sidebar-brand">
            <div className="logo">
                <LayoutDashboard size={24} color="var(--primary)" />
                <span>NutriPoint <strong>Admin</strong></span>
            </div>
            </div>

            <nav className="sidebar-nav">
            <Link to="/admin/dashboard" className={`nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`}>
                <BarChart3 size={20} /> Dashboard
            </Link>
            <Link to="/admin/products" className={`nav-link ${isActive('/admin/products') ? 'active' : ''}`}>
                <Package size={20} /> Catálogo
            </Link>
            <Link to="/admin/orders" className={`nav-link ${isActive('/admin/orders') ? 'active' : ''}`}>
                <ShoppingBag size={20} /> Ventas
            </Link>
            </nav>

            <div className="sidebar-footer">
            <button onClick={() => navigate('/')} className="exit-btn">Ir a la Tienda</button>
            <button onClick={handleLogout} className="logout-btn">Cerrar Sesión</button>
            </div>
        </div>

        <div className="admin-main">
            <Outlet context={{ products, setProducts, categories, setCategories }} />
        </div>
        </div>
    );
};

export default AdminLayout;