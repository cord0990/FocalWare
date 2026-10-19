const climaService = require('../services/climaService');

// GET /api/clima: clima actual de Valparaíso, o de un punto si llegan
// ?latitud= y ?longitud=. Lo usa el formulario de crear reporte.
const obtenerClimaActual = async (req, res, next) => {
  try {
    const { latitud, longitud } = req.query;
    let punto = climaService.VALPARAISO;

    if (latitud !== undefined || longitud !== undefined) {
      const lat = Number(latitud);
      const lng = Number(longitud);
      if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
        return res.status(400).json({ ok: false, error: 'La latitud o la longitud no son válidas' });
      }
      punto = { latitud: lat, longitud: lng };
    }

    const clima = await climaService.obtenerClima(punto.latitud, punto.longitud);
    if (!clima) {
      return res.status(503).json({ ok: false, error: 'El servicio del clima no está disponible ahora' });
    }

    res.json({ ok: true, data: { clima } });
  } catch (error) {
    next(error);
  }
};

module.exports = { obtenerClimaActual };
