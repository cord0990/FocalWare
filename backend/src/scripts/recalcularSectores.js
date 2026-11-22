// Recalcula el sector canónico de los reportes existentes desde sus coordenadas.
// Uso:
//   npm run db:sectores:check   (solo muestra los cambios)
//   npm run db:sectores         (aplica los cambios)
require('dotenv').config();

const { prisma } = require('../../dist/db/index.js');
const { calcularCambioSector } = require('../dominio/cambioSector');

const MODO_CHECK = process.argv.includes('--check');
const UMBRAL_LEJOS_KM = 10;

const main = async () => {
  const reportes = await prisma.reporte.findMany({
    select: {
      idReporte: true,
      sector: true,
      direccion: true,
      latitud: true,
      longitud: true,
    },
  });

  // La auditoría incluye todos los reportes, no solo los que cambian. Así los
  // casos lejanos que ya estaban en su sector también quedan a la vista.
  const resultados = reportes.map((reporte) => ({
    reporte,
    cambio: calcularCambioSector(reporte, { umbralLejosKm: UMBRAL_LEJOS_KM }),
  }));
  const invalidos = resultados
    .filter((resultado) => !resultado.cambio)
    .map((resultado) => resultado.reporte.idReporte);
  const auditoria = resultados
    .filter((resultado) => resultado.cambio)
    .map((resultado) => resultado.cambio);

  const cambios = auditoria.filter(
    (cambio) => cambio.cambiaSector || cambio.cambiaDireccion,
  );
  const conCambioDeSector = cambios.filter((cambio) => cambio.cambiaSector);
  const conDireccion = cambios.filter((cambio) => cambio.cambiaDireccion);
  const lejos = auditoria.filter((cambio) => cambio.lejos);

  console.log(`Reportes revisados: ${reportes.length}`);
  console.log(`Reportes con coordenadas inválidas: ${invalidos.length}`);
  if (invalidos.length > 0) {
    console.log(`  IDs: ${invalidos.join(', ')}`);
  }
  console.log(`Cambian de sector: ${conCambioDeSector.length}`);
  console.log(`Reciben dirección desde el sector viejo: ${conDireccion.length}`);
  console.log(`Sin cambios: ${auditoria.length - cambios.length}`);

  if (lejos.length > 0) {
    console.log(`\nLejos del centro más cercano (> ${UMBRAL_LEJOS_KM} km):`);
    for (const cambio of lejos) {
      const estado = cambio.cambiaSector ? 'cambia' : 'queda igual';
      console.log(
        `  #${cambio.idReporte}: "${cambio.sectorViejo}" -> ${cambio.nuevoSector} ` +
          `(${cambio.distanciaKm.toFixed(1)} km, ${estado})`,
      );
    }
  }

  if (cambios.length > 0) {
    console.log('\nDetalle de cambios:');
    for (const cambio of cambios) {
      const partes = [];
      if (cambio.cambiaSector) {
        partes.push(`sector "${cambio.sectorViejo}" -> "${cambio.nuevoSector}"`);
      }
      if (cambio.cambiaDireccion) {
        partes.push(`dirección "${cambio.direccion ?? ''}"`);
      }
      console.log(`  #${cambio.idReporte}: ${partes.join('; ')}`);
    }
  }

  if (MODO_CHECK) {
    console.log('\nModo --check: no se escribió nada.');
    return;
  }

  for (const cambio of cambios) {
    await prisma.reporte.update({
      where: { idReporte: cambio.idReporte },
      data: {
        sector: cambio.nuevoSector,
        direccion: cambio.direccion,
      },
    });
  }

  console.log(`\nReportes actualizados: ${cambios.length}`);
};

main()
  .catch((error) => {
    console.error('No se pudieron recalcular los sectores:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
