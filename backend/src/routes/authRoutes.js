const { Router } = require('express');
const authController = require('../controllers/authController');
const { verificarToken } = require('../middlewares/autenticacion');
const { validarCampos } = require('../middlewares/validaciones');

const router = Router();

router.post('/registro', validarCampos(['nombre', 'email', 'password']), authController.registro);
router.post('/login', validarCampos(['email', 'password']), authController.login);
router.get('/perfil', verificarToken, authController.perfil);

module.exports = router;
