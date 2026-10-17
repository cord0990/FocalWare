// Usa Prisma (src/db). Requiere que se haya ejecutado: `npm run build`.
// para que exista dist/.
const { notificaciones } = require('../../dist/db/index.js');

// GET /api/notificaciones: las notificaciones del vecino que inició sesión.
// Opcional: ?soloNoLeidas=true para traer únicamente las que no ha leído.
const listarMisNotificaciones = async (req, res, next) => {
  try {
    const idVecino = req.usuario.id;
    const soloNoLeidas = req.query.soloNoLeidas === 'true';

    const lista = await notificaciones.listarNotificacionesDeVecino(idVecino, soloNoLeidas);
    const noLeidas = await notificaciones.contarNoLeidas(idVecino);

    res.json({ ok: true, data: { notificaciones: lista, noLeidas } });
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

    const actualizadas = await notificaciones.marcarComoLeidaDeVecino(idNotificacion, req.usuario.id);

    // Si no se actualizó ninguna, no existe o es de otro vecino: se responde igual para no revelarlo.
    if (actualizadas === 0) {
      return res.status(404).json({ ok: false, error: 'Notificación no encontrada' });
    }

    res.json({ ok: true, data: { idNotificacion, leida: true } });
  } catch (error) {
    next(error);
  }
};

module.exports = { listarMisNotificaciones, marcarComoLeida };