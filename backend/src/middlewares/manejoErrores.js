// Responde 404 cuando la ruta no existe.
const rutaNoEncontrada = (req, res) => {
  res.status(404).json({ ok: false, error: 'Ruta no encontrada' });
};

// Cómo viajan los errores:
// 1. Un servicio o controlador detecta un problema y lanza crearErrorHTTP(404, 'mensaje').
// 2. El controlador lo atrapa con try/catch y lo pasa con next(error).
// 3. manejarErrores lo recibe y responde siempre { ok: false, error: 'mensaje' }.
// Los errores que no creamos nosotros (Prisma, JSON mal formado, fotos) se traducen
// en traducirError. Si no se reconoce ninguno, la respuesta es un 500 genérico.
const CODIGOS_HTTP = new Set([200, 201, 400, 401, 403, 404, 409, 500]);

// Crea un Error que el manejador central traduce al código HTTP indicado.
const crearErrorHTTP = (estado, mensaje) => {
  const error = new Error(mensaje);
  error.estado = estado;
  error.status = estado;
  return error;
};

const MENSAJES_FOTOS = {
  LIMIT_FILE_SIZE: 'Cada foto puede pesar como máximo 5 MB',
  LIMIT_FILE_COUNT: 'Se pueden subir hasta 5 fotos',
  LIMIT_UNEXPECTED_FILE: 'Las fotos enviadas no son válidas (máximo 5)',
};

// Convierte errores que no creamos nosotros en un código HTTP y un mensaje claros.
// Devuelve null si no reconoce el error.
const traducirError = (error) => {
  // Prisma: errores conocidos de la base de datos.
  switch (error?.code) {
    case 'P2000':
      return { estado: 400, mensaje: 'Alguno de los datos es demasiado largo' };
    case 'P2002':
      return { estado: 409, mensaje: 'Ya existe un registro con esos datos' };
    case 'P2003':
      return { estado: 400, mensaje: 'Los datos hacen referencia a algo que no existe' };
    case 'P2025':
      return { estado: 404, mensaje: 'No se encontró el registro indicado' };
    default:
      break;
  }

  // Prisma: datos con un tipo o formato que la base no acepta (por ejemplo, texto donde va un número).
  if (error?.name === 'PrismaClientValidationError') {
    return { estado: 400, mensaje: 'Algún dato tiene un tipo o formato incorrecto' };
  }

  // El body llegó con un JSON mal formado.
  if (error?.type === 'entity.parse.failed') {
    return { estado: 400, mensaje: 'El cuerpo de la petición no es un JSON válido' };
  }

  // Error de multer al subir fotos (demasiado pesadas, demasiadas, etc.).
  if (error?.name === 'MulterError') {
    return { estado: 400, mensaje: MENSAJES_FOTOS[error.code] ?? 'No se pudieron procesar las fotos' };
  }

  return null;
};

// Captura los errores de los controladores y responde siempre en el mismo formato.
// Express lo reconoce como manejador de errores porque recibe 4 parámetros.
const manejarErrores = (error, req, res, next) => {
  console.error(error);

  const traducido = traducirError(error);
  if (traducido) {
    return res.status(traducido.estado).json({ ok: false, error: traducido.mensaje });
  }

  const estado = CODIGOS_HTTP.has(error?.estado ?? error?.status)
    ? (error.estado ?? error.status)
    : 500;
  const mensaje = estado === 500 ? 'Error interno del servidor' : (error?.message ?? 'Error');
  res.status(estado).json({ ok: false, error: mensaje });
};

module.exports = { rutaNoEncontrada, manejarErrores, crearErrorHTTP };