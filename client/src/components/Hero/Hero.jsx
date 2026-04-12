import React from 'react';
import styles from './Hero.module.css';

const Hero = () => {
    const desktopBanner = "https://lh3.googleusercontent.com/u/0/d/1FlJXn4b-0otKs1uRxCRKpMTXvfBZOtFX";
    const mobileBanner = "https://lh3.googleusercontent.com/u/0/d/1NNSMKYAcYUl-Ts1s1ZIufueM61X9M0vU";

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