// require('dotenv').config();
// const { Sequelize } = require('sequelize');
// const fs = require('fs');
// const path = require('path');
// const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME } = process.env;

// const sequelize = new Sequelize(
//    `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`,
//    {
//       logging: false, 
//       native: false, 
//    }
// );

// const basename = path.basename(__filename);
// const modelDefiners = [];

// // Leemos los archivos de la carpeta models
// fs.readdirSync(path.join(__dirname, '/models'))
//    .filter((file) => file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js')
//    .forEach((file) => {
//       modelDefiners.push(require(path.join(__dirname, '/models', file)));
//    });

// // Inyectamos sequelize a los modelos
// modelDefiners.forEach((model) => model(sequelize));

// // Capitalizamos: product => Product
// let entries = Object.entries(sequelize.models);
// let capsEntries = entries.map((entry) => [
//    entry[0][0].toUpperCase() + entry[0].slice(1),
//    entry[1],
// ]);
// sequelize.models = Object.fromEntries(capsEntries);

// // Extraemos los modelos (Asegurate que los archivos en /models se llamen así)
// const { User, Product, Category, Order } = sequelize.models;

// // RELACIONES
// Category.hasMany(Product, { foreignKey: 'CategoryId' });
// Product.belongsTo(Category, { foreignKey: 'CategoryId' });

// User.hasMany(Order);
// Order.belongsTo(User);

// // Relación muchos a muchos para el carrito
// Product.belongsToMany(Order, { through: 'Order_Detail' });
// Order.belongsToMany(Product, { through: 'Order_Detail' });

// module.exports = {
//    ...sequelize.models, 
//    conn: sequelize,
// };
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

// 1. Configuramos el Pool de conexión de Postgres
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 2. Creamos el adaptador para Prisma 7
const adapter = new PrismaPg(pool);

// 3. Instanciamos el cliente pasándole el adaptador
const prisma = new PrismaClient({ 
  adapter,
  log: ['error', 'warn'] 
});

module.exports = {
  prisma,
  Product: prisma.product,
  Category: prisma.category,
  User: prisma.user,
  Order: prisma.order
};