const { Router } = require('express');
const { 
    getProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct,
    searchProduct
} = require('../controllers/productController');
const { getMetrics } = require('../controllers/adminController');
// IMPORTAMOS EL MIDDLEWARE
const { verifyAdmin } = require('../controllers/authMiddleware');

const router = Router();

// Rutas públicas (Cualquiera puede ver o buscar productos)
router.get('/', getProducts);
router.get('/search', searchProduct);

// RUTAS PROTEGIDAS (Solo el admin puede entrar aquí)
// Agregamos 'verifyAdmin' antes de cada controlador
router.post('/', verifyAdmin, createProduct);
router.put('/:id', verifyAdmin, updateProduct);
router.delete('/:id', verifyAdmin, deleteProduct);
router.get('/metrics', verifyAdmin, getMetrics); 

module.exports = router;