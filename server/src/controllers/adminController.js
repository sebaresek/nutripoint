const { prisma } = require('../db');

const getMetrics = async (req, res) => {
    try {
        // En Prisma usamos count() sobre el modelo correspondiente
        const productCount = await prisma.product.count();
        const userCount = await prisma.users.count();
        const aggregateSales = await prisma.order.aggregate({
            _sum: {
                total: true
            }
        });
        const totalRevenue = aggregateSales._sum.total || 0;
        res.json({
            totalSales: totalRevenue,
            totalProducts: productCount,
            totalUsers: userCount,
            recentOrders: [] 
        });
    } catch (e) {
        console.error("Error en getMetrics:", e);
        res.status(500).json({ error: e.message });
    }
};

module.exports = { getMetrics };