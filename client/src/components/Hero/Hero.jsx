import React from 'react';
import styles from './Hero.module.css';
// import { getBannerUrl } from '../../utils/images'

const Hero = () => {
    const desktopBanner = "https://pub-33e6f4df8e0a4acb8aea7062a1666a72.r2.dev/banner-ena.png";
    const mobileBanner = "https://pub-33e6f4df8e0a4acb8aea7062a1666a72.r2.dev/banner-phone-ena.png";

    return (
        <section className={`${styles.heroSection} container`}>
            <div className={`${styles.heroBannerContainer} animate-fade-in`}>
                <div className={`${styles.mainBanner} glass`}>
                    <picture>
                        <source srcSet={mobileBanner} media="(max-width: 768px)" />
                        <img 
                            src={desktopBanner}
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