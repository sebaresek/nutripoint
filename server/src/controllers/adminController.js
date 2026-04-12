const { prisma } = require('../db');

const getMetrics = async (req, res) => {
    try {
        const productCount = await Product.count();
        const userCount = await User.count();
        // Sumamos el total de las órdenes (si no hay, devuelve 0)
        const totalRevenue = await Order.sum('total') || 0;

        res.json({
            totalSales: totalRevenue,
            totalProducts: productCount,
            totalUsers: userCount,
            recentOrders: [] // Podés agregar los últimos 5 aquí luego
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

module.exports = { getMetrics };