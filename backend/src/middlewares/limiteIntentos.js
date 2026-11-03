const crypto = require('crypto');

const VENTANA_POR_DEFECTO_MS = 15 * 60 * 1000;
const MENSAJE_POR_DEFECTO =
  'Demasiados intentos. Espera unos minutos antes de volver a intentar.';
const INTERVALO_LIMPIEZA_MS = 5 * 60 * 1000;

// Dos límites distintos (por IP y por correo) no se pisan aunque usen la misma clave.
const registrosPorLimite = new Map();

const registrosDe = (nombre) => {
  if (!registrosPorLimite.has(nombre)) {
    registrosPorLimite.set(nombre, new Map());
  }
  return registrosPorLimite.get(nombre);
};

const hashear = (texto) => crypto.createHash('sha256').update(texto).digest('hex');

const limpiarVencidos = setInterval(() => {
  const ahora = Date.now();
  for (const registros of registrosPorLimite.values()) {
    for (const [clave, registro] of registros) {
      if (registro.expiraEn <= ahora) {
        registros.delete(clave);
      }
    }
  }
}, INTERVALO_LIMPIEZA_MS);
limpiarVencidos.unref?.();

/**
 * Middleware que bloquea con 429 cuando una clave supera `maximo`
 * intentos dentro de `ventanaMs`.
 *
 * Por defecto solo cuentan las respuestas fallidas (4xx y 5xx) y un login exitoso libera la clave:
 * así el límite por correo no molesta a quien entra bien.
 * Con `contarExitos: true` se cuentan todas las peticiones,
 * que es lo que corresponde a "solicitar código" (cada llamada genera un código nuevo).
 *
 * `obtenerClave` devuelve el texto a limitar (IP, correo, etc.) o null para no
 * limitar esa petición (por ejemplo, si el body no trae un correo válido).
 */
const crearLimitador = ({
  nombre,
  maximo,
  ventanaMs = VENTANA_POR_DEFECTO_MS,
  obtenerClave,
  contarExitos = false,
  reiniciarEnExito = false,
  mensaje = MENSAJE_POR_DEFECTO,
}) => {
  const registros = registrosDe(nombre);

  return (req, res, next) => {
    const textoClave = obtenerClave(req);
    if (!textoClave) return next();

    const clave = hashear(textoClave);
    const ahora = Date.now();
    const registro = registros.get(clave);

    if (registro && registro.expiraEn > ahora && registro.cuenta >= maximo) {
      const segundos = Math.max(1, Math.ceil((registro.expiraEn - ahora) / 1000));
      res.set('Retry-After', String(segundos));
      return res.status(429).json({ ok: false, error: mensaje });
    }

    // La ventana anterior ya venció: se empieza de cero.
    if (registro && registro.expiraEn <= ahora) {
      registros.delete(clave);
    }

    // Se cuenta recién cuando la respuesta termina,
    // para saber si fue un intento fallido.
    res.on('finish', () => {
      const exito = res.statusCode < 400;

      if (exito && reiniciarEnExito) {
        registros.delete(clave);
        return;
      }

      if (exito && !contarExitos) return;

      const momento = Date.now();
      const vigente = registros.get(clave);

      if (!vigente || vigente.expiraEn <= momento) {
        registros.set(clave, { cuenta: 1, expiraEn: momento + ventanaMs });
        return;
      }

      // Ventana fija desde el primer intento: no se corre la expiración con cada
      // intento nuevo, para que el bloqueo no se pueda estirar indefinidamente.
      vigente.cuenta += 1;
    });

    next();
  };
};

// Clave por IP. Se usa en todas las rutas públicas de autenticación.
const porIp = (req) => req.ip ?? 'ip-desconocida';

// Clave por correo normalizado.
// Devuelve null si el body no trae un correo de texto:
// en ese caso el limitador por IP sigue cubriendo la petición.
const porEmail = (req) => {
  const email = req.body?.email;
  if (typeof email !== 'string' || email.trim() === '') return null;
  return email.trim().toLowerCase();
};

module.exports = { crearLimitador, porIp, porEmail, MENSAJE_POR_DEFECTO };
