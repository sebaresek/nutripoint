const { PrismaClient } = require('@prisma/client');
const pg = require('pg'); // Importación corregida (estilo CommonJS)
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

// 1. Configuramos el Pool de conexión de Postgres
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// 2. Creamos el adaptador para Prisma
const adapter = new PrismaPg(pool);

// 3. Instanciamos el cliente
const prisma = new PrismaClient({ 
  adapter,
  log: ['error', 'warn'] 
});

// 4. Exportamos la instancia y los accesos directos
// IMPORTANTE: Los nombres deben coincidir EXACTAMENTE con tu schema.prisma
module.exports = {
  prisma,
  Product: prisma.product,   // En el schema es 'model Product'
  Category: prisma.category, // En el schema es 'model Category'
  Users: prisma.users,       // CAMBIO: En tu schema es 'model Users', no 'user'
  Order: prisma.order        // En el schema es 'model Order'
};