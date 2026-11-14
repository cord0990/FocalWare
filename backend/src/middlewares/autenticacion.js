const jwt = require('jsonwebtoken');
const { vecinos, funcionarios } = require('../../dist/db/index.js');

const ROLES_VALIDOS = new Set(['vecino', 'funcionario']);

const payloadValido = (datos) =>
  Number.isInteger(datos?.id) && ROLES_VALIDOS.has(datos?.rol);

// Comprueba que la cuenta siga existiendo.
// Si se borró después de emitir el token, el token deja de servir.
const cuentaExiste = async ({ id, rol }) =>
  rol === 'funcionario'
    ? funcionarios.existeFuncionarioPorId(id)
    : vecinos.existeVecinoPorId(id);

// Revisa que la petición traiga un token válido y que la cuenta exista.
// La app lo manda en la cabecera así: Authorization: Bearer <token>
const verificarToken = async (req, res, next) => {
  const cabecera = req.headers.authorization;

  if (!cabecera || !cabecera.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, error: 'Debes iniciar sesión' });
  }

  const token = cabecera.split(' ')[1];
  let datos;

  try {
    datos = jwt.verify(token, process.env.JWT_SECRETO);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ ok: false, error: 'La sesión expiró, vuelve a iniciar sesión' });
    }
    return res.status(401).json({ ok: false, error: 'Token inválido' });
  }

  if (!payloadValido(datos)) {
    return res.status(401).json({ ok: false, error: 'Token inválido' });
  }

  try {
    if (!(await cuentaExiste(datos))) {
      return res.status(401).json({
        ok: false,
        error: 'Tu cuenta ya no existe, vuelve a iniciar sesión',
      });
    }

    // Si la cuenta existe, guardamos el id y el rol para usarlos en el controlador.
    req.usuario = { id: datos.id, rol: datos.rol };
    next();
  } catch (error) {
    next(error);
  }
};

// Igual que verificarToken, pero no corta la petición si no hay token.
// En rutas públicas, un token viejo o de una cuenta eliminada se trata como
// visita anónima para no romper el mapa o el detalle público.
const verificarTokenOpcional = async (req, res, next) => {
  const cabecera = req.headers.authorization;

  if (!cabecera || !cabecera.startsWith('Bearer ')) {
    return next();
  }

  let datos;

  try {
    datos = jwt.verify(cabecera.split(' ')[1], process.env.JWT_SECRETO);
  } catch {
    // Un token inválido en una ruta pública no es motivo para cortar: se sigue
    // como si fuera una visita anónima.
    return next();
  }

  if (!payloadValido(datos)) {
    return next();
  }

  try {
    if (await cuentaExiste(datos)) {
      req.usuario = { id: datos.id, rol: datos.rol };
    }
  } catch {
    // Si la base falla, la ruta pública sigue como anónima.
    // La consulta de los reportes mostrará el error real si la base sigue caída.
  }

  next();
};

module.exports = { verificarToken, verificarTokenOpcional };
