import React from 'react';
import { Facebook, Twitter, Instagram, Mail, ShieldCheck } from 'lucide-react';
import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footerMain}>
            <div className={`${styles.footerContent} container`}>
                <div className={styles.footerBrand}>
                    <h2 className={styles.brandLogo}>NutriPoint<span>©</span></h2>
                    <p>Tu plataforma de confianza. Rápido, seguro y siempre al mejor precio.</p>
                    <div className={styles.socialLinks}>
                        <a href="#"><Facebook size={20} /></a>
                        <a href="#"><Twitter size={20} /></a>
                        <a href="#"><Instagram size={20} /></a>
                    </div>
                </div>

                <div className={styles.footerLinks}>
                    <h4>Navegación</h4>
                    <ul>
                        <li><a href="#">Inicio</a></li>
                        <li><a href="#">Tienda</a></li>
                        <li><a href="#">Categorías</a></li>
                    </ul>
                </div>

                <div className={styles.footerLinks}>
                    <h4>Legal</h4>
                    <ul>
                        <li><a href="#">Términos de Servicio</a></li>
                        <li><a href="#">Política de Privacidad</a></li>
                        <li><a href="#">Reembolsos</a></li>
                    </ul>
                </div>

                <div className={styles.footerContact}>
                    {/* <h4>Contacto</h4>
                    <div className={styles.contactItem}>
                        <Mail size={16} />
                        <span>nutripoint.ar@gmail.com</span>
                    </div> */}
                    <div className={styles.trustBadge}>
                        <ShieldCheck size={24} color="var(--primary)" />
                        <div>
                            <strong>Compra Segura</strong>
                            <span>Certificado SSL</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.footerBottom}>
                <div className={`${styles.bottomContainer} container`}>
                    <p>© 2025 NutriPoint. Todos los derechos reservados.</p>
                    <div className={styles.paymentIcons}>
                        <img src="/visa.png" alt="visa" width="30" />
                        <img src="/mastercard.png" alt="mastercard" width="30" />
                        <img src="/mercadopago-logo.png" alt="Mercado Pago" width="30" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;