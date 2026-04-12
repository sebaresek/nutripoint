import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductDetail from '../../components/ProductDetail/ProductDetail';

const DetailPage = ({ products }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const product = products.find(p => p.id === parseInt(id));

    if (!product) {
        return (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#888' }}>
            <p>Producto no encontrado.</p>
            <button onClick={() => navigate('/')} style={{ marginTop: '1rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
            ← Volver a la tienda
            </button>
        </div>
        );
    }

    return (
        <ProductDetail
        product={product}
        allProducts={products}
        onBack={() => navigate('/')}
        onProductClick={(p) => navigate(`/detail/${p.id}`)}
        />
    );
};

export default DetailPage;