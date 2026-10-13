const { Router } = require('express');
const saludController = require('../controllers/saludController');
const authRoutes = require('./authRoutes');

const router = Router();

router.get('/salud', saludController.obtenerSalud);
router.use('/auth', authRoutes);

module.exports = router;