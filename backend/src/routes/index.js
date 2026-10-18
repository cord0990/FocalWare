const { Router } = require('express');
const saludController = require('../controllers/saludController');
const authRoutes = require('./authRoutes');
const reportesRoutes = require('./reportesRoutes');
const revisionesRoutes = require('./revisionesRoutes');
const notificacionesRoutes = require('./notificacionesRoutes');

const router = Router();
router.get('/salud', saludController.obtenerSalud);
router.use('/auth', authRoutes);
router.use('/reportes', reportesRoutes);
router.use('/revisiones', revisionesRoutes);
router.use('/notificaciones', notificacionesRoutes);

module.exports = router;