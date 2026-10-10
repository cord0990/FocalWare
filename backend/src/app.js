require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rutas = require('./routes');
const { rutaNoEncontrada, manejarErrores } = require('./middlewares/manejoErrores');

const app = express();

// Solo el frontend configurado en .env puede usar la API (RNF-06)
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

app.use('/api', rutas);

app.use(rutaNoEncontrada);
app.use(manejarErrores);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API de FocalWare en http://localhost:${PORT}`);
});
