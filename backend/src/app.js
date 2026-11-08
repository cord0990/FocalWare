require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const rutas = require('./routes');
const { rutaNoEncontrada, manejarErrores } = require('./middlewares/manejoErrores');

const app = express();

// Detrás de un proxy inverso (nginx, balanceador) la IP real del cliente llega
// en X-Forwarded-For. Solo se confía en esa cabecera si TRUST_PROXY=1: si la API
// está expuesta directamente, cualquiera podría inventarla y saltarse el límite
// de intentos por IP.
if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

// Solo el frontend configurado en .env puede usar la API (RNF-06)
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// Fotos de los reportes y de los controles, por ejemplo /uploads/reportes/foto.jpg
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api', rutas);

app.use(rutaNoEncontrada);
app.use(manejarErrores);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API de FocalWare en http://localhost:${PORT}`);
});
