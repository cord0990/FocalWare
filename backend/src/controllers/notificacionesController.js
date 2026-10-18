// Usa Prisma (src/db). Requiere que se haya ejecutado: `npm run build`.
// para que exista dist/.
const { notificaciones } = require('../../dist/db/index.js');

// Deja la notificación con lo que necesita la app: el reporte al que se
// refiere y las fechas de cada cambio de estado (para la línea de tiempo).
const aNotificacion = (notificacion) => {
  const reporte = notificacion.revision?.reportes[0];
  const logs = notificacion.revision?.logs ?? [];
  const fechaDe = (estado) => logs.find((log) => log.estadoLog === estado)?.fechaHora ?? null;

  return {
    id: notificacion.idNotificacion,
    mensaje: notificacion.mensaje,
    estado: notificacion.tipo,
    leida: notificacion.leida,
    fecha: notificacion.fecha,
    reporte: reporte ? { id: reporte.idReporte, titulo: reporte.titulo } : null,
    fechas: {
      creacion: reporte?.fechaCreacion ?? null,
      aprobacion: fechaDe('Aprobado'),
      rechazo: fechaDe('Rechazado'),
      control: fechaDe('Controlado'),
    },
  };
};

// GET /api/notificaciones: las notificaciones del vecino que inició sesión.
// Opcional: ?soloNoLeidas=true para traer únicamente las que no ha leído.
const listarMisNotificaciones = async (req, res, next) => {
  try {
    const idVecino = req.usuario.id;
    const soloNoLeidas = req.query.soloNoLeidas === 'true';

    const lista = await notificaciones.listarNotificacionesDeVecino(idVecino, soloNoLeidas);
    const noLeidas = await notificaciones.contarNoLeidas(idVecino);

    res.json({ ok: true, data: { notificaciones: lista.map(aNotificacion), noLeidas } });
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