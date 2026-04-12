import React, { useEffect, useState } from 'react';
import styles from './FallingLights.module.css';

const FallingLights = () => {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const id = Math.random();
            const left = Math.random() * 100;
            const duration = 2 + Math.random() * 4;
            const size = 1 + Math.random() * 2; 
            
            setParticles((prev) => [...prev, { id, left, duration, size }]);

            setTimeout(() => {
                setParticles((prev) => prev.filter((p) => p.id !== id));
            }, duration * 1000);
        }, 150);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.lightsContainer}>
            {particles.map((p) => (
                <div 
                    key={p.id} 
                    className={styles.lightParticle}
                    style={{
                        left: `${p.left}%`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        animationDuration: `${p.duration}s`,
                    }}
                />
            ))}
        </div>
    );
};

export default FallingLights;