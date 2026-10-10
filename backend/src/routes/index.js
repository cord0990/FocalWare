const { Router } = require('express');
const saludController = require('../controllers/saludController');

const router = Router();

router.get('/salud', saludController.obtenerSalud);

module.exports = router;
