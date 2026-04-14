import React, { useEffect } from 'react';
import {
  ArrowLeft,
  Zap,
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
    const { addToCart } = useCart();
    const [selectedFlavor, setSelectedFlavor] = React.useState('');

    // Procesamos la lista de sabores
    const flavorsList = Array.isArray(product?.flavors) 
        ? product.flavors.flatMap(f => f.split(',').map(s => s.trim()))
        : product?.flavors 
        ? product.flavors.split(',').map(f => f.trim()).filter(Boolean) 
        : [];

    useEffect(() => {
        window.scrollTo(0, 0);
        
        if (flavorsList.length === 1) {
        setSelectedFlavor(flavorsList[0]);
        } else {
        setSelectedFlavor('');
        }
    }, [product, flavorsList.length]);

    if (!product) return null;

    const isOutOfStock = product.stock === 0;

    // Lógica de validación para habilitar botones
    const isSelectionMissing = flavorsList.length > 1 && !selectedFlavor;
    const isActionDisabled = isOutOfStock || isSelectionMissing;

    const similarProducts = allProducts
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 5);

    const discount = product.oldPrice
        ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
        : null;

    return (
        <div className="pd-page">
        <div className="pd-container">

            {/* Back Button */}
            <button className="pd-back" onClick={onBack}>
            <ArrowLeft size={16} />
            Volver a la tienda
            </button>

            {/* ── TOP SECTION: 3 columns ── */}
            <div className="pd-top-grid">

            {/* Col 1 – Image */}
            <div className="pd-image-wrap">
                <img
                id="package-image"
                src={product.image || 'https://images.unsplash.com/photo-1542204172-658a09b6b5e7?w=800&q=80'}
                alt={product.title}
                className="pd-image"
                />
            </div>

            {/* Col 2 – Info, Price & Buttons */}
            <div className="pd-info">
                <span className="pd-badge-stock" style={{ color: isOutOfStock ? '#ef4444' : '#22c55e', borderColor: isOutOfStock ? '#ef4444' : '#22c55e', border: '1px solid' }}>
                    {isOutOfStock ? 'AGOTADO' : `${product.stock} unidades disponibles`}
                </span>

                <h1 className="pd-title">{product.name || product.title}</h1>

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
                {/* <p className="pd-price-note">Pasarela de Mercado Pago</p> */}
                </div>

                {/* Variant selector */}
                <div className="pd-variants">

                    {/* 1. OCULTAR TAMAÑO: Accedemos a product.category.name */}
                    {product.weight && product.category?.name?.toLowerCase() !== 'accesorios' && (
                        <span className="pd-price-note">
                            Tamaño: {product.weight >= 1000 ? `${product.weight / 1000}kg` : `${product.weight}g`}
                        </span>
                    )}

                    {(() => {
                        // Extraemos el nombre de la categoría de forma segura
                        const categoryName = product.category?.name?.toLowerCase() || "";
                        const isAccesorio = categoryName === 'accesorios';
                        
                        const labelText = isAccesorio ? 'Opciones:' : 'Opciones de sabor:';
                        const missingLabelText = isAccesorio ? '⚠️ Seleccioná una opción:' : '⚠️ Seleccioná un sabor:';

                        if (flavorsList.length > 0) {
                            return (
                                <>
                                    <h4 style={{ 
                                        color: isSelectionMissing ? 'var(--primary)' : '#aaa', 
                                        fontSize: '0.85rem', 
                                        marginBottom: '0.2rem', 
                                        transition: 'color 0.3s' 
                                    }}>
                                        {isSelectionMissing ? missingLabelText : labelText}
                                    </h4>
                                    
                                    {flavorsList.map((flavor, index) => (
                                        <label 
                                            key={index} 
                                            onClick={() => !isOutOfStock && setSelectedFlavor(flavor)} 
                                            className={`pd-variant ${selectedFlavor === flavor ? 'active' : ''}`} 
                                            style={{ cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
                                        >
                                            <span className="pd-variant-radio" style={{ background: selectedFlavor === flavor ? 'var(--primary)' : 'transparent' }}></span>
                                            <div className="pd-variant-info">
                                                <span className="pd-variant-name">{flavor}</span>
                                                {!isOutOfStock && (
                                                    <span className="pd-variant-stock" style={{ color: selectedFlavor === flavor ? 'var(--primary)' : '#888' }}>
                                                        {selectedFlavor === flavor ? 'Seleccionado' : 'Seleccionar'}
                                                    </span>
                                                )}
                                            </div>
                                        </label>
                                    ))}
                                </>
                            );
                        } else {
                            return (
                                <>
                                    <h4 style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                                        {labelText}
                                    </h4>
                                    <label className="pd-variant active">
                                        <span className="pd-variant-radio"></span>
                                        <div className="pd-variant-info">
                                            <span className="pd-variant-name">
                                                {isAccesorio ? 'Opción Única' : 'Sabor Único'}
                                            </span>
                                            <span className="pd-variant-stock">{isOutOfStock ? 'Sin unidades' : 'Stock verificado'}</span>
                                        </div>
                                    </label>
                                </>
                            );
                        }
                    })()}
                </div>

                {/* Action buttons */}
                <div className="pd-actions">
                <button 
                    className="pd-btn-buy" 
                    disabled={isActionDisabled} 
                    style={{ opacity: isActionDisabled ? 0.5 : 1, cursor: isActionDisabled ? 'not-allowed' : 'pointer' }} 
                    onClick={() => addToCart({ ...product, selectedFlavor })}
                >
                    <ShoppingBasket size={18} />
                    {isSelectionMissing ? 'Elegí un sabor' : 'Comprar ahora'}
                </button>
                <button 
                    className="pd-btn-cart" 
                    disabled={isActionDisabled} 
                    style={{ opacity: isActionDisabled ? 0.5 : 1, cursor: isActionDisabled ? 'not-allowed' : 'pointer' }} 
                    onClick={() => addToCart({ ...product, selectedFlavor })}
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

            {/* ── DESCRIPTION ── */}
            <div className="pd-description">
            <h3 className="pd-section-title">Descripción</h3>
            <div className="pd-description-content">
                {product.description ? (
                    product.description.split('\n').map((line, idx) => (
                    <p key={idx}>{line}</p>
                    ))
                ) : (
                    <p>No hay descripción disponible para este producto.</p>
                )}
            </div>
            </div>

            {/* ── SIMILAR PRODUCTS ── */}
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