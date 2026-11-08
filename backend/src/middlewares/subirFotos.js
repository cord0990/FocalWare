const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const multer = require('multer');

// Máximo 5 fotos por reporte, igual que en el frontend (RF-15)
const MAXIMO_FOTOS = 5;
const TAMANO_MAXIMO = 5 * 1024 * 1024; // 5 MB por foto
const CARPETA_UPLOADS = path.join(__dirname, '..', '..', 'uploads');

// La extensión sale del contenido real, nunca del nombre que envía el cliente.
// Así un archivo .html o .svg no puede terminar guardado y servido como tal.
const EXTENSIONES_IMAGEN = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
]);

const errorInvalido = (mensaje) => {
  const error = new Error(mensaje);
  error.estado = 400;
  return error;
};

// file-type es un módulo ESM, así que se carga con import() desde CommonJS.
const detectarExtension = async (archivo) => {
  const { fileTypeFromBuffer } = await import('file-type');
  const tipo = await fileTypeFromBuffer(archivo.buffer);
  const extension = tipo ? EXTENSIONES_IMAGEN.get(tipo.mime) : undefined;

  if (!extension) {
    throw errorInvalido('Solo se permiten imágenes JPG, PNG o WEBP');
  }

  return extension;
};

// Crea el multer que guarda las fotos en la carpeta indicada (reportes o controles)
const crearSubida = (carpeta) => {
  const destino = path.join(CARPETA_UPLOADS, carpeta);

  // Las fotos se reciben en memoria para revisar sus primeros bytes antes de
  // escribir nada. El límite de 5 MB por foto acota el uso de RAM.
  const subida = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: TAMANO_MAXIMO, files: MAXIMO_FOTOS },
  }).array('fotos', MAXIMO_FOTOS);

  return (req, res, next) => {
    subida(req, res, async (errorMulter) => {
      if (errorMulter) {
        return next(errorMulter);
      }

      const archivos = req.files ?? [];
      const escritos = [];

      try {
        await fs.mkdir(destino, { recursive: true });

        for (const archivo of archivos) {
          const extension = await detectarExtension(archivo);
          const nombre = `${crypto.randomUUID()}${extension}`;
          const ruta = path.join(destino, nombre);

          // 'wx' evita sobrescribir por casualidad un archivo ya existente.
          await fs.writeFile(ruta, archivo.buffer, { flag: 'wx' });
          escritos.push(ruta);

          // El controlador sigue leyendo archivo.filename, igual que antes.
          archivo.filename = nombre;
          archivo.path = ruta;
        }

        next();
      } catch (error) {
        // Si un archivo del lote no es una imagen válida, se borran los que
        // ya se habían escrito para no dejar archivos huérfanos.
        await Promise.all(escritos.map((ruta) => fs.unlink(ruta).catch(() => {})));
        next(error);
      }
    });
  };
};

// Se usan en las rutas, por ejemplo:
// router.post('/', verificarToken, permitirRoles('vecino'), subirFotosReporte, reportesController.crear);
const subirFotosReporte = crearSubida('reportes');
const subirFotosControl = crearSubida('controles');

module.exports = { subirFotosReporte, subirFotosControl };
