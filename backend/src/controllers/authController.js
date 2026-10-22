const {
  registrarVecino,
  iniciarSesion,
  obtenerPerfil,
  cambiarPassword,
  actualizarPerfil,
  solicitarCodigoRecuperacion,
  verificarCodigoRecuperacion,
  restablecerPassword,
} = require('../services/authService');
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

const REGLAS_CAMBIO_PASSWORD = {
  passwordActual: { max: 72, recortar: false },
  passwordNueva: { max: 72, recortar: false },
};

const REGLAS_PERFIL = {
  nombre: { max: 100 },
  email: { max: 150 },
};

const REGLAS_RECUPERACION = {
  email: { max: 150 },
};

const REGLAS_CODIGO = {
  email: { max: 150 },
  codigo: { max: 6 },
};

const REGLAS_RESTABLECER = {
  email: { max: 150 },
  codigo: { max: 6 },
  passwordNueva: { max: 72, recortar: false },
};

const esCodigoValido = (codigo) => /^\d{6}$/.test(String(codigo ?? ''));

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

// cambia la contraseña del usuario con sesión.
const cambiarPasswordPropia = async (req, res, next) => {
  try {
    const errorDeTextos = primerErrorDeTextos(req.body, REGLAS_CAMBIO_PASSWORD);
    if (errorDeTextos) {
      return res.status(400).json({ ok: false, error: errorDeTextos });
    }

    const { passwordActual, passwordNueva } = req.body;

    if (!esPasswordValida(passwordNueva)) {
      return res
        .status(400)
        .json({ ok: false, error: 'La contraseña necesita mínimo 8 caracteres, una mayúscula, una minúscula y un número' });
    }

    const resultado = await cambiarPassword({
      id: req.usuario.id,
      rol: req.usuario.rol,
      passwordActual,
      passwordNueva,
    });

    res.json({ ok: true, data: resultado });
  } catch (error) {
    next(error);
  }
};

// guarda el nombre y el correo del usuario con sesión.
const actualizarPerfilPropio = async (req, res, next) => {
  try {
    const errorDeTextos = primerErrorDeTextos(req.body, REGLAS_PERFIL);
    if (errorDeTextos) {
      return res.status(400).json({ ok: false, error: errorDeTextos });
    }

    const { nombre, email } = req.body;

    if (!esEmailValido(email)) {
      return res.status(400).json({ ok: false, error: 'El correo no tiene un formato válido' });
    }

    const usuario = await actualizarPerfil({
      id: req.usuario.id,
      rol: req.usuario.rol,
      nombre,
      email,
    });

    if (!usuario) {
      return res.status(404).json({ ok: false, error: 'El usuario ya no existe' });
    }

    res.json({ ok: true, data: { usuario } });
  } catch (error) {
    next(error);
  }
};

// genera el código y lo muestra en consola.
const solicitarRecuperacion = async (req, res, next) => {
  try {
    const errorDeTextos = primerErrorDeTextos(req.body, REGLAS_RECUPERACION);
    if (errorDeTextos) {
      return res.status(400).json({ ok: false, error: errorDeTextos });
    }

    const { email } = req.body;

    if (!esEmailValido(email)) {
      return res.status(400).json({ ok: false, error: 'El correo no tiene un formato válido' });
    }

    const resultado = await solicitarCodigoRecuperacion({ email });
    res.json({ ok: true, data: resultado });
  } catch (error) {
    next(error);
  }
};

// revisa el código sin cambiar la clave.
const verificarRecuperacion = async (req, res, next) => {
  try {
    const errorDeTextos = primerErrorDeTextos(req.body, REGLAS_CODIGO);
    if (errorDeTextos) {
      return res.status(400).json({ ok: false, error: errorDeTextos });
    }

    const { email, codigo } = req.body;

    if (!esEmailValido(email)) {
      return res.status(400).json({ ok: false, error: 'El correo no tiene un formato válido' });
    }

    if (!esCodigoValido(codigo)) {
      return res.status(400).json({ ok: false, error: 'El código debe tener 6 dígitos' });
    }

    const resultado = await verificarCodigoRecuperacion({ email, codigo });
    res.json({ ok: true, data: resultado });
  } catch (error) {
    next(error);
  }
};

// cambia la clave usando el código.
const restablecerContrasena = async (req, res, next) => {
  try {
    const errorDeTextos = primerErrorDeTextos(req.body, REGLAS_RESTABLECER);
    if (errorDeTextos) {
      return res.status(400).json({ ok: false, error: errorDeTextos });
    }

    const { email, codigo, passwordNueva } = req.body;

    if (!esEmailValido(email)) {
      return res.status(400).json({ ok: false, error: 'El correo no tiene un formato válido' });
    }

    if (!esCodigoValido(codigo)) {
      return res.status(400).json({ ok: false, error: 'El código debe tener 6 dígitos' });
    }

    if (!esPasswordValida(passwordNueva)) {
      return res
        .status(400)
        .json({ ok: false, error: 'La contraseña necesita mínimo 8 caracteres, una mayúscula, una minúscula y un número' });
    }

    const resultado = await restablecerPassword({ email, codigo, passwordNueva });
    res.json({ ok: true, data: resultado });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registro,
  login,
  perfil,
  cambiarPasswordPropia,
  actualizarPerfilPropio,
  solicitarRecuperacion,
  verificarRecuperacion,
  restablecerContrasena,
};
