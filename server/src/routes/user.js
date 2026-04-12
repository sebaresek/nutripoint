const { Router } = require('express');
const router = Router();
// Importamos el controlador con las funciones nuevas
const { syncUser, getUserOrders } = require('../controllers/userController');

/**
 * GET /api/users
 * Obtiene todos los usuarios (Útil para tu panel de Admin)
 */
router.get('/', async (req, res) => {
  const { prisma } = require('../db'); // Traemos prisma para esta consulta rápida
  try {
    const users = await prisma.users.findMany();
    res.json(users);
  } catch (e) { 
    res.status(500).send(e.message); 
  }
});

/**
 * GET /api/users/profile/:uid
 * Recupera los datos de un usuario específico (nombre, dirección, teléfono)
 */
router.get('/profile/:uid', async (req, res) => {
  const { uid } = req.params;
  const { prisma } = require('../db');
  try {
    const user = await prisma.users.findUnique({
      where: { id: uid } // Buscamos por el UID de Firebase
    });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /api/users/sync
 * Esta es la ruta CLAVE. Se llama desde el frontend al loguearse con Firebase.
 * Reemplaza al antiguo /register.
 */
router.post('/sync', syncUser);

/**
 * GET /api/users/orders/:uid
 * Esta ruta es la que alimenta el panel de "Mis Compras" y "Seguimiento".
 */
router.get('/orders/:uid', getUserOrders);

module.exports = router;