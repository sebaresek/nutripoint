import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';

// Layout & Components
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import FallingLights from './components/FallingLights/FallingLights';
import CartSidebar from './components/CartSidebar/CartSidebar';

// Contexto - VERIFICA QUE LA RUTA SEA EXACTA
import { CartProvider, useCart } from './context/CartContext'; 
import { useAuthSync } from './utils/useAuth';
import { auth } from './utils/firebase';

// Pages
import HomePage from './views/HomePage/HomePage';
import DetailPage from './views/DetailPage/DetailPage';
import PaymentSuccess from './views/PaymentSuccess/PaymentSuccess'; 
import UserDashboard from './views/userDashboard/UserDashboard';
// REVISA SI ESTA RUTA TIENE LA "T":
import CheckoutPage from './views/CheckoutPage/CheckoutPage'; 

// Admin
import AdminLayout from './admin/AdminLayout/AdminLayout';
import AdminDashboard from './admin/AdminDashboard/AdminDashboard';
import AdminProducts from './admin/AdminProducts/AdminProducts';
import AdminOrders from './admin/AdminOrders/AdminOrders';

const INITIAL_CATEGORIES = [
    { id: 1, name: 'Proteínas', slug: 'proteinas', emoji: '💪🏼' },
    { id: 2, name: 'Creatinas', slug: 'creatinas', emoji: '⚡' },
    { id: 3, name: 'Pre-Entrenos', slug: 'pre-entrenos', emoji: '💥' },
    { id: 4, name: 'Quemadores', slug: 'quemadores', emoji: '🔥' },
    { id: 5, name: 'Salud & Bienestar', slug: 'salud-bienestar', emoji: '💊' }, // Aquí van los Aminoácidos
    { id: 6, name: 'Accesorios', slug: 'accesorios', emoji: '🥤' },
];

// Componente interno para manejar las rutas y el carrito
const AppContent = ({ products, setProducts, categories, setCategories, user }) => {
    // Sacamos cartItems del contexto. Si falla, ponemos un array vacío por seguridad.
    const cartContext = useCart();
    const cartItems = cartContext?.cartItems || [];

    return (
        <div className="app-container">
            <Navbar />
            <CartSidebar />
            <FallingLights />
            <main>
                <Routes>
                    <Route path="/" element={<HomePage products={products} categories={categories} />} />
                    <Route path="/detail/:id" element={<DetailPage products={products} />} />
                    <Route 
                        path="/checkout" 
                        element={<CheckoutPage items={cartItems} />} 
                    />
                    <Route path="/payment-success" element={<PaymentSuccess />} />
                    <Route path="profile" element={user ? <UserDashboard /> : <Navigate to="/" /> } />

                    <Route path="/admin" element={<AdminLayout products={products} setProducts={setProducts} categories={categories} setCategories={setCategories} />}>
                        <Route index element={<Navigate to="dashboard" />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="orders" element={<AdminOrders />} />
                    </Route>
                </Routes> 
            </main>
            <Footer />
        </div>
    );
};

// Componente Raíz
const App = () => {
    useAuthSync();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState(INITIAL_CATEGORIES);
    const [user, loading] = useAuthState(auth);

    useEffect(() => {
        fetch('http://localhost:3001/api/admin/products')
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(err => console.error("Error API:", err));
    }, []);

    if (loading) return null;

    return (
        <CartProvider>
            <AppContent 
                products={products} 
                setProducts={setProducts}
                categories={categories} 
                setCategories={setCategories}
                user={user} 
            />
        </CartProvider>
    );
};

export default App;