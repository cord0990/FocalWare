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

// Revisa el tipo y el largo de los textos del body.
// Devuelve el mensaje del primer problema, o null si todo está bien.
// Opciones por campo:
//   max         largo máximo (usar el mismo de la columna en prisma/schema.prisma)
//   obligatorio true por defecto; con false, un campo vacío o ausente se acepta
//   recortar    true por defecto: ignora espacios al inicio y al final al contar el largo.
//               En contraseñas se usa false, porque los espacios cuentan.
// Ejemplo: primerErrorDeTextos(req.body, { nombre: { max: 100 }, telefono: { max: 20, obligatorio: false } })
const primerErrorDeTextos = (cuerpo, reglas) => {
  const datos = cuerpo ?? {};

  for (const [campo, opciones] of Object.entries(reglas)) {
    const { max, obligatorio = true, recortar = true } = opciones;
    const valor = datos[campo];

    if (valor === undefined || valor === null || valor === '') {
      if (obligatorio) return `Falta el campo ${campo}`;
      continue;
    }

    if (typeof valor !== 'string') return `El campo ${campo} debe ser texto`;

    const texto = recortar ? valor.trim() : valor;
    if (obligatorio && texto.length === 0) return `Falta el campo ${campo}`;
    if (max !== undefined && texto.length > max) {
      return `El campo ${campo} no puede superar ${max} caracteres`;
    }
  }

  return null;
};

// Lo mismo, como middleware para usar directo en una ruta.
// Ejemplo: router.post('/', validarTextos({ titulo: { max: 150 } }), controlador)
const validarTextos = (reglas) => {
  return (req, res, next) => {
    const mensaje = primerErrorDeTextos(req.body, reglas);
    if (mensaje) {
      return res.status(400).json({ ok: false, error: mensaje });
    }
    next();
  };
};

// Mismas reglas que usa el formulario de registro del frontend

// Revisa que el correo tenga un formato como nombre@dominio.cl
// Solo acepta texto: un número o una lista no es un correo.
const esEmailValido = (email) =>
  typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

// Mínimo 8 caracteres, una mayúscula, una minúscula y un número
const esPasswordValida = (password) => {
  if (typeof password !== 'string') return false;
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);
};

module.exports = { validarCampos, primerErrorDeTextos, validarTextos, esEmailValido, esPasswordValida };