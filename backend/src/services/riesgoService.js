// Recálculo del índice de riesgo de un reporte guardado.
// La fórmula vive en `dominio/riesgo.js`; acá se traducen los campos de la base
// y se actualiza el reporte.
const { prisma } = require('../../dist/db/index.js');
const { calcularRiesgo } = require('../dominio/riesgo');
const { categoriaDeDistancia } = require('../dominio/distancias');

const climaDeReporte = (reporte) => {
  if (reporte.climaTemperatura === null || reporte.climaTemperatura === undefined) {
    return null;
  }

  return {
    temperatura: Number(reporte.climaTemperatura),
    humedad: Number(reporte.climaHumedad ?? 0),
    viento: Number(reporte.climaViento ?? 0),
    condicion: reporte.climaCondicion ?? '',
  };
};

const calcularRiesgoDeReporte = (
  reporte,
  { categoria, volumen, distancia, votos = 0 } = {},
) =>
  calcularRiesgo({
    categoria: categoria ?? reporte.categoria,
    volumen: volumen ?? reporte.tamano,
    distancia: distancia ?? categoriaDeDistancia(reporte.distanciaACasas),
    votos,
    fechaCreacion: reporte.fechaCreacion,
    clima: climaDeReporte(reporte),
  });

// Recalcula el riesgo con el total de votos actual y lo guarda.
// Devuelve el total de votos para que el servicio de votos pueda responder
// el mismo número sin volver a contar.
const recalcularRiesgoDeReporte = async (
  idReporte,
  { prismaClient = prisma, votos } = {},
) => {
  const reporte = await prismaClient.reporte.findUnique({
    where: { idReporte },
    select: {
      categoria: true,
      tamano: true,
      distanciaACasas: true,
      fechaCreacion: true,
      climaTemperatura: true,
      climaHumedad: true,
      climaViento: true,
      climaCondicion: true,
    },
  });
  if (!reporte) return 0;

  const totalVotos =
    votos ?? (await prismaClient.voto.count({ where: { idReporte } }));
  const riesgo = calcularRiesgoDeReporte(reporte, { votos: totalVotos });

  await prismaClient.reporte.update({
    where: { idReporte },
    data: {
      indiceRiesgo: riesgo.indice,
      fechaCalculoRiesgo: new Date(),
    },
  });

  return totalVotos;
};

module.exports = { calcularRiesgoDeReporte, recalcularRiesgoDeReporte };
