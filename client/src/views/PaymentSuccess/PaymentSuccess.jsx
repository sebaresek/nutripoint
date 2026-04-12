import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const PaymentSuccess = () => {
    return (
        <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh', 
        background: '#0d0d0d',
        color: 'white' 
        }}>
        <CheckCircle size={80} color="#00ff00" />
        <h1 style={{ marginTop: '20px' }}>¡Pago Confirmado!</h1>
        <p>Tu pedido de NutriPoint está en camino.</p>
        <Link to="/" style={{ 
            marginTop: '20px', 
            padding: '10px 20px', 
            background: '#009ee3', 
            color: 'white', 
            borderRadius: '8px', 
            textDecoration: 'none' 
        }}>
            Volver a la tienda
        </Link>
        </div>
    );
};

export default PaymentSuccess;