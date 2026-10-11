// Revisa que lleguen todos los campos obligatorios en el body.
// Ejemplo: validarCampos(['email', 'password'])
const validarCampos = (campos) => {
  return (req, res, next) => {
    const faltantes = campos.filter((campo) => {
      const valor = req.body[campo];
      return valor === undefined || valor === null || String(valor).trim() === '';
    });

    if (faltantes.length > 0) {
      return res.status(400).json({ ok: false, error: `Faltan campos: ${faltantes.join(', ')}` });
    }
    next();
  };
};

// Mismas reglas que usa el formulario de registro del frontend

// Revisa que el correo tenga un formato como nombre@dominio.cl
const esEmailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email).trim());

// Mínimo 8 caracteres, una mayúscula, una minúscula y un número
const esPasswordValida = (password) => {
  const texto = String(password);
  return texto.length >= 8 && /[A-Z]/.test(texto) && /[a-z]/.test(texto) && /\d/.test(texto);
};

module.exports = { validarCampos, esEmailValido, esPasswordValida };
