import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../../components/Hero/Hero';
import ProductCard from '../../components/ProductCard/ProductCard';
import styles from './HomePage.module.css';

const HomePage = ({ products, categories }) => {
    const [activeCategory, setActiveCategory] = useState('all');
    const scrollRef = useRef(null); // Referencia para el scroll horizontal
    const navigate = useNavigate();

    // Función para manejar el scroll manual con las flechas
    const scroll = (direction) => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            // Scroleamos el 70% del ancho visible para que el usuario no pierda el contexto
            const scrollAmount = clientWidth * 0.7; 
            const scrollTo = direction === 'left' 
                ? scrollLeft - scrollAmount 
                : scrollLeft + scrollAmount;
            
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    const renderCategorySection = (category) => {
        const catProducts = products.filter(p => {
            const productCatName = typeof p.category === 'object' ? p.category.name : p.category;
            return productCatName === category.name;
        });

        if (catProducts.length === 0) return null;

        return (
            <div key={category.id} className="category-section animate-fade-in">
                <h3 className="category-section-title glass">
                    {category.emoji || '⭐'} {category.name.toUpperCase()}
                </h3>
                <div className={styles.gridResponsive}>
                    {catProducts.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onDetail={() => navigate(`/detail/${product.id}`)}
                        />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            <Hero />

            {/* Navegación de Categorías con Flechas */}
            <div className={`${styles.categoryNavWrapper} container animate-fade-in`}>
                <div className={styles.navContainerRelative}>
                    
                    {/* Botón Izquierda */}
                    {/* <button 
                        className={`${styles.scrollArrow} ${styles.left}`} 
                        onClick={() => scroll('left')}
                        aria-label="Deslizar izquierda"
                    >
                        ‹
                    </button> */}

                    <div className={`${styles.categoryNav} glass`} ref={scrollRef}>
                        <button
                            className={`${styles.catTab} ${activeCategory === 'all' ? styles.active : ''}`}
                            onClick={() => setActiveCategory('all')}
                        >
                            🚀 Todos
                        </button>
                        
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                className={`${styles.catTab} ${activeCategory === cat.name ? styles.active : ''}`}
                                onClick={() => setActiveCategory(cat.name)}
                            >
                                {cat.emoji} {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Botón Derecha */}
                    {/* <button 
                        className={`${styles.scrollArrow} ${styles.right}`} 
                        onClick={() => scroll('right')}
                        aria-label="Deslizar derecha"
                    >
                        ›
                    </button> */}
                </div>
            </div>

            <section className={`${styles.productsSection} container`}>
                {activeCategory === 'all'
                    ? categories.map(cat => renderCategorySection(cat))
                    : categories
                        .filter(c => c.name === activeCategory)
                        .map(cat => renderCategorySection(cat))
                }

                {products.length === 0 && (
                    <div className="empty-state glass">
                        <p>Cargando catálogo...</p>
                    </div>
                )}
            </section>
        </>
    );
};

export default HomePage;