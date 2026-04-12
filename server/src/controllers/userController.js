const { prisma } = require('../db');

/**
 * Esta función reemplaza a registerUser y syncProfile.
 * Se encarga de crear el usuario si no existe o actualizarlo si ya existe.
 */
const syncUser = async (req, res) => {
    // 1. Agregamos los nuevos campos al destructuring del body
    const { 
        uid, 
        email, 
        name, 
        fullName, 
        phone, 
        address, 
        postalCode, 
        province, 
        city,
        notes
    } = req.body;

    try {
        const user = await prisma.users.upsert({
            where: { id: uid },
            update: {
                name, // Nombre de Firebase
                fullName, // Nombre real para envíos
                phone,
                address,
                postalCode,
                province,
                city,
                notes,
                updatedAt: new Date()
            },
            create: {
                id: uid, 
                email,
                name,
                fullName,
                phone,
                address,
                postalCode,
                province,
                city,
                notes,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

        res.status(200).json({
            message: "Perfil de usuario sincronizado",
            user
        });
    } catch (error) {
        console.error("Error en syncUser:", error);
        res.status(500).json({ error: "Error interno al sincronizar el perfil" });
    }
};

/**
 * Obtiene los pedidos vinculados al UID de Firebase para el panel de seguimiento
 */
const getUserOrders = async (req, res) => {
    const { uid } = req.params;
    try {
        const orders = await prisma.order.findMany({
            where: { userId: uid },
            orderBy: { createdAt: 'desc' },
            include: {
                items: {
                    include: {
                        product: true // Traemos también la info del producto (nombre, imagen)
                    }
                }
            }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener pedidos" });
    }
};

module.exports = { syncUser, getUserOrders };