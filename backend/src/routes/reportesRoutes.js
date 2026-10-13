const { Router } = require('express');
const reportesController = require('../controllers/reportesController');
const { verificarToken, verificarTokenOpcional } = require('../middlewares/autenticacion');
const { permitirRoles } = require('../middlewares/roles');
const { subirFotosReporte } = require('../middlewares/subirFotos');

const router = Router();

router.get('/mios', verificarToken, reportesController.listarMios);

// Públicas: el mapa y el detalle se ven sin sesión.
// deja pasar a cualquiera, pero si viene token el service muestra los datos
// del vecino solo al dueño o a un funcionario.
router.get('/', verificarTokenOpcional, reportesController.listar);
router.get('/:id', verificarTokenOpcional, reportesController.obtenerDetalle);

router.post(
  '/',
  verificarToken,
  permitirRoles('vecino'),
  subirFotosReporte,
  reportesController.crear,
);
router.put(
  '/:id',
  verificarToken,
  permitirRoles('vecino'),
  subirFotosReporte,
  reportesController.modificar,
);
router.delete('/:id', verificarToken, permitirRoles('vecino'), reportesController.eliminar);

module.exports = router;
