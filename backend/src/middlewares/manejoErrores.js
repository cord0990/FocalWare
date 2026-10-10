// Responde 404 cuando la ruta no existe.
const rutaNoEncontrada = (req, res) => {
  res.status(404).json({ ok: false, error: 'Ruta no encontrada' });
};

// Captura los errores de los controladores y responde siempre en el mismo formato.
// Express lo reconoce como manejador de errores porque recibe 4 parámetros.
const manejarErrores = (error, req, res, next) => {
  console.error(error);
  const estado = error.estado || 500;
  const mensaje = estado === 500 ? 'Error interno del servidor' : error.message;
  res.status(estado).json({ ok: false, error: mensaje });
};

module.exports = { rutaNoEncontrada, manejarErrores };
