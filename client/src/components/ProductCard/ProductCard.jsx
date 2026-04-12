import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import styles from './ProductCard.module.css';

const ProductCard = ({ product, onDetail }) => {
    const { addToCart } = useCart();

    const name = product.name || product.title || "Producto NutriPoint";
    const price = product.price || 0;
    const image = product.image || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&q=80';
    const stock = product.stock !== undefined ? product.stock : 1;
    const isOutOfStock = stock === 0;

    return (
        <div className="reveal-fade-up visible">
            {/* 2. Uso de styles.nombreDeClase */}
            <div className={`${styles.packageCard} glass animate-fade-in`} onClick={onDetail}>
                <div className={styles.packageImageContainer}>
                    <img
                        className={styles.packageImage}
                        src={image}
                        alt={name}
                        loading="lazy"
                    />
                </div>

                {isOutOfStock && (
                    <div className={styles.outOfStockOverlay}>
                        <span>AGOTADO</span>
                    </div>
                )}

                <div className={styles.packageContent}>
                    <p className={styles.packageTitle}>{name}</p>

                    <div className={styles.packageMeta}>
                        <div className={styles.priceStack}>
                            <p className={styles.priceDisplay}>
                                ARS {Number(price).toLocaleString('es-AR')}
                            </p>
                            <p className={styles.paymentMethodText}>Vía Transferencia</p>
                        </div>

                        <div className={styles.gatewayIcons}>
                            <div className={`${styles.iconBox} glass-mp`}>
                                <img src="/mercadopago-logo.png" alt="Mercado Pago" />
                            </div>
                        </div>
                    </div>

                    <div className={styles.packageFooter}>
                        <button 
                            className={styles.buyButton} 
                            disabled={isOutOfStock} 
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!isOutOfStock) onDetail();
                            }}
                        >
                            {isOutOfStock ? 'Sin stock' : 'Comprar ahora'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;