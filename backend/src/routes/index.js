const { Router } = require('express');
const saludController = require('../controllers/saludController');
const authRoutes = require('./authRoutes');
const reportesRoutes = require('./reportesRoutes');

const router = Router();

router.get('/salud', saludController.obtenerSalud);
router.use('/auth', authRoutes);
router.use('/reportes', reportesRoutes);

module.exports = router;