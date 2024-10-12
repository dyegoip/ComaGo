const jsonServer = require('json-server');
const cors = require('cors');
const server = jsonServer.create();
const router = jsonServer.router('db.json'); // tu archivo de datos
const middlewares = jsonServer.defaults();

// Habilitar CORS
server.use(cors());
server.use(middlewares);
server.use(router);
server.listen(3000, () => {
  console.log('JSON Server is running on http://localhost:3000');
});