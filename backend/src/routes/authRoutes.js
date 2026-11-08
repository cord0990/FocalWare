const { Router } = require('express');
const authController = require('../controllers/authController');
const { verificarToken } = require('../middlewares/autenticacion');
const { validarCampos } = require('../middlewares/validaciones');
const { crearLimitador, porIp, porEmail } = require('../middlewares/limiteIntentos');

const router = Router();

const QUINCE_MINUTOS = 15 * 60 * 1000;

// Login: frena la fuerza bruta contra una cuenta (10 fallos) y contra muchas
// cuentas desde una misma IP (30 fallos). Un login exitoso libera la cuenta,
// pero no la IP: si no, un atacante podría reiniciar su propio contador
// entrando a su cuenta entre intentos.
const limiteLoginPorIp = crearLimitador({
  nombre: 'login-ip',
  maximo: 30,
  ventanaMs: QUINCE_MINUTOS,
  obtenerClave: porIp,
});

const limiteLoginPorEmail = crearLimitador({
  nombre: 'login-email',
  maximo: 10,
  ventanaMs: QUINCE_MINUTOS,
  obtenerClave: porEmail,
  reiniciarEnExito: true,
});

// Solicitar código: cada petición genera un código nuevo, así que cuentan las
// exitosas y las fallidas. Tres por correo evita llenar la consola y la memoria
// de códigos; diez por IP alcanza para una oficina con varias personas.
const limiteSolicitudPorIp = crearLimitador({
  nombre: 'recuperacion-solicitar-ip',
  maximo: 10,
  ventanaMs: QUINCE_MINUTOS,
  obtenerClave: porIp,
  contarExitos: true,
});

const limiteSolicitudPorEmail = crearLimitador({
  nombre: 'recuperacion-solicitar-email',
  maximo: 3,
  ventanaMs: QUINCE_MINUTOS,
  obtenerClave: porEmail,
  contarExitos: true,
});

// Verificar y restablecer comparten contador: los dos consumen intentos del
// mismo código. El servicio además corta a los 5 intentos por código, pero este
// límite evita que se pidan códigos nuevos para seguir probando sin fin.
const limiteCodigoPorIp = crearLimitador({
  nombre: 'recuperacion-codigo-ip',
  maximo: 30,
  ventanaMs: QUINCE_MINUTOS,
  obtenerClave: porIp,
});

const limiteCodigoPorEmail = crearLimitador({
  nombre: 'recuperacion-codigo-email',
  maximo: 10,
  ventanaMs: QUINCE_MINUTOS,
  obtenerClave: porEmail,
});

router.post('/registro', validarCampos(['nombre', 'email', 'password']), authController.registro);
router.post(
  '/login',
  limiteLoginPorIp,
  limiteLoginPorEmail,
  validarCampos(['email', 'password']),
  authController.login,
);
router.get('/perfil', verificarToken, authController.perfil);
router.put('/perfil', verificarToken, authController.actualizarPerfilPropio);
router.put('/password', verificarToken, authController.cambiarPasswordPropia);

router.post(
  '/recuperacion/solicitar',
  limiteSolicitudPorIp,
  limiteSolicitudPorEmail,
  authController.solicitarRecuperacion,
);
router.post(
  '/recuperacion/verificar',
  limiteCodigoPorIp,
  limiteCodigoPorEmail,
  authController.verificarRecuperacion,
);
router.post(
  '/recuperacion/restablecer',
  limiteCodigoPorIp,
  limiteCodigoPorEmail,
  authController.restablecerContrasena,
);

module.exports = router;
