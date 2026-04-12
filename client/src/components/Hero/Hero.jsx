import React from 'react';
import styles from './Hero.module.css';
import { getBannerUrl } from '../../utils/images'

const Hero = () => {
    const desktopBanner = "1FlJXn4b-0otKs1uRxCRKpMTXvfBZOtFX";
    const mobileBanner = "1NNSMKYAcYUl-Ts1s1ZIufueM61X9M0vU";

    return (
        <section className={`${styles.heroSection} container`}>
            <div className={`${styles.heroBannerContainer} animate-fade-in`}>
                <div className={`${styles.mainBanner} glass`}>
                    <picture>
                        <source srcSet={getBannerUrl(mobileBanner)} media="(max-width: 768px)" />
                        <img 
                            src={getBannerUrl(desktopBanner)} 
                            alt="NutriPoint Banner" 
                            className={styles.heroImage}
                        />
                    </picture>
                    <div className={styles.bannerOverlay}></div>
                </div>
            </div>

            <div className={styles.glowEffect}></div>
        </section>
    );
};

export default Hero;