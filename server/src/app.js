const express = require('express'); // crea un servidor de Node.js
const cookieParser = require('cookie-parser');  //middleware analiza las cookies en las solicitudes entrantes y las convierte en un objeto que se puede acceder en req.cookies.
const bodyParser = require('body-parser');  //middleware analiza el cuerpo de la solicitud HTTP y lo convierte en un objeto JavaScript que se puede acceder en req.body
const morgan = require('morgan'); //middleware se utiliza para registrar solicitudes HTTP en la consola de la aplicación
const routes = require('./routes/index.js'); // archivo de rutas 
require('./db.js'); // establece la conexión con la base de datos
const server = express();
server.name = 'API';



server.use(bodyParser.urlencoded({ extended: true, limit: '50mb' })); //Configura el servidor para que analice y decodifique datos codificados en formato de URL.
server.use(bodyParser.json({ limit: '50mb' })); //Configura el servidor para que analice y decodifique datos en formato JSON.
server.use(cookieParser()); //Configura el servidor para que analice y decodifique cookies.
server.use(morgan('dev')); //Configura el servidor para que registre solicitudes HTTP en la consola de salida
server.use(express.json());

server.use((req, res, next) => {
  // Cambiamos el '*' por el origen de tu Vite para mayor seguridad y compatibilidad
  res.header('Access-Control-Allow-Origin', 'https://nutripoint.site/'); 
  res.header('Access-Control-Allow-Credentials', 'true');
  // AGREGAMOS 'Authorization' a esta lista:
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE, PATCH');
  // Manejo de la pre-consulta OPTIONS
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});


server.use('/', routes); //Asocia las rutas definidas en el archivo ./routes/index.js con el servidor.

// Error catching endware.
server.use((err, req, res, next) => {
    const status = err.status || 500;  // Establece el código de estado del error, por defecto 500 (Internal Server Error)
    const message = err.message || err; // Define el mensaje de error, usando el mensaje del error o el propio error si no hay mensaje
    console.error(err); // Imprime el error en la consola para registrar detalles del error
    res.status(status).send(message); // Envía una respuesta HTTP con el código de estado y el mensaje de error
  });
  

module.exports = server;
