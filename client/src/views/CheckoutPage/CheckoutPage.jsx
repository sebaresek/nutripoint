import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Loader2, MapPin, Edit3, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../utils/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { validateField, validateFullForm, formatInput } from '../../utils/validators';
import styles from './CheckoutPage.module.css';
const API_URL = import.meta.env.VITE_API_URL;

export default function CheckoutPage({ items = [] }) {
    const navigate = useNavigate();
    const [user] = useAuthState(auth);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [errors, setErrors] = useState({});
    const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
    const [availableMethods, setAvailableMethods] = useState([]);
    const [selectedMethodId, setSelectedMethodId] = useState(null);

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        address: '',
        postalCode: '',
        province: '',
        city: '',
        notes: '',
    });

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const selectedMethod = availableMethods.find(m => m.id === selectedMethodId);
    const shippingCost = selectedMethod ? selectedMethod.price : 0;
    const total = subtotal + shippingCost;

    // 1. CARGA DE PERFIL MEJORADA
    useEffect(() => {
        if (user) {
            setIsLoadingProfile(true);
            fetch(`${API_URL}/users/profile/${user.uid}`) // Asegúrate de que la URL sea correcta
                .then(res => res.json())
                .then(data => {
                    if (data && data.address && data.postalCode) {
                        setFormData({
                            fullName: data.fullName || data.name || '',
                            phone: data.phone || '',
                            address: data.address || '',
                            postalCode: data.postalCode || '',
                            province: data.province || '',
                            city: data.city || '',
                            notes: '',
                        });
                        setIsEditing(false); // Si tiene datos, vamos directo al resumen
                    } else {
                        setIsEditing(true); // Si faltan datos, mostramos formulario
                    }
                })
                .catch(() => setIsEditing(true))
                .finally(() => setIsLoadingProfile(false));
        }
    }, [user]);

    // 2. CÁLCULO DE ENVÍO CORREGIDO (Se ejecuta aunque estés editando)
    useEffect(() => {
        const fetchShippingOptions = async () => {
            // Solo calculamos si NO estamos editando y hay un CP válido
            if (!isEditing && formData.postalCode && formData.postalCode.length === 4) {
                setIsCalculatingShipping(true);
                try {
                    const response = await fetch(`${API_URL}/shipping/estimate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            destination_cp: formData.postalCode,
                            // Enviamos los items para calcular peso si fuera necesario en el futuro
                            items: items.map(i => ({ id: i.id, quantity: i.quantity }))
                        })
                    });
                    const data = await response.json();
                    
                    // data.options viene de tu shipping.js del backend
                    setAvailableMethods(data.options || []);
                    
                    if (data.options?.length > 0) {
                        setSelectedMethodId(data.options[0].id);
                    }
                } catch (e) {
                    console.error("Error al obtener envíos:", e);
                } finally {
                    setIsCalculatingShipping(false);
                }
            }
        };

        fetchShippingOptions();
    }, [isEditing, formData.postalCode, items]); 

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newValue = formatInput(name, value);
        setFormData(prev => ({ ...prev, [name]: newValue }));
        const error = validateField(name, newValue);
        setErrors(prev => ({ ...prev, [name]: error || undefined }));
    };

    // 3. GUARDAR DATOS EN BDD AL CONFIRMAR
    const handleConfirmAddress = async (e) => {
        e.preventDefault();
        const formErrors = validateFullForm(formData);
        setErrors(formErrors);

        if (Object.keys(formErrors).length === 0) {
            try {
                // Sincronizamos los nombres de campos con lo que espera userController.js
                const payload = {
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName || formData.fullName, // name para el perfil
                    fullName: formData.fullName,                // fullName para el envío
                    phone: formData.phone,
                    address: formData.address,
                    postalCode: formData.postalCode,
                    province: formData.province,
                    city: formData.city,
                    notes: formData.notes
                };

                const response = await fetch(`${API_URL}/users/sync`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error("Error en el servidor");

                // IMPORTANTE: Primero quitamos el modo edición para que se dispare el useEffect de envíos
                setIsEditing(false);
                
            } catch (err) {
                console.error("Error al guardar:", err);
                alert("No se pudieron guardar los datos, pero puedes continuar con la compra.");
                setIsEditing(false); 
            }
        }
    };

    const handleSubmit = async (e) => {
            e.preventDefault();

            // Validar todos los campos antes de disparar el proceso
            const formErrors = validateFullForm(formData);
            setErrors(formErrors);

            if (Object.keys(formErrors).length > 0) return;

            if (!user) {
                alert("Debes iniciar sesión para finalizar la compra");
                return;
            }

            setIsSubmitting(true);
            try {
                const res = await fetch(`${API_URL}/orders`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.uid,
                        email: user.email,
                        items,
                        shippingCost,
                        shippingMethod: selectedMethod ? selectedMethod.name : 'No especificado', // El texto descriptivo
                        ...formData
                    })
                });

                const data = await res.json();
                if (data.init_point) {
                    window.location.href = data.init_point;
                } else {
                    throw new Error("No se pudo generar el link de pago");
                }
            } catch (err) {
                alert(err.message);
            } finally {
                setIsSubmitting(false);
            }
        };

    if (items.length === 0) return null;
    if (isLoadingProfile) return <div className="flex justify-center min-h-screen items-center"><Loader2 className="animate-spin text-orange-500" size={48} /></div>;

    return (
        <div className={styles.container}>
            <button onClick={() => navigate('/')} className={styles.backButton}>
                <ArrowLeft size={18} /> <span>Volver a la tienda</span>
            </button>

            <div className={styles.grid}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h2 className={styles.title}>Finalizar <span className={styles.accent}>Compra</span></h2>
                    
                    <AnimatePresence mode="wait">
                        {isEditing ? (
                            <motion.div key="form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                {/* <h3 className={styles.sectionTitle}><MapPin size={20} /> Datos de Entrega</h3> */}
                                <form onSubmit={handleConfirmAddress} className={styles.form}>
                                    
                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>Nombre Completo</label>
                                        <input name="fullName" value={formData.fullName} onChange={handleChange} className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`} placeholder="Ej: Juan Pérez" />
                                        {errors.fullName && <span className={styles.errorMessage}>{errors.fullName}</span>}
                                    </div>

                                    <div className={styles.row}>
                                        <div className={styles.inputGroup}>
                                            <label className={styles.label}>Teléfono</label>
                                            <input name="phone" value={formData.phone} onChange={handleChange} className={`${styles.input} ${errors.phone ? styles.inputError : ''}`} placeholder="11 2233 4455" />
                                            {errors.phone && <span className={styles.errorMessage}>{errors.phone}</span>}
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label className={styles.label}>Código Postal</label>
                                            <input name="postalCode" placeholder="1904" value={formData.postalCode} onChange={handleChange} className={`${styles.input} ${errors.postalCode ? styles.inputError : ''}`} maxLength={4} />
                                            {errors.postalCode && <span className={styles.errorMessage}>{errors.postalCode}</span>}
                                        </div>
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>Dirección</label>
                                        <input name="address" value={formData.address} onChange={handleChange} className={`${styles.input} ${errors.address ? styles.inputError : ''}`} placeholder="Av. Siempre Viva 123" />
                                        {errors.address && <span className={styles.errorMessage}>{errors.address}</span>}
                                    </div>

                                    <div className={styles.row}>
                                        <div className={styles.inputGroup}>
                                            <label className={styles.label}>Ciudad</label>
                                            <input name="city" placeholder="La Plata" value={formData.city} onChange={handleChange} className={`${styles.input} ${errors.city ? styles.inputError : ''}`} />
                                            {errors.city && <span className={styles.errorMessage}>{errors.city}</span>}
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label className={styles.label}>Provincia</label>
                                            <input name="province" placeholder="Buenos Aires" value={formData.province} onChange={handleChange} className={`${styles.input} ${errors.province ? styles.inputError : ''}`} />
                                            {errors.province && <span className={styles.errorMessage}>{errors.province}</span>}
                                        </div>
                                    </div>

                                    {/* CAMPO DE NOTAS AGREGADO */}
                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>Notas (opcional)</label>
                                        <textarea 
                                            name="notes" 
                                            value={formData.notes} 
                                            onChange={handleChange} 
                                            className={`${styles.input} ${errors.notes ? styles.inputError : ''}`} 
                                            placeholder="Ej: Tocar timbre fuerte, dejar en portería, etc."
                                            rows={3}
                                        />
                                        {errors.notes && <span className={styles.errorMessage}>{errors.notes}</span>}
                                    </div>

                                    <button type="submit" className={styles.submitButton}>
                                        Confirmar Dirección
                                    </button>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div key="summary" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                                <h3 className={styles.sectionTitle}><MapPin size={20} /> Dirección de Entrega</h3>
                                <div className={styles.addressBox}>
                                    <div className={styles.addressContent}>
                                        <span className={styles.addressName}>{formData.fullName}</span>
                                        <span className={styles.addressText}>
                                            {formData.address}, {formData.city}<br />
                                            {formData.province}, CP {formData.postalCode}<br />
                                            Tel: {formData.phone}
                                            {formData.notes && <><br /><br /><strong>Nota:</strong> {formData.notes}</>}
                                        </span>
                                    </div>
                                    <button className={styles.editButton} onClick={() => setIsEditing(true)}>
                                        <Edit3 size={16} /> Modificar
                                    </button>
                                </div>

                                <div className={styles.shippingMethodsContainer}>
                                    <h3 className={styles.sectionTitle}><Truck size={20} /> Métodos de Envío</h3>
                                    {isCalculatingShipping ? (
                                        <div className="flex items-center gap-3 p-4">
                                            <Loader2 className="animate-spin" size={20} /> Calculando...
                                        </div>
                                    ) : availableMethods.length > 0 ? (
                                        availableMethods.map((method) => (
                                            <div 
                                                key={method.id} 
                                                className={`${styles.methodCard} ${selectedMethodId === method.id ? styles.methodCardSelected : ''}`}
                                                onClick={() => setSelectedMethodId(method.id)}
                                            >
                                                <div className={styles.methodInfo}>
                                                    <div className={styles.methodName}>{method.name}</div>
                                                    <div className={styles.methodDetails}>{method.details}</div>
                                                </div>
                                                <div className={styles.methodPrice}>
                                                    {method.price === 0 ? "Gratis" : `$${method.price.toLocaleString('es-AR')}`}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="p-4 text-orange-500">No se encontraron métodos para el CP {formData.postalCode}</p>
                                    )}
                                </div>

                                <button 
                                onClick={handleSubmit} 
                                className={styles.submitButton} 
                                disabled={isSubmitting || !selectedMethodId} 
                                style={{ marginTop: '3rem' }}
                                >
                                {isSubmitting ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    "Pagar con Mercado Pago"
                                )}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* RESUMEN DEL PEDIDO */}
                <motion.div className={styles.summaryCard}>
                    <h3 className={styles.summaryTitle}>Resumen del pedido</h3>
                    <div className={styles.itemsList}>
                        {items.map((item) => (
                            <div key={item.id} className={styles.item}>
                                <img src={item.image} alt={item.title} className={styles.itemImage} />
                                <div style={{ flex: 1 }}>
                                    <h4 className={styles.itemName}>{item.name || item.title}</h4>
                                    
                                    {/* Detalles adicionales del producto */}
                                    <div className={styles.itemSpecs}>
                                        {item.selectedFlavor && (
                                            <span className={styles.itemFlavor}>Sabor: {item.selectedFlavor}</span>
                                        )}
                                    </div>

                                    <p className={styles.itemQty}>Cant: {item.quantity}</p>
                                </div>
                                <p className={styles.itemPrice}>
                                    ${(item.price * item.quantity).toLocaleString('es-AR')}
                                </p>
                            </div>
                        ))}
                    </div>
                    
                    <div className={styles.totalSection}>
                        <div className={styles.totalRowSmall}><span>Subtotal</span><span>${subtotal.toLocaleString('es-AR')}</span></div>
                        <div className={styles.totalRowSmall}><span>Envío 🚚</span><span>{shippingCost > 0 ? `$${shippingCost.toLocaleString('es-AR')}` : (selectedMethodId ? 'Gratis' : '---')}</span></div>
                        <div className={styles.finalTotalRow}><span className={styles.totalLabel}>TOTAL</span><span className={styles.totalAmount}>${total.toLocaleString('es-AR')}</span></div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}