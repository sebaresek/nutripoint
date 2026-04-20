import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import styles from './PaymentSuccess.module.css'; 
import ButtonSupport from '../../components/ButtonSupport/ButtonSupport'


const PaymentSuccess = () => {
    const { clearCart } = useCart();
    const hasCleared = useRef(false);

    useEffect(() => {
        if (!hasCleared.current) {
            clearCart();
            hasCleared.current = true;
        }
    }, [clearCart]);

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
                    <CheckCircle size={40} strokeWidth={2.5} />
                </motion.div>

                <h1 className={styles.title}>¡Pago Confirmado!</h1>
                
                <p className={styles.description}>
                    Tu pedido de NutriPoint está siendo procesado. 
                    Te enviaremos un correo con los detalles de tu envío.
                </p>

                <Link to="/" className={styles.button}>
                    Volver a la tienda
                </Link>
            </motion.div>
        </div>
    );
};

export default PaymentSuccess;