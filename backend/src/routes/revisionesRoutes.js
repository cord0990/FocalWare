const { Router } = require('express');
const revisionController = require('../controllers/revisionController');
const { verificarToken } = require('../middlewares/autenticacion');
const { permitirRoles } = require('../middlewares/roles');
const { perteneceACuadrilla } = require('../middlewares/cuadrilla');
const { subirFotosControl } = require('../middlewares/subirFotos');

const router = Router();

router.get('/cola', verificarToken, permitirRoles('funcionario'), revisionController.getColaReportes);

// Cierre del trabajo de una revisión (RF-16). Solo el funcionario de la cuadrilla
// puede controlarla, y solo con al menos una foto de evidencia.
router.put(
  '/:id',
  verificarToken,
  permitirRoles('funcionario'),
  perteneceACuadrilla,
  subirFotosControl,
  revisionController.putRevisionControl,
);

// Controles ya registrados de una revisión, con sus fotos de evidencia.
// Usa las mismas reglas que el cierre: solo el funcionario de la cuadrilla.
router.get(
  '/:id/controles',
  verificarToken,
  permitirRoles('funcionario'),
  perteneceACuadrilla,
  revisionController.getControlesDeRevision,
);

module.exports = router;