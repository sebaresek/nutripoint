import React from 'react';
import { Truck, RotateCcw, ShieldAlert, PackageCheck } from 'lucide-react';
import styles from './ShippingPolicy.module.css';
import ButtonSupport from '../../components/ButtonSupport/ButtonSupport'


const ShippingPolicy = () => {
    return (
        <div className={styles.container}>
            <ButtonSupport />
            <header className={styles.header}>
                <h1 className={styles.title}>Políticas de <span className={styles.accent}>Envío y Devolución</span></h1>
                <p>Transparencia total en tus entregas y cambios</p>
            </header>

            <div className={styles.grid}>
                <section className={styles.card}>
                    <Truck className={styles.icon} size={32} />
                    <h2>Envíos a todo el país</h2>
                    <p>Despachamos tus pedidos a través de servicios logísticos líderes. Una vez acreditado el pago, procesamos tu orden en un plazo de 24 a 48 horas hábiles.</p>
                    <ul>
                        <li><strong>Posadas:</strong> Entrega en el día (comprando antes de las 14hs).</li>
                        <li><strong>Interior de Misiones:</strong> Entrega estimada de 4 a 5 días hábiles.</li>
                        <li><strong>Resto del país:</strong> Entrega estimada de 5 a 7 días hábiles.</li>
                    </ul>
                </section>

                <section className={styles.card}>
                    <RotateCcw className={styles.icon} size={32} />
                    <h2>Derecho de Arrepentimiento</h2>
                    <p>Conforme a la Ley 24.240, tenés 10 días corridos desde la recepción para cancelar tu compra. El producto debe estar:</p>
                    <ul>
                        <li>Cerrado y con el sello de seguridad intacto.</li>
                        <li>En su embalaje original y sin daños.</li>
                        <li>Con el comprobante de compra correspondiente.</li>
                    </ul>
                </section>

                <section className={styles.card}>
                    <ShieldAlert className={styles.icon} size={32} />
                    <h2>Garantía de Calidad</h2>
                    <p>Si el producto presenta alguna falla de fabricación o el envase llega dañado por el transporte, comunicate con nosotros inmediatamente. Realizaremos el cambio sin costo adicional tras verificar el inconveniente.</p>
                </section>

                <section className={styles.card}>
                    <PackageCheck className={styles.icon} size={32} />
                    <h2>Seguimiento de Pedido</h2>
                    <p>Una vez que el pedido sea despachado, recibirás por mail un código de seguimiento para que puedas monitorear el estado de tu entrega en tiempo real desde la web del correo.</p>
                </section>
            </div>

            <footer className={styles.footerNote}>
                <p>¿Tenés alguna duda específica sobre tu zona? Escribinos a <strong>nutripoint.ar@gmail.com</strong></p>
            </footer>
        </div>
    );
};

export default ShippingPolicy;