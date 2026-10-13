const { Router } = require('express');
const saludController = require('../controllers/saludController');
const authRoutes = require('./authRoutes');
const { getColaReportes } = require('../controllers/revisionController.js');
const { postRevisionReporte } = require('../controllers/revisionController.js');
const { permitirRoles } = require('../middlewares/roles.js');
const { verificarToken } = require('../middlewares/autenticacion.js');

const router = Router();

router.get('/salud', saludController.obtenerSalud);
router.use('/auth', authRoutes);

// GET /api/revisiones/cola
router.get('/revisiones/cola', getColaReportes);
// POST /api/reportes/:id/revision
router.post(
    '/reportes/:id/revision', 
    //verificarToken,// <-- Idealmente primero validas quién es (para tener req.usuario)
    //permitirRoles('funcionario'), // Luego validas si ese usuario es funcionario <- no puedo validar sin token
    postRevisionReporte           // Finalmente ejecutas la lógica
);

module.exports = router;