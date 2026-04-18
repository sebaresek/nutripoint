import React, { useState, useEffect } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, Loader2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import LoginModal from '../LoginModal/LoginModal'
import { useNavigate } from 'react-router-dom';
import { auth } from '../../utils/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import styles from './CartSidebar.module.css'; // Importación como módulo
const API_URL = import.meta.env.VITE_API_URL;

const CartSidebar = () => {
    const navigate = useNavigate();
    const { isCartOpen, toggleCart, cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
    const [user] = useAuthState(auth);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    // Estados nuevos
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showAuthWarning, setShowAuthWarning] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
    const [shippingCost, setShippingCost] = useState(0);
    
    const [contactData, setContactData] = useState({ 
        phone: '', 
        address: '', 
        fullName: '', 
        postalCode: '', 
        province: '', 
        city: '' 
    });

    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isCartOpen]);

    useEffect(() => {
        if (user && isCartOpen) {
            fetch(`${API_URL}/users/profile/${user.uid}`)
                .then(res => res.json())
                .then(data => {
                    if (data) {
                        setContactData({ 
                            phone: data.phone || '', 
                            address: data.address || '',
                            fullName: data.name || '', 
                            postalCode: data.postalCode || '',
                            province: data.province || '',
                            city: data.city || ''
                        });
                    }
                });
        }
    }, [user, isCartOpen]);

    useEffect(() => {
        if (isCartOpen && cartItems.length > 0) {
            // Consultar los precios más recientes de los productos que están en el carrito
            const productIds = cartItems.map(item => item.id).join(',');
            
            fetch(`${API_URL}/products/validate?ids=${productIds}`)
                .then(res => res.json())
                .then(updatedProducts => {
                    // Aquí actualizas el carrito con los precios reales del servidor
                    // Si el precio cambió, el usuario lo verá reflejado antes de pagar
                })
                .catch(err => console.error("Error validando precios", err));
        }
    }, [isCartOpen]);

    useEffect(() => {
        const calculateShipping = async () => {
            if (contactData.postalCode && contactData.postalCode.length === 4) {
                setIsCalculatingShipping(true);
                try {
                    await new Promise(resolve => setTimeout(resolve, 600));
                    const cp = parseInt(contactData.postalCode);
                    
                    if (cp === 3300) {
                        setShippingCost(5000);
                        return;
                    }

                    const estimatedWeightPerItem = 0.5;
                    const calculatedWeight = cartItems.reduce((sum, item) => sum + (estimatedWeightPerItem * item.quantity), 0);
                    const totalWeight = Math.max(calculatedWeight, 1);
                    const isRegional = cp >= 3000 && cp <= 3799;

                    let baseCost = 0;
                    if (isRegional) {
                        if (totalWeight <= 1) baseCost = 17400;
                        else if (totalWeight <= 5) baseCost = 20600;
                        else if (totalWeight <= 10) baseCost = 27600;
                        else if (totalWeight <= 15) baseCost = 34000;
                        else if (totalWeight <= 20) baseCost = 40100;
                        else baseCost = 48200;
                    } else {
                        if (totalWeight <= 1) baseCost = 23500;
                        else if (totalWeight <= 5) baseCost = 28500;
                        else if (totalWeight <= 10) baseCost = 40200;
                        else if (totalWeight <= 15) baseCost = 50400;
                        else if (totalWeight <= 20) baseCost = 58600;
                        else baseCost = 72000;
                    }

                    let insurance = cartTotal <= 15000 ? 450 : (cartTotal * 0.03);
                    setShippingCost(baseCost + insurance);
                } catch (error) {
                    console.error("Error calculando envío:", error);
                } finally {
                    setIsCalculatingShipping(false);
                }
            } else {
                setShippingCost(0);
            }
        };

        calculateShipping();
    }, [contactData.postalCode, cartItems, cartTotal]);

    const handleMainAction = () => {
            if (!user) {
                // En lugar de abrir el modal directo, mostramos el renderizado de aviso
                setShowAuthWarning(true);
            } else {
                toggleCart();
                navigate('/checkout');
            }
        };

    return (
        <>
            <LoginModal 
                isOpen={showLoginModal} 
                onClose={() => setShowLoginModal(false)} 
            />
            <div 
                className={`${styles.cartOverlay} ${isCartOpen ? styles.active : ''}`} 
                onClick={toggleCart}
            ></div>

            <div className={`${styles.cartSidebar} ${isCartOpen ? styles.active : ''}`}>
                <div className={styles.cartHeader}>
                    <div className={styles.cartTitle}>
                        <ShoppingBag size={24} />
                        <h2>Tu Carrito</h2>
                    </div>
                    <button className={styles.closeBtn} onClick={toggleCart}><X size={24} /></button>
                </div>

                <div className={styles.cartItems}>
                    {cartItems.length === 0 ? (
                        <div className={styles.emptyCart}>
                            <ShoppingBag size={48} />
                            <p>Tu carrito está vacío</p>
                        </div>
                    ) : (
                        cartItems.map((item, idx) => (
                            <div key={`${item.id}-${idx}`} className={styles.cartItem}>
                                <img src={item.image} alt={item.title} className={styles.itemImg} />
                                <div className={styles.itemDetails}>
                                    <h4 className={styles.itemName}>{item.name || item.title}</h4>
                                    {item.selectedFlavor && (
                                        <span className={styles.itemFlavor}>Sabor: {item.selectedFlavor}</span>
                                    )}
                                    <span className={styles.itemPrice}>ARS {item.price.toLocaleString('es-AR')}</span>
                                    <div className={styles.itemActions}>
                                        <div className={styles.quantityControls}>
                                            <button onClick={() => updateQuantity(item.id, item.selectedFlavor, -1)}>
                                                <Minus size={14} />
                                            </button>

                                            <span>{item.quantity}</span>

                                            <button 
                                            onClick={() => updateQuantity(item.id, item.selectedFlavor, 1)}
                                            disabled={Number(item.quantity) >= Number(item.stock)}
                                            className={Number(item.quantity) >= Number(item.stock) ? styles.disabledBtn : ''}
                                            >
                                            <Plus size={14} />
                                            </button>
                                        </div>
                                        <button className={styles.removeBtn} onClick={() => removeFromCart(item.id, item.selectedFlavor)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className={styles.cartFooter}>
                    {cartItems.length > 0 && (
                        <div className={styles.summaryDetails}>
                            {/* {contactData.postalCode && (
                                <div className={`${styles.summaryRow} ${styles.shippingRow}`}>
                                    <span>🚚 Correo Argentino: </span>
                                    {isCalculatingShipping ? (
                                        <Loader2 size={14} className={styles.spin} />
                                    ) : (
                                        <span>${shippingCost.toLocaleString('es-AR')}</span>
                                    )}
                                </div>
                            )} */}
                            <div className={styles.cartTotal}>
                                <span>Total:</span>
                                {/* <strong> ${(cartTotal + shippingCost).toLocaleString('es-AR')}</strong> */}
                                <strong> ${cartTotal.toLocaleString('es-AR')}</strong>
                            </div>

                            {/* <button className={styles.checkoutBtn} onClick={handleMainAction}
                            >
                                {isProcessing ? <Loader2 size={20} className={styles.spin} /> : 'Pagar con Mercado Pago'}
                            </button> */}
                            {/* RENDERIZADO CONDICIONAL DEL AVISO */}
                            {showAuthWarning ? (
                                <div className={styles.authWarning}>
                                    <p>Debes iniciar sesión para finalizar tu compra</p>
                                    <div className={styles.authActions}>
                                        <button 
                                            className={styles.loginConfirmBtn} 
                                            onClick={() => {
                                                setShowAuthWarning(false);
                                                setShowLoginModal(true);
                                            }}
                                        >
                                            Iniciar Sesión
                                        </button>
                                        <button 
                                            className={styles.cancelBtn} 
                                            onClick={() => setShowAuthWarning(false)}
                                        >
                                            Volver
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button className={styles.checkoutBtn} onClick={handleMainAction}>
                                    Pagar con Mercado Pago
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CartSidebar;