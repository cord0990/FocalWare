const notificacionesService = require('../services/notificacionesService');

// GET /api/notificaciones: las notificaciones del vecino que inició sesión.
// Opcional: ?soloNoLeidas=true para traer únicamente las que no ha leído.
const listarMisNotificaciones = async (req, res, next) => {
  try {
    const soloNoLeidas = req.query.soloNoLeidas === 'true';

    const datos = await notificacionesService.listarDeVecino(req.usuario.id, { soloNoLeidas });

    res.json({ ok: true, data: datos });
  } catch (error) {
    next(error);
  }
};

// PUT /api/notificaciones/:id/leida: marca una notificación como leída.
// Solo funciona si la notificación pertenece al vecino que inició sesión.
const marcarComoLeida = async (req, res, next) => {
  try {
    const idNotificacion = Number(req.params.id);

    if (!Number.isInteger(idNotificacion) || idNotificacion <= 0) {
      return res.status(400).json({ ok: false, error: 'El id de la notificación no es válido' });
    }

    const resultado = await notificacionesService.marcarComoLeida({
      idNotificacion,
      idVecino: req.usuario.id,
    });

    res.json({ ok: true, data: resultado });
  } catch (error) {
    next(error);
  }
};

module.exports = { listarMisNotificaciones, marcarComoLeida };