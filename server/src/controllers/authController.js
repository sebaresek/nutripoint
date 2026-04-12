const jwt = require('jsonwebtoken');

const loginAdmin = async (req, res) => {
    const { email } = req.body;
    console.log("Email recibido en back:", email); // Agrega este log para debuggear

    if (email === 'nutripoint.ar@gmail.com') {
        const token = jwt.sign(
            { email, role: 'admin' },
            process.env.JWT_SECRET || 'clave_temporal_nutripoint',
            { expiresIn: '8h' }
        );
        return res.json({ token });
    }
    
    res.status(403).json({ error: "No autorizado" });
};

module.exports = { loginAdmin };