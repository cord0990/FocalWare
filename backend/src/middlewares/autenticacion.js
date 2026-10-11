const jwt = require('jsonwebtoken');

// Revisa que la petición traiga un token válido.
// La app lo manda en la cabecera así: Authorization: Bearer <token>
const verificarToken = (req, res, next) => {
  const cabecera = req.headers.authorization;

  if (!cabecera || !cabecera.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, error: 'Debes iniciar sesión' });
  }

  const token = cabecera.split(' ')[1];

  try {
    // Si el token es válido, guardamos el id y el rol para usarlos en el controlador
    const datos = jwt.verify(token, process.env.JWT_SECRETO);
    req.usuario = { id: datos.id, rol: datos.rol };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ ok: false, error: 'La sesión expiró, vuelve a iniciar sesión' });
    }
    return res.status(401).json({ ok: false, error: 'Token inválido' });
  }
};

module.exports = { verificarToken };
