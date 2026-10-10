const saludService = require('../services/saludService');

// GET /api/salud: indica si la API y la base de datos están funcionando.
const obtenerSalud = async (req, res, next) => {
  try {
    const hora = await saludService.revisarBaseDeDatos();
    res.json({ ok: true, data: { api: 'funcionando', baseDeDatos: 'conectada', hora } });
  } catch (error) {
    next(error);
  }
};

module.exports = { obtenerSalud };
