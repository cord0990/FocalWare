const { Router } = require('express');
const saludController = require('../controllers/saludController');
const authRoutes = require('./authRoutes');
const reportesRoutes = require('./reportesRoutes');
const revisionesRoutes = require('./revisionesRoutes');

const router = Router();
router.get('/salud', saludController.obtenerSalud);
router.use('/auth', authRoutes);
router.use('/reportes', reportesRoutes);
router.use('/revisiones', revisionesRoutes);

module.exports = router;