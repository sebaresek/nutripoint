import React from 'react';
import { ArrowRight } from 'lucide-react';
import './CategorySlider.css';

const CategorySlider = ({ products, onDetail }) => {
    const popularProducts = products.slice(0, 6);

    return (
        <div className="section--featured-products container">
            <div className="inner-section">
                <div className="heading-section text-center">
                    <h2 className="title-sec">Productos Populares</h2>
                </div>

                <div className="featured-products-grid">
                    {popularProducts.map((product) => (
                        <div key={product.id} className="product-card-wrapper" onClick={() => onDetail(product)}>
                            <div className="featured-item glass">
                                <div className="item-image-wrapper">
                                    <img src={product.image} alt={product.title} loading="lazy" />
                                    <div className="item-overlay"></div>
                                </div>
                                <h3 className="item-label">{product.title}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Ejemplo por si quieres agregar el botón de Ver Todos más adelante */}
            {/* <button className="view-all-btn">Ver todos <ArrowRight size={20} /></button> */}
        </div>
    );
};

export default CategorySlider;