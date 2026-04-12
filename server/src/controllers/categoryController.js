const { prisma } = require('../db');

const getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.json(categories);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// categoryController.js
const seedCategories = async (req, res) => {
    // Lista actualizada sin "Aminoacidos" y con "Salud & Bienestar"
    const list = [
        'Proteinas', 
        'Creatinas', 
        'Pre-Entrenos', 
        'Quemadores', 
        'Salud & Bienestar', 
        'Accesorios'
    ];
    try {
        // Usamos findOrCreate para no duplicar si ya existen las otras
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