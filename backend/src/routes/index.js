const { Router } = require('express');
const saludController = require('../controllers/saludController');
const climaController = require('../controllers/climaController');
const authRoutes = require('./authRoutes');
const reportesRoutes = require('./reportesRoutes');
const revisionesRoutes = require('./revisionesRoutes');
const notificacionesRoutes = require('./notificacionesRoutes');
const estadisticasRoutes = require('./estadisticasRoutes');

const router = Router();
router.get('/salud', saludController.obtenerSalud);
router.get('/clima', climaController.obtenerClimaActual);
router.use('/auth', authRoutes);
router.use('/reportes', reportesRoutes);
router.use('/revisiones', revisionesRoutes);
router.use('/notificaciones', notificacionesRoutes);
router.use('/estadisticas', estadisticasRoutes);

module.exports = router;