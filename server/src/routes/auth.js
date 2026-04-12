const { Router } = require('express');
const { loginAdmin } = require('../controllers/authController');
const router = Router();

// Esta es la URL que llamará el frontend
router.post('/login-admin', loginAdmin);

module.exports = router;