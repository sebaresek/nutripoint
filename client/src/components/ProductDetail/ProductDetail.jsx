import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ShoppingBasket,
  Plus,
  PackageCheck,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import ProductCard from '../ProductCard/ProductCard';
import { useCart } from '../../context/CartContext';
import './ProductDetail.css'; 

const ProductDetail = ({ product, allProducts, onBack, onProductClick }) => {
    console.log("🔍 DATOS RECIBIDOS EN DETAIL:", product);
    console.log("🍦 VARIANTES:", product?.variants);
    const { addToCart } = useCart();
    const [selectedVariant, setSelectedVariant] = useState(null);
    const variants = product?.variants || [];

    // 2. Calcular Stock Total sumando todas las variantes para el badge general
    const totalStock = useMemo(() => {
        return variants.reduce((acc, v) => acc + (parseInt(v.stock) || 0), 0);
    }, [variants]);

    useEffect(() => {
        window.scrollTo(0, 0);
        
        // Si hay una sola variante, la seleccionamos automáticamente
        if (variants.length === 1) {
            setSelectedVariant(variants[0]);
        } else {
            setSelectedVariant(null);
        }
    }, [product?.id, variants.length]);

    if (!product) return null;

    // Lógica de stock y deshabilitación
    const isOutOfStock = totalStock <= 0;
    const isSelectionMissing = variants.length > 1 && !selectedVariant;
    const isActionDisabled = isOutOfStock || isSelectionMissing;

    // IMAGEN DINÁMICA: Si el sabor tiene imagen propia, la muestra; si no, usa la de portada
    const currentDisplayImage = selectedVariant?.image || product.image || 'https://images.unsplash.com/photo-1542204172-658a09b6b5e7?w=800&q=80';

    const similarProducts = allProducts
        .filter(p => p.categoryId === product.categoryId && p.id !== product.id)
        .slice(0, 5);

    const discount = product.oldPrice
        ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
        : null;

    return (
        <div className="pd-page">
            <div className="pd-container">
                <button className="pd-back" onClick={onBack}>
                    <ArrowLeft size={16} /> Volver a la tienda
                </button>

                <div className="pd-top-grid">
                    {/* Col 1 – Imagen Dinámica */}
                    <div className="pd-image-wrap">
                        <img
                            key={currentDisplayImage}
                            id="package-image"
                            src={currentDisplayImage}
                            alt={product.name}
                            className="pd-image-fluid"
                        />
                    </div>

                    {/* Col 2 – Info, Price & Buttons */}
                    <div className="pd-info">
                        <span className="pd-badge-stock" style={{ 
                            color: isOutOfStock ? '#ef4444' : '#22c55e', 
                            borderColor: isOutOfStock ? '#ef4444' : '#22c55e', 
                            border: '1px solid' 
                        }}>
                            {isOutOfStock 
                            ? 'AGOTADO' 
                            : (selectedVariant ? selectedVariant.stock : totalStock) === 1 
                                ? 'Última unidad disponible' 
                                : `${selectedVariant ? selectedVariant.stock : totalStock} unidades disponibles`
                            }
                        </span>

                        <h1 className="pd-title">{product.name}</h1>

                        <div className="pd-pricing">
                            {product.oldPrice && (
                                <div className="pd-old-price-row">
                                    <span className="pd-old-price">ARS {product.oldPrice.toLocaleString('es-AR')}</span>
                                    {discount && <span className="pd-discount-tag">-{discount}%</span>}
                                </div>
                            )}
                            <div className="pd-current-price">
                                ARS {product.price.toLocaleString('es-AR')}
                            </div>
                        </div>

                        {/* Variant selector (SABORES) */}
                        <div className="pd-variants">
                            {product.weight && product.category?.name?.toLowerCase() !== 'accesorios' && (
                                <span className="pd-price-note">
                                    Tamaño: {product.weight >= 1000 ? `${product.weight / 1000}kg` : `${product.weight}g`}
                                </span>
                            )}

                            {variants.length > 0 ? (
                                <>
                                    <h4 style={{ 
                                        color: isSelectionMissing ? 'var(--primary)' : '#aaa', 
                                        fontSize: '0.85rem', 
                                        marginBottom: '0.2rem', 
                                        transition: 'color 0.3s' 
                                    }}>
                                        {isSelectionMissing ? '⚠️ Seleccioná un sabor:' : 'Opciones de sabor:'}
                                    </h4>
                                    
                                    {variants.map((v) => (
                                        <label 
                                            key={v.id} 
                                            onClick={() => v.stock > 0 && setSelectedVariant(v)} 
                                            className={`pd-variant ${selectedVariant?.id === v.id ? 'active' : ''} ${v.stock <= 0 ? 'disabled' : ''}`}
                                            style={{ 
                                                cursor: v.stock <= 0 ? 'not-allowed' : 'pointer',
                                                opacity: v.stock <= 0 ? 0.5 : 1
                                            }}
                                        >
                                            <span className="pd-variant-radio" style={{ background: selectedVariant?.id === v.id ? 'var(--primary)' : 'transparent' }}></span>
                                            <div className="pd-variant-info">
                                                <span className="pd-variant-name">{v.flavor}</span>
                                                <span className="pd-variant-stock" style={{ color: selectedVariant?.id === v.id ? 'var(--primary)' : '#888' }}>
                                                    {v.stock > 0 ? (selectedVariant?.id === v.id ? 'Seleccionado' : 'Disponible') : 'Sin Stock'}
                                                </span>
                                            </div>
                                        </label>
                                    ))}
                                </>
                            ) : (
                                <p className="pd-price-note">No hay variantes disponibles.</p>
                            )}
                        </div>
        
                        {/* Action buttons */}
                        <div className="pd-actions">
                            <button 
                                className="pd-btn-buy" 
                                disabled={isActionDisabled} 
                                style={{ opacity: isActionDisabled ? 0.5 : 1, cursor: isActionDisabled ? 'not-allowed' : 'pointer' }} 
                                onClick={() => addToCart({ ...product, selectedFlavor: selectedVariant?.flavor })}
                            >
                                <ShoppingBasket size={18} />
                                {isSelectionMissing ? 'Elegí un sabor' : 'Comprar ahora'}
                            </button>
                            <button 
                                className="pd-btn-cart" 
                                disabled={isActionDisabled} 
                                style={{ opacity: isActionDisabled ? 0.5 : 1, cursor: isActionDisabled ? 'not-allowed' : 'pointer' }} 
                                onClick={() => addToCart({ ...product, selectedFlavor: selectedVariant?.flavor })}
                            >
                                <Plus size={18} />
                                {isSelectionMissing ? 'Elegí un sabor' : 'Añadir al carrito'}
                            </button>
                        </div>
                    </div>

                    {/* Col 3 – Trust Sidebar */}
                    <div className="pd-trust">
                        <div className="pd-trust-card">
                            <div className="pd-trust-icon"><PackageCheck size={20} /></div>
                            <div>
                                <h4>Entrega inmediata</h4>
                                <p>Enviamos tu producto inmediatamente después del pago.</p>
                            </div>
                        </div>

                        <div className="pd-trust-card">
                            <div className="pd-trust-icon"><ShieldCheck size={20} /></div>
                            <div>
                                <h4>Seguridad total</h4>
                                <p>Tus datos están cifrados de extremo a extremo durante todo el proceso.</p>
                            </div>
                        </div>

                        <div className="pd-trust-card">
                            <div className="pd-trust-icon"><CreditCard size={20} /></div>
                            <div>
                                <h4>Formas de pago</h4>
                                <p>Aceptamos los medios de pago más populares.</p>
                                <div className="pd-payment-icons">
                                    <img src="/mercadopago-logo.png" alt="Mercado Pago" />
                                    <img src="/visa.png" alt="visa" />
                                    <img src="/mastercard.png" alt="mastercard" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pd-description">
                    <h3 className="pd-section-title">Descripción</h3>
                    <div className="pd-description-content">
                        {product.description?.split('\n').map((line, idx) => (
                            <p key={idx}>{line}</p>
                        )) || <p>No hay descripción disponible.</p>}
                    </div>
                </div>

                {similarProducts.length > 0 && (
                    <div className="pd-similar">
                        <h3 className="pd-similar-title">Productos similares</h3>
                        <div className="pd-similar-grid">
                            {similarProducts.map(p => (
                                <ProductCard
                                    key={p.id}
                                    product={p}
                                    onDetail={() => onProductClick(p)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;