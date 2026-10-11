const path = require('path');
const multer = require('multer');

// Máximo 5 fotos por reporte, igual que en el frontend (RF-15)
const MAXIMO_FOTOS = 5;
const TAMANO_MAXIMO = 5 * 1024 * 1024; // 5 MB por foto
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];

// Crea el multer que guarda las fotos en la carpeta indicada (reportes o controles)
const crearSubida = (carpeta) => {
  const almacenamiento = multer.diskStorage({
    destination: path.join(__dirname, '..', '..', 'uploads', carpeta),
    // Nombre único para que dos fotos con el mismo nombre no se pisen
    filename: (req, archivo, cb) => {
      const extension = path.extname(archivo.originalname).toLowerCase();
      const nombre = `${Date.now()}-${Math.round(Math.random() * 1000000)}${extension}`;
      cb(null, nombre);
    },
  });

  // Solo deja pasar imágenes
  const filtrarImagenes = (req, archivo, cb) => {
    if (TIPOS_PERMITIDOS.includes(archivo.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP'));
    }
  };

  return multer({
    storage: almacenamiento,
    fileFilter: filtrarImagenes,
    limits: { fileSize: TAMANO_MAXIMO, files: MAXIMO_FOTOS },
  }).array('fotos', MAXIMO_FOTOS);
};

// Pasa los errores de multer al mismo formato de respuesta de la API
const manejarSubida = (subida) => {
  return (req, res, next) => {
    subida(req, res, (error) => {
      if (!error) {
        return next();
      }

      let mensaje = error.message;
      if (error.code === 'LIMIT_FILE_SIZE') {
        mensaje = 'Cada foto puede pesar máximo 5 MB';
      } else if (error.code === 'LIMIT_FILE_COUNT' || (error.code === 'LIMIT_UNEXPECTED_FILE' && error.field === 'fotos')) {
        mensaje = `Puedes subir máximo ${MAXIMO_FOTOS} fotos`;
      } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        mensaje = 'Las fotos deben enviarse en el campo "fotos"';
      }
      res.status(400).json({ ok: false, error: mensaje });
    });
  };
};

// Se usan en las rutas, por ejemplo:
// router.post('/', verificarToken, permitirRoles('vecino'), subirFotosReporte, reportesController.crear);
const subirFotosReporte = manejarSubida(crearSubida('reportes'));
const subirFotosControl = manejarSubida(crearSubida('controles'));

module.exports = { subirFotosReporte, subirFotosControl };
