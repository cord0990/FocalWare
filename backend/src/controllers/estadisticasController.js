const estadisticasService = require('../services/estadisticasService');

// GET /api/estadisticas: reportes de los últimos 12 meses para el panel del funcionario.
const listarReportesDelAnio = async (req, res, next) => {
  try {
    const reportes = await estadisticasService.reportesDelAnio();
    res.json({ ok: true, data: { reportes } });
  } catch (error) {
    next(error);
  }
};

// GET /api/estadisticas/mi-actividad: lo que ha aportado el vecino que inició sesión.
const miActividad = async (req, res, next) => {
  try {
    const actividad = await estadisticasService.actividadDelVecino(req.usuario.id);
    res.json({ ok: true, data: actividad });
  } catch (error) {
    next(error);
  }
};

module.exports = { listarReportesDelAnio, miActividad };
