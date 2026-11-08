require('dotenv').config();

// Sin un secreto largo, cualquiera podría firmar tokens propios.
// En Docker el entrypoint lo genera y lo persiste; fuera de Docker hay que definirlo en .env.
if (!process.env.JWT_SECRETO || process.env.JWT_SECRETO.length < 32) {
  console.error(
    'JWT_SECRETO debe existir y tener al menos 32 caracteres. ' +
    'Genera uno con: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
  );
  process.exit(1);
}

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
// Solo se entregan extensiones de imagen.
// Aunque un archivo ajeno llegara a la carpeta (por ejemplo un .html o .svg),
// no se sirve como documento ejecutable.
const EXTENSIONES_FOTO = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const servirFotos = (req, res, next) => {
  let ruta;
  try {
    ruta = decodeURIComponent(req.path);
  } catch {
    return res.status(404).json({ ok: false, error: 'Ruta no encontrada' });
  }

  if (!EXTENSIONES_FOTO.has(path.extname(ruta).toLowerCase())) {
    return res.status(404).json({ ok: false, error: 'Ruta no encontrada' });
  }

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  next();
};

app.use('/uploads', servirFotos, express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api', rutas);

app.use(rutaNoEncontrada);
app.use(manejarErrores);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API de FocalWare en http://localhost:${PORT}`);
});
