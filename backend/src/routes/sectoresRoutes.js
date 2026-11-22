const { Router } = require('express');
const sectoresController = require('../controllers/sectoresController');

const router = Router();

router.get('/', sectoresController.listar);

module.exports = router;
