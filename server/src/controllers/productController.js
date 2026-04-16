const { prisma } = require('../db');

// --- OBTENER TODOS LOS PRODUCTOS ---
const getProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: { 
                category: true,
                variants: true // 🔥 ESTO ES VITAL
            },
            orderBy: { id: 'asc' }
        });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- CREAR PRODUCTO ---
const createProduct = async (req, res) => {
    try {
        const { title, description, price, oldPrice, category, variants, weight, image } = req.body;

        const newProduct = await prisma.product.create({
            data: {
                name: title,
                description,
                price: parseFloat(price) || 0,
                oldPrice: parseFloat(oldPrice) || 0,
                weight: parseInt(weight) || 1000,
                image,
                category: {
                    connectOrCreate: {
                        where: { name: category || 'Sin Categoria' },
                        create: { name: category || 'Sin Categoria' }
                    }
                },
                // Crear variantes anidadas
                variants: {
                    create: variants.map(v => ({
                        flavor: v.flavor,
                        stock: parseInt(v.stock) || 0,
                        image: v.image
                    }))
                }
            },
            include: { variants: true, category: true }
        });

        res.status(201).json(newProduct);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};

// --- ACTUALIZAR PRODUCTO ---
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, price, oldPrice, category, variants, weight, image } = req.body;

        // --- LOG 1: Ver qué llega del frontend ---
        console.log("-----------------------------------------");
        console.log("📥 PAYLOAD RECIBIDO EN UPDATE (ID:", id, "):");
        console.log("Variants:", JSON.stringify(variants, null, 2));

        // Transformación de datos con logs de seguridad
        const cleanedVariants = (variants || []).map(v => ({
            flavor: v.flavor || 'Sin Sabor',
            stock: parseInt(v.stock) || 0, // Forzamos a que sea Número
            image: v.image || null
        }));

        console.log("🛠️ VARIANTES MAPEADAS PARA PRISMA:", cleanedVariants);

        const updated = await prisma.product.update({
            where: { id: parseInt(id) },
            data: {
                name: title,
                description,
                price: parseFloat(price) || 0,
                oldPrice: parseFloat(oldPrice) || 0,
                weight: parseInt(weight) || 1000,
                image,
                category: {
                    connectOrCreate: {
                        where: { name: category || 'Sin Categoria' },
                        create: { name: category || 'Sin Categoria' }
                    }
                },
                variants: {
                    // Borramos las variantes viejas para evitar duplicados o IDs huérfanos
                    deleteMany: {}, 
                    create: cleanedVariants
                }
            },
            include: {
                category: true,
                variants: true
            }
        });

        console.log("✅ PRODUCTO ACTUALIZADO CON ÉXITO");
        console.log("-----------------------------------------");
        res.status(200).json(updated);

    } catch (error) {
        console.error("❌ ERROR EN UPDATE PRODUCT:", error);
        res.status(400).json({ error: error.message });
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