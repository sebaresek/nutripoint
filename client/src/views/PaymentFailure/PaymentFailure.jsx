import React from 'react';
import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './PaymentFailure.module.css';
import ButtonSupport from '../../components/ButtonSupport/ButtonSupport'


const PaymentFailure = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <ButtonSupport />
            <motion.div 
                className={styles.card}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div 
                    className={styles.iconWrapper}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                >
                    <XCircle size={40} strokeWidth={2.5} />
                </motion.div>

                <h1 className={styles.title}>Fallo en el Pago</h1>
                
                <p className={styles.description}>
                    Hubo un problema con tu tarjeta o Mercado Pago rechazó la transacción. 
                    Tus productos siguen en el carrito.
                </p>

                <button 
                    onClick={() => navigate('/checkout')} 
                    className={styles.buttonPrimary}
                >
                    Reintentar Pago
                </button>

                <Link to="/" className={styles.buttonSecondary}>
                    Volver al Inicio
                </Link>
            </motion.div>
        </div>
    );
};

export default PaymentFailure;