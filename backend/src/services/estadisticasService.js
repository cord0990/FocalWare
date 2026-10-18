// Cifras para el panel de estadísticas del funcionario (RF-09) y para el
// aporte del vecino que se muestra en su menú de cuenta.
const { prisma } = require('../../dist/db/index.js');

const UN_DIA = 24 * 60 * 60 * 1000;

// Reportes creados desde el primer día de hace 11 meses (los últimos 12 meses
// contando el actual). Un reporte cuenta como resuelto cuando su revisión
// llegó a "Controlado", que es cuando la cuadrilla terminó el trabajo.
const reportesDelAnio = async () => {
  const hoy = new Date();
  const desde = new Date(hoy.getFullYear(), hoy.getMonth() - 11, 1);

  const reportes = await prisma.reporte.findMany({
    where: { fechaCreacion: { gte: desde } },
    select: {
      idReporte: true,
      fechaCreacion: true,
      sector: true,
      indiceRiesgo: true,
      revision: {
        select: {
          logs: {
            where: { estadoLog: 'Controlado' },
            select: { fechaHora: true },
            orderBy: { fechaHora: 'asc' },
            take: 1,
          },
        },
      },
    },
    orderBy: { fechaCreacion: 'asc' },
  });

  return reportes.map((reporte) => {
    const fechaControl = reporte.revision?.logs[0]?.fechaHora ?? null;
    const dias =
      fechaControl && reporte.fechaCreacion
        ? Math.max(0, Math.round((fechaControl - reporte.fechaCreacion) / UN_DIA))
        : null;

    return {
      id: reporte.idReporte,
      fecha: reporte.fechaCreacion,
      sector: reporte.sector,
      riesgo: reporte.indiceRiesgo !== null ? Number(reporte.indiceRiesgo) : null,
      fechaResolucion: fechaControl,
      diasResolucion: dias,
    };
  });
};

// Cuántos reportes creó el vecino, cuántos votos dio y cuántos apoyos
// recibieron sus reportes.
const actividadDelVecino = async (idVecino) => {
  const [reportesCreados, votosDados, apoyosRecibidos] = await Promise.all([
    prisma.reporte.count({ where: { idVecino } }),
    prisma.voto.count({ where: { idVecino } }),
    prisma.voto.count({ where: { reporte: { idVecino } } }),
  ]);

  return { reportesCreados, votosDados, apoyosRecibidos };
};

module.exports = { reportesDelAnio, actividadDelVecino };
