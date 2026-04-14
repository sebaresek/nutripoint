const { prisma } = require('../db');

// --- OBTENER TODOS LOS PRODUCTOS ---
const getProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: { category: true },
            orderBy: { id: 'asc' }
        });
        res.status(200).json(products);
    } catch (error) {
        console.error(" Error en getProducts:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// --- CREAR PRODUCTO ---
const createProduct = async (req, res) => {
    try {
        const { title, description, price, oldPrice, stock, image, category, flavors, weight } = req.body;

        // Validamos flavors: Si Prisma falla con Array, lo enviamos como String
        // Pero primero intentamos el formato Array que pide tu Schema
        const flavorsData = Array.isArray(flavors) ? flavors : (flavors ? [flavors] : []);

        const newProduct = await prisma.product.create({
            data: {
                name: title,
                description,
                price: parseFloat(price) || 0,
                oldPrice: parseFloat(oldPrice) || 0,
                weight: parseInt(weight || 1000),
                stock: parseInt(stock) || 0,
                image,
                flavors: flavorsData, 
                category: {
                    connectOrCreate: {
                        where: { name: category || 'Sin Categoria' },
                        create: { name: category || 'Sin Categoria' }
                    }
                }
            },
            include: { category: true }
        });

        console.log("✅ Producto guardado:", newProduct.name);
        res.status(201).json(newProduct);
    } catch (e) {
        console.error("❌ ERROR POST:", e.message);
        res.status(400).json({ error: e.message });
    }
};

// --- ACTUALIZAR PRODUCTO ---
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, price, oldPrice, stock, image, category, flavors, weight } = req.body;

        const updateData = {
            name: title,
            description,
            image,
            weight: weight ? parseInt(weight) : undefined, 
            price: price ? parseFloat(price) : undefined,
            oldPrice: oldPrice !== undefined ? parseFloat(oldPrice) : undefined,
            stock: stock !== undefined ? parseInt(stock) : undefined,
        };

        if (category) {
            updateData.category = {
                connectOrCreate: {
                    where: { name: category },
                    create: { name: category }
                }
            };
        }

        if (flavors) {
            const flavorsArray = Array.isArray(flavors) ? flavors : [flavors];
            // Usamos 'set' porque en PostgreSQL los arrays escalares se actualizan así en Prisma
            updateData.flavors = { set: flavorsArray };
        }

        const updated = await prisma.product.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: { category: true }
        });

        res.json(updated);
    } catch (e) {
        console.error("❌ ERROR UPDATE:", e.message);
        res.status(400).json({ error: e.message });
    }
};

// --- ELIMINAR PRODUCTO ---
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const productId = parseInt(id);

        // 1. Eliminar primero los items de órdenes que referencian este producto
        // ¡OJO! Esto alterará el historial de tus ventas anteriores.
        await prisma.orderItem.deleteMany({
            where: { productId: productId }
        });

        // 2. Ahora sí, borrar el producto
        await prisma.product.delete({
            where: { id: productId }
        });

        res.status(204).send();
    } catch (e) {
        console.error("❌ Error al eliminar:", e.message);
        res.status(400).json({ error: "No se pudo eliminar: el producto tiene registros asociados." });
    }
};

// --- BUSCAR PRODUCTO ---
const searchProduct = async (req, res) => {
  let { q } = req.query;

  if (!q || q.trim().length < 2) return res.json([]);

  const normalize = (text) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const search = q.toLowerCase(); // 🔥 NO normalizar acá

  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          {
            category: {
              name: { contains: search, mode: "insensitive" }
            }
          }
        ],
      },
      include: {
        category: true // 🔥 importante para usar p.category.name
      },
      take: 20,
    });

    const ranked = products
      .map((p) => {
        const name = normalize(p.name || "");
        const desc = normalize(p.description || "");
        const cat = normalize(p.category?.name || "");

        const normalizedSearch = normalize(search);

        let score = 0;

        if (name.startsWith(normalizedSearch)) score += 100;
        if (name.includes(normalizedSearch)) score += 50;

        if (cat.includes(normalizedSearch)) score += 30;
        if (desc.includes(normalizedSearch)) score += 10;

        if (normalizedSearch.includes("prote") && cat.includes("prote")) score += 40;
        if (normalizedSearch.includes("creatina") && name.includes("creatina")) score += 40;

        return { ...p, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    res.json(ranked);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en la búsqueda" });
  }
};

module.exports = { 
    searchProduct, 
    createProduct,
    deleteProduct,
    updateProduct,
    getProducts
 };