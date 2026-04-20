import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, Headset, User, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import LoginModal from '../LoginModal/LoginModal';
import styles from './Navbar.module.css'; // Importación como módulo
const API_URL = import.meta.env.VITE_API_URL;

const Navbar = () => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const { user, logout } = useAuth();
    const { toggleCart, cartTotal, cartCount } = useCart();
    const [showLoginModal, setShowLoginModal] = useState(false);

    const handleSupportClick = () => {
        window.open("https://wa.link/gnv3mc", "_blank", "noopener,noreferrer");
    };

    useEffect(() => {
        if (!searchTerm || searchTerm.trim().length <= 1) {
            setResults([]);
            setShowDropdown(false);
            return;
        }
        const controller = new AbortController();
        const delayDebounceFn = setTimeout(async () => {
            try {
                const response = await fetch(
                    `${API_URL}/admin/products/search?q=${searchTerm}`,
                    { signal: controller.signal }
                );
                const data = await response.json();
                if (Array.isArray(data)) {
                    setResults(data);
                    setShowDropdown(true);
                }
            } catch (err) {
                if (err.name !== "AbortError") {
                    setResults([]);
                }
            }
        }, 300);
        return () => {
            clearTimeout(delayDebounceFn);
            controller.abort();
        };
    }, [searchTerm]);

    return (
        <header className={styles.navbarContainer}>
            <div className={styles.announcementBar}>
                <span>¿DUDAS CON TU SUPLEMENTO? Escribinos por WhatsApp!</span>
            </div>

            <nav className={`${styles.mainNav} container`}>
                <div className={styles.navLeft}>
                    <Link to="/" className={styles.logo}>
                        <span className={styles.logoText}>Nutri<span>Point</span></span>
                        <CheckCircle2 size={16} className={styles.verifyIcon} />
                    </Link>
                </div>

                {/* <div className={styles.navCenter}>
                    <div className={styles.searchBar}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                            onFocus={() => searchTerm.length > 0 && setShowDropdown(true)}
                        />
                    </div> */}
                    <div 
                        className={`${styles.navCenter} ${isSearchOpen ? styles.open : ''}`}
                        onClick={() => setIsSearchOpen(true)} // Se abre al tocar
                        >
                            <div className={styles.searchBar}>
                                <Search size={18} className={styles.searchIcon} />
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onBlur={() => {
                                        // Al perder el foco, se cierra después de un delay
                                        setTimeout(() => {
                                            setIsSearchOpen(false);
                                            setShowDropdown(false);
                                        }, 200);
                                    }}
                                    autoFocus={isSearchOpen} // Autofocus al abrir
                                />
                            </div>
                    
                    {showDropdown && (
                        <ul className={styles.suggestionsDropdown}>
                            {results.length > 0 ? (
                                results.map((product) => (
                                    <li key={product.id}>
                                        <Link to={`/detail/${product.id}`} className={styles.suggestionItemLink}>
                                            <img src={product.image} className={styles.suggestionImg} alt={product.name} />
                                            <div className={styles.suggestionInfo}>
                                                <span className={styles.suggestionName}>{product.name}</span>
                                                <span className={styles.suggestionPrice}>${product.price}</span>
                                            </div>
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                <div className={styles.noResults}>No hay resultados</div>
                            )}
                        </ul>
                    )}
                </div>

                <div className={styles.navRight}>
                    <button className={`${styles.navBtn} ${styles.supportBtn}`} onClick={handleSupportClick}>
                        <Headset size={20} />
                        <span className={styles.btnLabel}>Soporte</span>
                    </button>

                    {user ? (
                        <div className={styles.userProfile}>
                            <img
                                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=random`}
                                alt="Avatar"
                                className={styles.userAvatar}
                            />
                            <div className={styles.userDropdown}>
                                <span className={styles.userEmail}>{user.email}</span>
                                <button onClick={() => window.location.href = '/profile'} className={styles.dropdownItem}>Mi Perfil</button>
                                {user.email === 'nutripoint.ar@gmail.com' && (
                                    <button onClick={() => window.location.href = '/admin'} className={styles.dropdownItem}>Panel Admin</button>
                                )}
                                <button onClick={logout} className={`${styles.dropdownItem} ${styles.textRed}`}>Cerrar Sesión</button>
                            </div>
                        </div>
                    ) : (
                        <button className={`${styles.navBtn} ${styles.loginBtn}`} onClick={() => setShowLoginModal(true)}>
                            <User size={20} />
                            <span className={styles.btnLabel}>Entrar</span>
                        </button>
                    )}

                    <button className={`${styles.navBtn} ${styles.cartBtn}`} onClick={toggleCart}>
                        <ShoppingCart size={20} />
                        <span className={styles.cartPrice}>ARS {cartTotal.toLocaleString('es-AR')}</span>
                        {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
                    </button>
                </div>
            </nav>

            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
        </header>
    );
};

export default Navbar;