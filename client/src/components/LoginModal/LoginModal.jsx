import React from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './LoginModal.module.css'; // Importación del módulo
const API_URL = import.meta.env.VITE_API_URL;

const LoginModal = ({ isOpen, onClose }) => {
    const { loginWithGoogle } = useAuth();

    if (!isOpen) return null;
    
    const handleGoogleLogin = async () => {
        try {
            const result = await loginWithGoogle(); 
            const userEmail = result.user.email;

            if (userEmail === 'nutripoint.ar@gmail.com') {
                const response = await fetch(`${API_URL}/auth/login-admin`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: userEmail })
                });

                const data = await response.json();
                if (data.token) {
                    localStorage.setItem('adminToken', data.token);
                    // Si quieres que apenas se loguee lo mande al panel:
                    // window.location.href = '/admin'; 
                }
            } else {
                // SI NO ES EL ADMIN: Lo deslogueamos de Firebase por seguridad
                // para que no intente quedarse en rutas protegidas del front
                await logout(); 
                alert("No tienes permisos de administrador");
            }
            onClose();
        } catch (error) {
            console.error("Error en el proceso de login:", error);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            {/* stopPropagation evita que el clic dentro cierre el modal */}
            <div 
                className={`${styles.modalContent} glass ${styles.animateScaleUp}`} 
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.modalHeader}>
                    <h2>Iniciar Sesión</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
                
                <div className={styles.modalBody}>
                    <p>Accede para gestionar tus compras y configuraciones en NutriPoint.</p>
                    
                    <button onClick={handleGoogleLogin} className={styles.googleBtn}>
                        <img 
                            src="https://www.svgrepo.com/show/475656/google-color.svg" 
                            alt="Google" 
                            width="24" 
                            height="24" 
                        />
                        <span>Continuar con Google</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;