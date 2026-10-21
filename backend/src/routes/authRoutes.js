const { Router } = require('express');
const authController = require('../controllers/authController');
const { verificarToken } = require('../middlewares/autenticacion');
const { validarCampos } = require('../middlewares/validaciones');

const router = Router();

router.post('/registro', validarCampos(['nombre', 'email', 'password']), authController.registro);
router.post('/login', validarCampos(['email', 'password']), authController.login);
router.get('/perfil', verificarToken, authController.perfil);
router.put('/perfil', verificarToken, authController.actualizarPerfilPropio);
router.put('/password', verificarToken, authController.cambiarPasswordPropia);

router.post('/recuperacion/solicitar', authController.solicitarRecuperacion);
router.post('/recuperacion/verificar', authController.verificarRecuperacion);
router.post('/recuperacion/restablecer', authController.restablecerContrasena);

module.exports = router;
