const { Router } = require('express');
const { getMetrics } = require('../controllers/adminController');
const productRouter = require('./product.js');
const categoryRouter = require('./category.js');
const userRouter = require('./user.js'); // Este es el que modificamos recién
const orderRouter = require('./order.js');
const shippingRouter = require('./shipping.js');
const authRoutes = require('./auth');

const router = Router();

// --- RUTAS DE ADMINISTRACIÓN ---
// Prefijamos con /admin para que sea semántico
router.use('/api/admin/products', productRouter);
router.get('/api/admin/metrics', getMetrics);

// --- RUTAS DE CATEGORÍAS Y PRODUCTOS (PÚBLICAS) ---
router.use('/categories', categoryRouter);

// --- RUTAS DE USUARIO (PERFIL Y SEGUIMIENTO) ---
// Aquí es donde el cliente interactúa con su cuenta
// Las rutas serán: /api/users/sync y /api/users/orders/:uid
router.use('/api/users', userRouter);

// --- RUTAS DE ÓRDENES (PROCESAMIENTO DE COMPRA) ---
// Esto suele usarse para el checkout (Mercado Pago, etc.)
router.use('/api/orders', orderRouter);

// --- RUTAS DE ÓRDENES (PROCESAMIENTO DE COMPRA) ---
// Esto suele usarse para el checkout (Mercado Pago, etc.)
router.use('/api/shipping', shippingRouter);

router.use('/api/auth', authRoutes);

module.exports = router;