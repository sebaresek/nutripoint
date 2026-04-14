const { prisma } = require('../db');

const getCategories = async (req, res) => {
    try {
        // Cambiamos findAll() de Sequelize por findMany() de Prisma
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(categories);
    } catch (e) {
        console.error("Error en getCategories:", e);
        res.status(500).json({ error: e.message });
    }
};

const seedCategories = async (req, res) => {
    const list = [
        'Proteinas', 
        'Creatinas', 
        'Pre-Entrenos', 
        'Quemadores', 
        'Salud & Bienestar', 
        'Accesorios'
    ];
    try {
        await Promise.all(list.map(name => 
            prisma.category.upsert({
                where: { name },
                update: {},
                create: { name }
            })
        ));
        res.send("Categorías actualizadas correctamente");
    } catch (e) {
        res.status(400).send(e.message);
    }
};

module.exports = { getCategories, seedCategories };