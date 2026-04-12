import React from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './LoginModal.module.css'; // Importación del módulo

const LoginModal = ({ isOpen, onClose }) => {
    const { loginWithGoogle } = useAuth();

    if (!isOpen) return null;

    // const handleGoogleLogin = async () => {
    //     try {
    //         const result = await loginWithGoogle(); 
    //         const userEmail = result.user.email;
    //         console.log("Login Firebase exitoso:", userEmail);

    //         if (userEmail === 'nutripoint.ar@gmail.com') {
    //             const response = await fetch('http://localhost:3001/api/auth/login-admin', {
    //                 method: 'POST',
    //                 headers: { 'Content-Type': 'application/json' },
    //                 body: JSON.stringify({ email: userEmail })
    //             });

    //             const data = await response.json();
    //             console.log("Respuesta del backend:", data); // Aquí verás por qué llega null

    //             if (data.token) {
    //                 localStorage.setItem('adminToken', data.token);
    //                 console.log("Token guardado correctamente");
    //             } else {
    //                 console.error("El backend no devolvió un token:", data.error);
    //             }
    //         }
    //         onClose();
    //     } catch (error) {
    //         console.error("Error en el proceso de login:", error);
    //     }
    // };
    const handleGoogleLogin = async () => {
        try {
            const result = await loginWithGoogle(); 
            const userEmail = result.user.email;

            if (userEmail === 'nutripoint.ar@gmail.com') {
                const response = await fetch('http://localhost:3001/api/auth/login-admin', {
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