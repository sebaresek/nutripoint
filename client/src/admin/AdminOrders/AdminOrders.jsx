import React, { useState, useEffect } from 'react';
import { 
    Truck, Trash2, Save, Loader2, User, 
    Package, Calendar, MessageSquare, CircleDollarSign,
    CheckCircle2, AlertCircle, DollarSign, Phone
} from 'lucide-react';
import styles from './AdminOrders.module.css';
const API_URL = import.meta.env.VITE_API_URL;

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingId, setLoadingId] = useState(null);
    const [trackingValues, setTrackingValues] = useState({});
    const [orderToDelete, setOrderToDelete] = useState(null); // Almacena el ID de la orden a eliminar
    
    // --- NUEVO ESTADO PARA ALERTAS ---
    const [status, setStatus] = useState({ show: false, message: '', type: 'success' });
    

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch(`${API_URL}/orders`);
                if (!res.ok) throw new Error("Error al obtener pedidos");
                const data = await res.json();
                setOrders(data);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    // --- FUNCIÓN SHOWALERT ---
    const showAlert = (message, type = 'success') => {
        setStatus({ show: true, message, type });
        setTimeout(() => {
            setStatus(prev => ({ ...prev, show: false }));
        }, 3000);
    };

    const updateTracking = async (orderId) => {
        const token = localStorage.getItem('adminToken');
        const code = trackingValues[orderId];
        if (code === undefined) return;

        setLoadingId(orderId);
        // Opcional: mostrar estado de carga en la alerta
        setStatus({ show: true, message: 'Actualizando pedido...', type: 'loading' });

        try {
            const res = await fetch(`${API_URL}/orders/${orderId}/tracking`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' },
                body: JSON.stringify({ trackingCode: code })
            });

            if (res.status === 401 || res.status === 403) {
                alert("Tu sesión expiró o no eres admin. Por favor reingresa.");
                window.location.href = '/';
                return;
            }

            if (res.ok) {
                setOrders(prev => prev.map(o => 
                    o.id === orderId 
                        ? { ...o, trackingCode: code, status: "ENVIADO" } 
                        : o
                ));
                showAlert("Orden actualizada", "success");
            } else {
                throw new Error("No se pudo actualizar");
            }
        } catch (error) {
            showAlert("❌ Error al conectar con el servidor", "error");
        } finally {
            setLoadingId(null);
        }
    };

    const handleDelete = async (orderId) => {
        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch(`${API_URL}/orders/${orderId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.status === 401 || res.status === 403) {
                alert("Tu sesión expiró o no eres admin. Por favor reingresa.");
                window.location.href = '/';
                return;
            }

            if (res.ok) {
                setOrders(prev => prev.filter(o => o.id !== orderId));
                showAlert("Orden eliminada correctamente", "success");
            } else {
                throw new Error();
            }
        } catch (error) {
            showAlert("No se pudo eliminar la orden", "error");
        }
    };

    if (loading) return <div className="admin-content"><Loader2 className="spin" /> Cargando pedidos...</div>;

    return (
        <div className="admin-content">
            {/* --- BLOQUE DE ALERTA --- */}
            {status.show && (
                <div className={`${styles['status-toast']} glass ${styles[status.type]} animate-slide-in`}>
                    {status.type === 'loading' && <Loader2 className={styles.spinner} size={20} />}
                    {status.type === 'success' && <CheckCircle2 size={20} color="#22c55e" />}
                    {status.type === 'error' && <AlertCircle size={20} color="#ef4444" />}
                    <p>{status.message}</p>
                </div>
            )}

            {/* --- MODAL DE CONFIRMACIÓN ESTILO GLASS --- */}
            {orderToDelete && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.confirmModal} animate-scale-up`}>
                        <AlertCircle size={40} color="#ef4444" style={{ marginBottom: '1rem' }} />
                        <h3>¿Estás seguro?</h3>
                        <p>Esta acción eliminará la orden <strong>#{orderToDelete}</strong> permanentemente.</p>
                        
                        <div className={styles.modalButtons}>
                            <button 
                                className={styles.cancelBtn} 
                                onClick={() => setOrderToDelete(null)}
                            >
                                Cancelar
                            </button>
                            <button 
                                className={styles.confirmBtn} 
                                onClick={() => {
                                    handleDelete(orderToDelete);
                                    setOrderToDelete(null);
                                }}
                            >
                                Sí, eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header style={{ marginBottom: '2rem' }}>
                <h1>Gestión de Pedidos</h1>
                <p className="text-muted">Administración de envíos y cancelaciones.</p>
            </header>

            <div className={styles.ordersGrid}>
                {orders.length === 0 ? (
                    <p>No hay órdenes registradas aún.</p>
                ) : (
                    orders.map(order => (
                        <div key={order.id} className={`${styles.statCard} glass`}>

                            <div className={styles.orderBody}>
                                <div className={styles.orderHeader}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span className={styles.orderId}>#{order.id}</span>
                                        <span 
                                        className={`${styles.statusBadge} ${
                                            order.status === 'ENVIADO' 
                                            ? styles.statusEnviado 
                                            : order.status === 'COMPLETADO' 
                                            ? styles.statusCompletado 
                                            : styles.statusPending
                                            }`}
                                        >
                                            {order.status}
                                        </span>
                                    </div>
                                </div>

                                <p className={styles.customerName}>
                                    <User style={{ color: '#4494ef' }} size={16} /> {order.fullName || order.user?.name}
                                </p>

                                <p className={styles.customerName}>
                                    <Phone style={{ color: '#4494ef' }} size={16} /> {order.phone || "Sin teléfono"}
                                </p>

                                <div className={styles.customerName}>
                                    <p><Truck style={{ color: '#4494ef' }}size={16} /> {order.shippingMethod || 'Método no especificado'}
                                    </p>
                                </div>

                                <div className={styles.customerName}>
                                    <p><CircleDollarSign style={{ color: '#4494ef' }} size={16} /> Costo de envío: <span>${order.shippingCost || 0}</span>
                                    </p>
                                </div>

                                <p ><Calendar style={{ color: '#4494ef' }} size={16}/> {new Date(order.createdAt).toLocaleDateString()}</p>

                                {/* Debajo de la sección de envío y antes del tracking */}
                                <div className={styles.orderItemsList}>
                                    <p  className={styles.productName}>
                                        <Package style={{ color: '#4494ef' }} size={14} /> Productos:
                                    </p>
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className={styles.orderItemRow}>
                                            <span>{item.quantity}x {item.product?.name || 'Producto'}</span>
                                            {item.selectedFlavor && (
                                                <span className={styles.flavorBadge}>{item.selectedFlavor}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className={styles.trackingSection}>
                                    {/* <label>Código de Seguimiento</label> */}
                                    <div className={styles.inputGroup}>
                                        <input 
                                            type="text"
                                            className="checkout-input"
                                            placeholder="Ej: TRK-992211"
                                            defaultValue={order.trackingCode}
                                            onChange={(e) => setTrackingValues({
                                                ...trackingValues,
                                                [order.id]: e.target.value
                                            })}
                                        />
                                        <button 
                                            className={styles.saveBtn}
                                            onClick={() => updateTracking(order.id)}
                                            disabled={loadingId === order.id}
                                        >
                                            {loadingId === order.id ? (
                                                <Loader2 className="spin" size={16} />
                                            ) : (
                                                <Save size={18} />
                                            )}
                                        </button>
                                        
                                        <button 
                                            className={styles.deleteBtn} 
                                            onClick={() => setOrderToDelete(order.id)} // <--- Ahora solo abre el modal
                                            title="Eliminar Orden"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                {(order.notes || order.user?.notes) && (
                                    <div className={styles.orderNotes}>
                                        <MessageSquare size={18} className={styles.noteIcon} />
                                        <p>{order.notes || order.user.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminOrders;