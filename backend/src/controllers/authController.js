const { registrarVecino, iniciarSesion, obtenerPerfil } = require('../services/authService');
const { esEmailValido, esPasswordValida, primerErrorDeTextos } = require('../middlewares/validaciones');

// Largos máximos: coinciden con las columnas de prisma/schema.prisma.
// La contraseña llega hasta 72 porque bcrypt solo usa los primeros 72 caracteres.
const REGLAS_REGISTRO = {
  nombre: { max: 100 },
  email: { max: 150 },
  password: { max: 72, recortar: false },
};

const REGLAS_LOGIN = {
  email: { max: 150 },
  password: { max: 72, recortar: false },
};

// POST /api/auth/registro: crea una cuenta de vecino.
const registro = async (req, res, next) => {
  try {
    const errorDeTextos = primerErrorDeTextos(req.body, REGLAS_REGISTRO);
    if (errorDeTextos) {
      return res.status(400).json({ ok: false, error: errorDeTextos });
    }

    const { nombre, email, password } = req.body;

    if (!esEmailValido(email)) {
      return res.status(400).json({ ok: false, error: 'El correo no tiene un formato válido' });
    }

    if (!esPasswordValida(password)) {
      return res
        .status(400)
        .json({ ok: false, error: 'La contraseña necesita mínimo 8 caracteres, una mayúscula, una minúscula y un número' });
    }

    const resultado = await registrarVecino({ nombre, email, password });

    res.status(201).json({ ok: true, data: resultado });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login: revisa el correo y la contraseña, y entrega el token.
const login = async (req, res, next) => {
  try {
    const errorDeTextos = primerErrorDeTextos(req.body, REGLAS_LOGIN);
    if (errorDeTextos) {
      return res.status(400).json({ ok: false, error: errorDeTextos });
    }

    const { email, password } = req.body;
    const resultado = await iniciarSesion({ email, password });

    res.json({ ok: true, data: resultado });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/perfil: entrega los datos del usuario que inició sesión.
const perfil = async (req, res, next) => {
  try {
    const usuario = await obtenerPerfil(req.usuario);

    if (!usuario) {
      return res.status(404).json({ ok: false, error: 'El usuario ya no existe' });
    }

    res.json({ ok: true, data: { usuario } });
  } catch (error) {
    next(error);
  }
};

module.exports = { registro, login, perfil };