// Responde 404 cuando la ruta no existe.
const rutaNoEncontrada = (req, res) => {
  res.status(404).json({ ok: false, error: 'Ruta no encontrada' });
};

//Tengo que entender bien como plantearemos los errores, me confundo.
const CODIGOS_HTTP = new Set([200, 201, 400, 401, 403, 404, 409, 500]);

// Crea un Error que el manejador central traduce al código HTTP indicado.
const crearErrorHTTP = (estado, mensaje) => {
  const error = new Error(mensaje);
  error.estado = estado;
  error.status = estado;
  return error;
};

// Captura los errores de los controladores y responde siempre en el mismo formato.
// Express lo reconoce como manejador de errores porque recibe 4 parámetros.
const manejarErrores = (error, req, res, next) => {
  console.error(error);
  const estado = CODIGOS_HTTP.has(error?.estado ?? error?.status)
    ? (error.estado ?? error.status)
    : 500;
  const mensaje = estado === 500 ? 'Error interno del servidor' : (error?.message ?? 'Error');
  res.status(estado).json({ ok: false, error: mensaje });
};

module.exports = { rutaNoEncontrada, manejarErrores, crearErrorHTTP };