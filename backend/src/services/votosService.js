// Lógica de los votos de apoyo de los vecinos.
const { prisma } = require('../../dist/db/index.js');
const { ESTADOS } = require('../dominio/opcionesReporte');
const { recalcularRiesgoDeReporte } = require('./riesgoService');

// Un vecino apoya un reporte.
//
// Reglas:
//   - no se puede apoyar el reporte propio
//   - un vecino apoya una sola vez por reporte 
//   - los reportes rechazados no pueden recibir votos
const registrar = async ({ idReporte, idVecino }) => {
  const reporte = await obtenerReporte(idReporte);

  if (reporte.idVecino === idVecino) {
    const error = new Error('No puedes apoyar tu propio reporte');
    error.estado = 400;
    throw error;
  }

  const estado = reporte.revision?.estado;
  if (estado === ESTADOS.RECHAZADO) {
    const error = new Error('Este reporte fue rechazado y no admite apoyos');
    error.estado = 400;
    throw error;
  }

  const votoExistente = await prisma.voto.findUnique({
    where: { idReporte_idVecino: { idReporte, idVecino } },
    select: { idVoto: true },
  });

  if (votoExistente) {
    const error = new Error('Ya apoyaste este reporte');
    error.estado = 409;
    throw error;
  }

  const votos = await prisma.$transaction(async (tx) => {
    await tx.voto.create({ data: { idReporte, idVecino } });
    return recalcularRiesgoDeReporte(idReporte, { prismaClient: tx });
  });

  return { votos };
};

// El vecino saca su apoyo. Si no lo había puesto, no es un error: la pantalla
// puede haber quedado desfasada y el resultado final es el mismo.
const quitar = async ({ idReporte, idVecino }) => {
  await obtenerReporte(idReporte);

  const votos = await prisma.$transaction(async (tx) => {
    await tx.voto.deleteMany({ where: { idReporte, idVecino } });
    return recalcularRiesgoDeReporte(idReporte, { prismaClient: tx });
  });

  return { votos };
};

// Total de apoyos de un reporte.
const contar = async (idReporte) => prisma.voto.count({ where: { idReporte } });

// Cuáles vecinos apoyaron un reporte. La API no lo expone: mostrar quién votó
// iría en contra del anonimato (EP 2.1, 4.2).
const listarVecinosQueApoyaron = async (idReporte) => {
  const votos = await prisma.voto.findMany({
    where: { idReporte },
    include: { vecino: true },
    orderBy: { vecino: { nombre: 'asc' } },
  });

  return votos.map((voto) => voto.vecino);
};

const obtenerReporte = async (idReporte) => {
  const reporte = await prisma.reporte.findUnique({
    where: { idReporte },
    select: { idReporte: true, idVecino: true, revision: { select: { estado: true } } },
  });

  if (!reporte) {
    const error = new Error('El reporte no existe');
    error.estado = 404;
    throw error;
  }

  return reporte;
};

module.exports = { registrar, quitar, contar, listarVecinosQueApoyaron };
