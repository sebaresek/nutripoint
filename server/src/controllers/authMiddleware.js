const jwt = require('jsonwebtoken');

const verifyAdmin = (req, res, next) => {
    // 1. Obtener el token del header (formato: "Bearer TOKEN")
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. Se requiere login.' });
    }

    try {
        // 2. Verificar el token con tu clave secreta
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta');
        
        // 3. Validar que el rol sea ADMIN
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Prohibido. No tienes permisos de administrador.' });
        }

        req.user = decoded;
        next(); // Si todo está bien, pasa al controlador
    } catch (error) {
        res.status(403).json({ error: 'Token inválido o expirado.' });
    }
};

module.exports = { verifyAdmin };