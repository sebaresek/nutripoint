import React from 'react';
import styles from './Hero.module.css';

const Hero = () => {
    return (
        /* Combinamos la clase de módulo con una global 'container' si la tienes */
        <section className={`${styles.heroSection} container`}>
            
            <div className={`${styles.heroBannerContainer} animate-fade-in`}>
                <div className={`${styles.mainBanner} glass`}>
                    <img 
                        src="https://www.enasport.com/cdn/shop/files/TransResveratrolDesk_1_962fb783-7cef-4395-8d1c-1a9d8ab73cfe.jpg?v=1775575457&width=1600" 
                        alt="NutriPoint Banner" 
                    />
                    <div className={styles.bannerOverlay}></div>
                </div>
            </div>

            {/* Efecto decorativo */}
            <div className={styles.glowEffect}></div>
        </section>
    );
};

export default Hero;