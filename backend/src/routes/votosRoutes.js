const { Router } = require('express');
const votosController = require('../controllers/votosController');
const { verificarToken } = require('../middlewares/autenticacion');
const { permitirRoles } = require('../middlewares/roles');

const router = Router();

// Este router se monta dentro del de reportes, sin prefijo (ver
// reportesRoutes.js), así que las rutas llevan el id del reporte.
//
// Solo los vecinos apoyan o sacan su apoyo (EP 2.1, 7.1). Por eso el
// middleware de rol va en la ruta y no dentro del controlador.
router.post('/:id/votos', verificarToken, permitirRoles('vecino'), votosController.apoyar);
router.delete('/:id/votos', verificarToken, permitirRoles('vecino'), votosController.quitar);

module.exports = router;