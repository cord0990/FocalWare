// Lógica de notificaciones del vecino: listar y marcar como leídas.
// Usa Prisma (src/db). Requiere que se haya ejecutado: `npm run build`
// para que exista dist/.
const { notificaciones } = require('../../dist/db/index.js');
const { crearErrorHTTP } = require('../middlewares/manejoErrores');

// Traduce de la base a lo que recibe el frontend.
const aNotificacion = (notificacion) => ({
  idNotificacion: notificacion.idNotificacion,
  mensaje: notificacion.mensaje,
  tipo: notificacion.tipo,
  fecha: notificacion.fecha,
  leida: notificacion.leida,
  idVecino: notificacion.idVecino,
  idRevision: notificacion.idRevision,
});

// Las notificaciones del vecino (las 50 más recientes) y cuántas no ha leído.
// Con soloNoLeidas se traen únicamente las que todavía no leyó.
const listarDeVecino = async (idVecino, { soloNoLeidas = false } = {}) => {
  const lista = await notificaciones.listarNotificacionesDeVecino(idVecino, soloNoLeidas);
  const noLeidas = await notificaciones.contarNoLeidas(idVecino);

  return { notificaciones: lista.map(aNotificacion), noLeidas };
};

// Marca una notificación como leída, solo si es del vecino indicado.
// Si no existe o es de otro vecino se responde lo mismo (404), para no revelar
// que existe.
const marcarComoLeida = async ({ idNotificacion, idVecino }) => {
  const actualizadas = await notificaciones.marcarComoLeidaDeVecino(idNotificacion, idVecino);

  if (actualizadas === 0) {
    throw crearErrorHTTP(404, 'Notificación no encontrada');
  }

  return { idNotificacion, leida: true };
};

module.exports = { listarDeVecino, marcarComoLeida };