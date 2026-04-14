import React, { useState } from 'react';
import { Plus, Search, Edit3, Trash2, Image as ImageIcon, Save, X, CheckCircle2, AlertCircle, Loader2, ChevronDown } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import styles from './AdminProducts.module.css';
const API_URL = import.meta.env.VITE_API_URL;

const AdminProducts = () => {
const { products, setProducts, categories } = useOutletContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isSelectActive, setIsSelectActive] = useState(false);
    // ESTADOS PARA ALERTAS Y CONFIRMACIÓN
    const [status, setStatus] = useState({ show: false, message: '', type: 'success' });
    const [productToDelete, setProductToDelete] = useState(null); // Corregido el nombre
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        name: '', 
        price: '', 
        oldPrice: '', 
        category: categories[0]?.name || 'Proteinas', // Aseguramos un fallback válido
        image: '', 
        description: '', 
        flavors: '', 
        stock: '',
        weight: '1000'
    });

    const showAlert = (message, type = 'success') => {
        setStatus({ show: true, message, type });
        setTimeout(() => setStatus(prev => ({ ...prev, show: false })), 3000);
    };

    const filteredProducts = products?.filter(p => 
        (p.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
        (p.category?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    ) || [];

    const openModal = (product = null) => {
        if (product) {
            setEditingId(product.id);
            setFormData({
                name: product.name || '',
                price: product.price || '',
                oldPrice: product.oldPrice || '',
                category: typeof product.category === 'object' ? product.category.name : (product.category || ''),
                image: product.image || '',
                description: product.description || '',
                flavors: product.flavors || '',
                stock: product.stock !== undefined ? product.stock : '',
                weight: product.weight || '1000'
            });
        } else {
            setEditingId(null);
            setFormData({ name: '', price: '', oldPrice: '', category: categories[0]?.name || '', image: '', description: '', flavors: '', stock: '' });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
    };

    const handleSave = async (e) => {
        const token = localStorage.getItem('adminToken');
        e.preventDefault();
        setStatus({ show: true, message: 'Guardando...', type: 'loading' });

        const newProductData = {
            title: formData.name, 
            price: Number(formData.price),
            oldPrice: formData.oldPrice ? Number(formData.oldPrice) : 0,
            category: formData.category,
            image: formData.image,
            description: formData.description,
            flavors: formData.flavors,
            stock: formData.stock ? Number(formData.stock) : 0,
            weight: Number(formData.weight)
        };

        try {
            const isEditing = !!editingId;
            const url = isEditing 
                ? `${API_URL}/admin/products/${editingId}`
                : `${API_URL}/admin/products`;
            const method = isEditing ? 'PUT' : 'POST';


            const response = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newProductData)
            });

            if (response.status === 401 || response.status === 403) {
                alert("Tu sesión expiró o no eres admin. Por favor reingresa.");
                window.location.href = '/'; // Redirigir al login
            }
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Error en el servidor');

            if (isEditing) {
                setProducts(products.map(p => p.id === editingId ? data : p));
                showAlert('Producto actualizado con éxito', 'success');
            } else {
                setProducts([data, ...products]);
                showAlert('Producto creado correctamente', 'success');
            }
            
            closeModal();
        } catch (err) {
            showAlert(err.message, 'error');
        }
    };

    const handleDelete = async (id) => {
        // 1. Obtenemos el token del almacenamiento local
        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch(`${API_URL}/admin/products/${id}`, { method: 'DELETE',
                // 2. Agregamos el segundo parámetro a fetch con el método y los headers
                headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
             });
            if (!res.ok) throw new Error();

            // 3. Verificamos si la sesión expiró (igual que en handleSave)
            if (res.status === 401 || res.status === 403) {
                alert("Tu sesión expiró o no eres admin. Por favor reingresa.");
                window.location.href = '/';
                return;
            }
            
            setProducts(products.filter(p => p.id !== id));
            showAlert('Producto eliminado', 'success');
        } catch (err) {
            showAlert('No se pudo eliminar el producto', 'error');
        } finally {
            setProductToDelete(null);
        }
    };
    
    return (
        <div cclassName="admin-content">

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
            {productToDelete && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.confirmModal} animate-scale-up`}>
                        <AlertCircle size={40} color="#ef4444" style={{ marginBottom: '1rem' }} />
                        <h3>¿Estás seguro?</h3>
                        <p>Esta acción eliminará la orden <strong>#{productToDelete.id}</strong> permanentemente.</p>
                        
                        <div className={styles.modalButtons}>
                            <button 
                                className={styles.cancelBtn} 
                                onClick={() => setProductToDelete(null)}
                            >
                                Cancelar
                            </button>
                            <button 
                                className={styles.confirmBtn} 
                                onClick={() => {
                                    handleDelete(productToDelete.id);
                                    setProductToDelete(null);
                                }}
                            >
                                Sí, eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles['list-header']}>
                <div>
                    <h1>Catálogo de Productos</h1>
                    <p className={styles['text-muted']}>Gestiona el inventario de NutriPoint.</p>
                </div>
                <button className={styles['add-btn']} onClick={() => openModal()}>
                    <Plus size={20} />
                </button>
            </div>

            <div className={`${styles['list-controls']}`} style={{ marginTop: '2rem' }}>
                <div className={styles['search-box']}>
                    <Search size={18} />
                    <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <div className={`glass ${styles['items-table']}`} style={{ marginTop: '1rem' }}>
                <div className={styles['table-header']}>
                    <span>Información</span>
                    <span>Stock</span>
                    <span>Acciones</span>
                </div>

                <div className={styles['table-body']}>
                    {filteredProducts.map(item => (
                        <div key={item.id} className={styles['table-row']}>
                            <div className={styles['item-info']}>
                                <div className={styles['item-img-preview']}>
                                    {item.image ? <img src={item.image} alt="" /> : <ImageIcon size={20} color="#333" />}
                                </div>
                                <div className={styles['item-details']}>
                                    <strong>{item.name}</strong> 
                                    <br />
                                    <span>
                                        ARS {item.price} 
                                        {item.oldPrice > 0 && <small style={{textDecoration: 'line-through', marginLeft: '8px', marginRight: '8px', color: '#ef4444'}}>ARS {item.oldPrice}</small>}  
                                        • {item.category?.name || 'Sin categoría'}
                                    </span>
                                </div>
                            </div>

                            <div className={styles['item-stock']} style={{ color: item.stock > 0 ? '#22c55e' : '#ef4444', fontWeight: 'bold', paddingRight: '20px' }}>
                                {item.stock} u.
                            </div>

                            <div className={styles['item-actions']}>
                                {/* Busca dentro de filteredProducts.map(item => ...) */}
                                <div className={styles['item-actions']}>
                                    <button className={styles['saveBtn']} onClick={() => openModal(item)}><Edit3 size={18} /></button>
                                    
                                    <button 
                                        className={styles['deleteBtn']} 
                                        onClick={() => setProductToDelete(item)} // Usa 'item' que es el objeto actual
                                        title="Eliminar Producto"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showModal && (
                <div className={styles['modal-overlay']}>
                    <div className={`${styles['modal-content']} glass animate-scale-up`}>
                        <button className={styles['close-btn-top']} onClick={closeModal}><X size={24} /></button>

                        <div className={styles['modal-header']}>
                            <h2>{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                        </div>

                        <form onSubmit={handleSave} className={styles['modal-form']}>

                            <div className={styles['form-group']}>
                                <label>Título del Producto</label>
                                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej: Whey Protein..." />
                            </div>

                            <div className={styles['form-grid']} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                <div className={styles['form-group']}>
                                    <label>Precio Actual (ARS)</label>
                                    <input className={styles['no-arrows']} type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                                </div>

                                <div className={styles['form-group']}>
                                    <label>Precio Oferta (Opcional)</label>
                                    <input className={styles['no-arrows']} type="number" value={formData.oldPrice} onChange={e => setFormData({...formData, oldPrice: e.target.value})} />
                                </div>

                                <div className={styles['form-group']}>
                                    <label>Stock Disponible</label>
                                    <input className={styles['no-arrows']} type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                                </div>

                                <div className={styles['form-group']}>
                                    <label>Peso (gramos)</label>
                                    <input 
                                        className={styles['no-arrows']} 
                                        type="number" 
                                        required
                                        value={formData.weight} 
                                        onChange={e => setFormData({...formData, weight: e.target.value})} 
                                        placeholder="Ej: 1000"
                                    />
                                </div>

                                <div className={styles['form-group']}>
                                    <label>Sabores</label>
                                    <input  
                                    className={styles['no-arrows']} 
                                    type="text" 
                                    value={formData.flavors} 
                                    onChange={e => setFormData({...formData, flavors: e.target.value})} />
                                </div>


                                {/* ACAAAAAAAAAAAAAAAAAAAAAAAAAAAAA */}

                                <div className={styles['form-group']}>
                                    <label>Categoría</label>
                                    <div className={`${styles['select-menu']} ${isSelectActive ? styles['active'] : ''}`}>
                                            <div className={styles['select-btn']} onClick={() => setIsSelectActive(!isSelectActive)}>
                                                <span className={styles['sBtn-text']}>
                                                    {formData.category || "Seleccionar..."}
                                                </span>
                                                <ChevronDown 
                                                    size={20} 
                                                    className={isSelectActive ? styles.iconRotate : styles.iconNormal} 
                                                />
                                            </div>

                                            <ul className={styles['options']}>
                                                {categories.map(cat => (
                                                    <li 
                                                        key={cat.id} 
                                                        className={styles['option']} 
                                                        onClick={() => {
                                                            setFormData({...formData, category: cat.name});
                                                            setIsSelectActive(false);
                                                        }}
                                                    >
                                                        <i className='bx bx-category' style={{ color: '#171515' }}></i>
                                                        <span className={styles['option-text']}>{cat.name}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                </div>
                            </div>

                            <div className={styles['form-group']} style={{ marginTop: '1rem' }}>
                                <label>Descripción</label>
                                <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                            </div>

                            <div className={styles['form-group']} style={{ marginTop: '1rem' }}>
                                <label>URL de la Portada</label>
                                <input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
                            </div>

                            <div className={styles['modal-footer']} style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <button type="submit" className={styles['save-btn']}>
                                    <Save size={20} /> Guardar
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminProducts;