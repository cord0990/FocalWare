const { Router } = require('express');
const notificacionesController = require('../controllers/notificacionesController');
const { verificarToken } = require('../middlewares/autenticacion');
const { permitirRoles } = require('../middlewares/roles');

const router = Router();

// Todas las rutas de notificaciones exigen sesión y son solo para vecinos.
router.use(verificarToken, permitirRoles('vecino'));

router.get('/', notificacionesController.listarMisNotificaciones);
router.put('/:id/leida', notificacionesController.marcarComoLeida);

module.exports = router;