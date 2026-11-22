const MENSAJE_CONFIGURACION =
  'FRONTEND_URL debe tener al menos un origen http(s), separado por comas si hay varios, y no puede ser "*". ' +
  'Ejemplo: FRONTEND_URL=http://localhost:5173,http://192.168.1.122:5173';

const normalizarOrigen = (valor) => {
  const url = new URL(String(valor).trim());

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`Origen inválido: ${valor}`);
  }

  return url.origin;
};

// Lee una lista separada por comas. Se normaliza cada origen para aceptar, por
// ejemplo, un valor con barra final.
const cargarOrigenes = (valor = process.env.FRONTEND_URL) => {
  const partes = String(valor ?? '')
    .split(',')
    .map((parte) => parte.trim())
    .filter(Boolean);

  if (partes.length === 0 || partes.includes('*')) {
    throw new Error(MENSAJE_CONFIGURACION);
  }

  const origenes = new Set();

  for (const parte of partes) {
    try {
      origenes.add(normalizarOrigen(parte));
    } catch {
      throw new Error(MENSAJE_CONFIGURACION);
    }
  }

  return origenes;
};

module.exports = { cargarOrigenes, normalizarOrigen, MENSAJE_CONFIGURACION };
