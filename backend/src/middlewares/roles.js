// Deja pasar solo a los roles indicados.
// Se usa después de verificarToken, por ejemplo: permitirRoles('funcionario')
const permitirRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ ok: false, error: 'No tienes permiso para hacer esto' });
    }
    next();
  };
};

module.exports = { permitirRoles };
