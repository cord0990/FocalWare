const { Router } = require('express');
const estadisticasController = require('../controllers/estadisticasController');
const { verificarToken } = require('../middlewares/autenticacion');
const { permitirRoles } = require('../middlewares/roles');

const router = Router();

// Panel de estadísticas del funcionario (RF-09).
router.get('/', verificarToken, permitirRoles('funcionario'), estadisticasController.listarReportesDelAnio);

// "Tu aporte" en el menú de cuenta del vecino.
router.get('/mi-actividad', verificarToken, permitirRoles('vecino'), estadisticasController.miActividad);

module.exports = router;
