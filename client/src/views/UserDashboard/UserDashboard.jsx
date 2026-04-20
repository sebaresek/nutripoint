import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../utils/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { motion, AnimatePresence } from "framer-motion";
import ButtonSupport from '../../components/ButtonSupport/ButtonSupport'
import { validateField, validateFullForm, formatInput } from '../../utils/validators'; 
import styles from './UserDashboard.module.css';
const API_URL = import.meta.env.VITE_API_URL;

import { 
    User, 
    Package, 
    Edit2, 
    Loader2, 
    Save, 
    MapPin, 
    CheckCircle2, 
    AlertCircle,
    Truck 
} from 'lucide-react';

const UserDashboard = () => {
    const [user, loading] = useAuthState(auth);
    const [orders, setOrders] = useState([]);
    const [fetchingData, setFetchingData] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});
    // 1. ESTADO DE RESPALDO: Guardamos los datos originales aquí
    const [originalData, setOriginalData] = useState(null);
    // --- NUEVO ESTADO PARA ALERTAS ---
    const [status, setStatus] = useState({ show: false, message: '', type: 'success' });
    
    // Estado para los inputs
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        city: '',
        province: '',
        postalCode: '',
        notes: '' 
    });

    // --- FUNCIÓN SHOWALERT ---
    const showAlert = (message, type = 'success') => {
        setStatus({ show: true, message, type });
        setTimeout(() => {
            setStatus(prev => ({ ...prev, show: false }));
        }, 3000);
    };

    useEffect(() => {
        const loadAllData = async () => {
            if (user) {
                setFetchingData(true);
                try {
                    const profileRes = await axios.get(`${API_URL}/users/profile/${user.uid}`);
                    
                    if (profileRes.data) {
                        const data = {
                            name: profileRes.data.fullName || profileRes.data.name || user.displayName || '',
                            phone: profileRes.data.phone || '',
                            address: profileRes.data.address || '',
                            city: profileRes.data.city || '',
                            province: profileRes.data.province || '',
                            postalCode: profileRes.data.postalCode || '',
                            notes: profileRes.data.notes || ''
                        };
                        // Sincronizamos ambos estados con la data real de la DB
                        setFormData(data);
                        setOriginalData(data);
                    }

                    const ordersRes = await axios.get(`${API_URL}/users/orders/${user.uid}`);
                    setOrders(ordersRes.data);
                } catch (err) {
                    console.error("Error cargando datos:", err);
                } finally {
                    setFetchingData(false);
                }
            }
        };
        loadAllData();
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const validatorName = name === 'name' ? 'fullName' : name;
        
        const newValue = formatInput(validatorName, value);
        setFormData(prev => ({ ...prev, [name]: newValue }));

        const error = validateField(validatorName, newValue);
        setErrors(prev => ({ ...prev, [name]: error || undefined }));
    };

    // 2. FUNCIÓN DE GUARDADO: Si tiene éxito, actualizamos el respaldo
    const handleSave = async () => {
            const dataToValidate = { ...formData, fullName: formData.name };
            const formErrors = validateFullForm(dataToValidate);
            
            if (formErrors.fullName) {
                formErrors.name = formErrors.fullName;
                delete formErrors.fullName;
            }

            setErrors(formErrors);
            if (Object.keys(formErrors).length > 0) {
                showAlert("Revisa los errores en el formulario", "error"); // Alerta de error de validación
                return;
            }

            setIsSaving(true);
            try {
                await axios.post(`${API_URL}/users/sync`, {
                    uid: user.uid,
                    email: user.email,
                    fullName: formData.name, 
                    ...formData 
                });
                
                setOriginalData(formData); 
                setIsEditing(false);
                showAlert("¡Perfil actualizado con éxito!", "success"); // <--- Reemplaza el alert()
            } catch (err) {
                console.error("Error al guardar:", err);
                showAlert("Error al guardar los datos", "error"); // <--- Reemplaza el alert()
            } finally {
                setIsSaving(false);
            }
        };

    // 3. FUNCIÓN DE CANCELAR: Limpia errores y restaura los datos previos
    const handleCancel = () => {
        setFormData(originalData); // Restauramos lo que había antes de editar
        setErrors({});              // Limpiamos mensajes de error
        setIsEditing(false);        // Cerramos el modo edición
    };
    

    if (loading || fetchingData) return <div className={styles.loadingState}><Loader2 className="animate-spin" /></div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.dashboardContainer}>
            {/* --- BLOQUE DE ALERTA --- */}
            {status.show && (
                <div className={`${styles['status-toast']} ${styles.glassToast} ${styles[status.type]} animate-slide-in`}>
                    {status.type === 'loading' && <Loader2 className={styles.spinner} size={20} />}
                    {status.type === 'success' && <CheckCircle2 size={20} color="#22c55e" />}
                    {status.type === 'error' && <AlertCircle size={20} color="#ef4444" />}
                    <p>{status.message}</p>
                </div>
            )}
            <div className={styles.mainContent}>
                <ButtonSupport />
                <header className={styles.dashboardHeader}>
                    <h1 className={styles.dashboardTitle}>Mi 
                        <span className={styles.accent}> Cuenta</span>
                    </h1>
                </header>

                <div className={styles.dashboardGrid}>
                    <div className={styles.userCard}>
                        <div className={styles.cardHeader}>
                            <div className={styles.orangeIndicator}></div>
                            <h2 className={styles.cardTitle}><User size={20} /> Datos Personales</h2>
                        </div>
                        
                        <div className={styles.dataGroup}>
                            {/* CAMPO NOMBRE */}
                            <div className={styles.dataItem}>
                                <span className={styles.dataLabel}>Nombre completo</span>
                                {isEditing ? (
                                    <>
                                        <input 
                                            name="name" 
                                            value={formData.name} 
                                            onChange={handleChange} 
                                            className={`${styles.editInput} ${errors.name ? styles.inputError : ''}`} 
                                        />
                                        {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                                    </>
                                ) : (
                                    <p className={styles.dataValue}>{formData.name || "No especificado"}</p>
                                )}
                            </div>

                            <div className={styles.dataItem}>
                                <span className={styles.dataLabel}>Correo</span>
                                <p className={styles.dataValue}>{user?.email}</p>
                            </div>

                            <div className={styles.inputGroupRow}>
                                {/* CAMPO TELÉFONO */}
                                <div className={styles.dataItem}>
                                    <span className={styles.dataLabel}>Teléfono</span>
                                    {isEditing ? (
                                        <>
                                            <input 
                                                name="phone" 
                                                value={formData.phone} 
                                                onChange={handleChange} 
                                                className={`${styles.editInput} ${errors.phone ? styles.inputError : ''}`} 
                                            />
                                            {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
                                        </>
                                    ) : (
                                        <p className={styles.dataValue}>{formData.phone || "No registrado"}</p>
                                    )}
                                </div>

                                {/* CÓDIGO POSTAL */}
                                <div className={styles.dataItem}>
                                    <span className={styles.dataLabel}>Código Postal</span>
                                    {isEditing ? (
                                        <>
                                            <input 
                                                name="postalCode" 
                                                value={formData.postalCode} 
                                                onChange={handleChange} 
                                                className={styles.editInput} 
                                                maxLength={4} 
                                            />
                                            {errors.postalCode && <span className={styles.errorText}>{errors.postalCode}</span>}
                                        </>
                                    ) : (
                                        <p className={styles.dataValue}>{formData.postalCode || "-"}</p>
                                    )}
                                </div>
                            </div>


                            {/* <h2 className={styles.subSectionTitle}><MapPin size={20} /> Ubicación de Envío</h2> */}


                            <div className={styles.inputGroupRow}>
                                {/* CIUDAD */}
                                <div className={styles.dataItem}>
                                    <span className={styles.dataLabel}>Ciudad</span>
                                    {isEditing ? (
                                        <>
                                            <input name="city" value={formData.city} onChange={handleChange} className={styles.editInput} />
                                            {errors.city && <span className={styles.errorText}>{errors.city}</span>}
                                        </>
                                    ) : (
                                        <p className={styles.dataValue}>{formData.city || "No registrada"}</p>
                                    )}
                                </div>

                                {/* PROVINCIA */}
                                <div className={styles.dataItem}>
                                    <span className={styles.dataLabel}>Provincia</span>
                                    {isEditing ? (
                                        <>
                                            <input name="province" value={formData.province} onChange={handleChange} className={styles.editInput} />
                                            {errors.province && <span className={styles.errorText}>{errors.province}</span>}
                                        </>
                                    ) : (
                                        <p className={styles.dataValue}>{formData.province || "No registrada"}</p>
                                    )}
                                </div>
                            </div>
                            

                            {/* CAMPO DIRECCIÓN */}
                            <div className={styles.dataItem}>
                                <span className={styles.dataLabel}>Dirección</span>
                                {isEditing ? (
                                    <>
                                        <input 
                                            name="address" 
                                            value={formData.address} 
                                            onChange={handleChange} 
                                            className={`${styles.editInput} ${errors.address ? styles.inputError : ''}`} 
                                        />
                                        {errors.address && <span className={styles.errorText}>{errors.address}</span>}
                                    </>
                                ) : (
                                    <p className={styles.dataValue}>{formData.address || "No registrada"}</p>
                                )}
                            </div>

                            {/* CAMPO NOTAS ADICIONALES */}
                            <div className={styles.dataItem}>
                                <span className={styles.dataLabel}>Notas / Instrucciones de envío</span>
                                {isEditing ? (
                                    <>
                                        <input 
                                            name="notes" 
                                            value={formData.notes} 
                                            onChange={handleChange} 
                                            className={styles.editInput} // Usaremos una clase nueva para textarea
                                            placeholder="Ej: Entrega en portería, timbre defectuoso..."
                                        />
                                    </>
                                ) : (
                                    <p className={styles.dataValue}>{formData.notes || "Sin notas adicionales"}</p>
                                )}
                            </div>
                        </div>



                        <div className={styles.actionArea}>
                            {isEditing ? (
                                <div className={styles.editActions}>
                                    <button onClick={handleSave} className={styles.saveBtn} disabled={isSaving}>
                                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        Guardar
                                    </button>
                                    <button onClick={handleCancel} 
                                    className={styles.cancelBtn}>
                                        Cancelar
                                    </button>
                                </div>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className={styles.editProfileBtn}>
                                    <Edit2 size={16} /> Editar Perfil
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Historial de Compras (Se mantiene igual) */}
                    <div className={styles.ordersSection}>
                        <div className={styles.cardHeader}>
                            <div className={styles.blueIndicator}></div>
                            <h2 className={styles.cardTitle}>
                                <Package size={20} className={styles.iconBlue} /> Historial de Compras
                            </h2>
                        </div>

                        {fetchingData ? (
                            <div className={styles.loadingOrders}>
                                <Loader2 className="animate-spin size-4" /> Buscando pedidos...
                            </div>
                        ) : (
                            <div className={styles.ordersList}>
                                {orders.length > 0 ? (
                                    <AnimatePresence>
                                        {orders.map((order, index) => (
                                            <motion.div 
                                                key={order.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={styles.orderItemCard}
                                            >
                                                {/* Contenido de la tarjeta de orden... */}
                                                <div className={styles.orderHeaderRow}>
                                                    <span className={styles.orderId}>PEDIDO #{order.id}</span>
                                                    <span className={`${styles.statusBadge} ${
                                                    order.status === 'ENVIADO' 
                                                        ? styles.statusEnviado 
                                                        : order.status === 'COMPLETADO' 
                                                        ? styles.statusCompletado 
                                                        : styles.statusPending
                                                    }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <p className={styles.orderDate}>Realizado el {new Date(order.createdAt).toLocaleDateString()}</p>

                                                {order.trackingCode ? (
                                                    <div className={styles.trackingBadge}>
                                                        <Truck size={14} />
                                                        <span>Seguimiento: <strong>{order.trackingCode}</strong></span>
                                                    </div>
                                                ) : (
                                                    <div className={styles.noTracking}>
                                                        <span>Pendiente de envío</span>
                                                    </div>
                                                )}

                                                {/* --- SECCIÓN DE PRODUCTOS MEJORADA --- */}
                                                <div className={styles.orderProductsList}>
                                                    {order.items?.map((item) => (
                                                        <div key={item.id} className={styles.productRowLarge}>
                                                            <div className={styles.productImageWrapperLarge}>
                                                                <img 
                                                                    src={item.product?.image || '/placeholder-product.png'} 
                                                                    alt={item.product?.name} 
                                                                    className={styles.productImg}
                                                                />
                                                                <span className={styles.quantityBadgeLarge}>{item.quantity}</span>
                                                            </div>
                                                            <div className={styles.productDetails}>
                                                                <p className={styles.productName}>{item.product?.name}</p>
                                                                <p className={styles.productPrice}>
                                                                    ${(item.price * item.quantity).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                
                                                <div className={styles.orderFooter}>
                                                    <span className={styles.totalText}>Total: ${order.total?.toLocaleString()}</span>
                                                </div>

                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                ) : (
                                    <div className={styles.emptyOrders}>Aún no has realizado ninguna compra.</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default UserDashboard;