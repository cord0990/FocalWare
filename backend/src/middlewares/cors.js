const cors = require('cors');
const { cargarOrigenes, normalizarOrigen } = require('../config/cors');

const crearCors = () => {
  const origenesPermitidos = cargarOrigenes();

  return cors({
    // Sin Origin (Postman, curl, healthcheck) se permite; no hay navegador que
    // necesite leer la respuesta de otro origen.
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      try {
        return callback(null, origenesPermitidos.has(normalizarOrigen(origin)));
      } catch {
        return callback(null, false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Retry-After'],
    credentials: false,
    maxAge: 600,
    optionsSuccessStatus: 204,
  });
};

module.exports = { crearCors };
