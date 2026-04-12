//                       _oo0oo_
//                      o8888888o
//                      88" . "88
//                      (| -_- |)
//                      0\  =  /0
//                    ___/`---'\___
//                  .' \\|     |// '.
//                 / \\|||  :  |||// \
//                / _||||| -:- |||||- \
//               |   | \\\  -  /// |   |
//               | \_|  ''\---/''  |_/ |
//               \  .-\__  '-'  ___/-. /
//             ___'. .'  /--.--\  `. .'___
//          ."" '<  `.___\_<|>_/___.' >' "".
//         | | :  `- \`.;`\ _ /`;.`/ - ` : | |
//         \  \ `_.   \_ __\ /__ _/   .-` /  /
//     =====`-.____`.___ \_____/___.-`___.-'=====
//                       `=---='
//     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const server = require('./src/app.js');
const { prisma } = require('./src/db.js'); // Traemos prisma en lugar de conn
require('dotenv').config();

const PORT = process.env.PORT || 3010;

// Con Prisma no hace falta .sync(), el servidor arranca directo
async function main() {
  try {
    // Intentamos una operación simple para verificar conexión (opcional)
    await prisma.$connect();
    console.log('✅ Conexión a la base de datos (Postgres via Prisma) exitosa.');

    server.listen(PORT, () => {
      console.log('🚀 NutriPoint escuchando en el puerto:', PORT);
    });
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error);
    process.exit(1);
  }
}

main();