// Migra a cifrado los datos de contacto que todavía están en texto plano.
// Es idempotente: los valores que ya tienen el prefijo enc:v1: se omiten.
//
// Uso:
//   node src/scripts/encriptarDatos.js
//   node src/scripts/encriptarDatos.js --check   (falla si queda texto plano)
const { prisma } = require('../../dist/db/index.js');
const { encriptar, desencriptar, esEncriptado } = require('../services/cryptoService');

const soloVerificar = process.argv.includes('--check');

const migrar = async ({ nombre, filas, campo, actualizar }) => {
  const valores = filas.filter((fila) => fila[campo] !== null && fila[campo] !== '');
  const pendientes = valores.filter((fila) => !esEncriptado(fila[campo]));

  // Comprueba que los valores ya cifrados se puedan leer con la clave actual.
  for (const fila of valores.filter((f) => esEncriptado(f[campo]))) {
    try {
      desencriptar(fila[campo]);
    } catch {
      throw new Error(
        `${nombre}: hay valores cifrados que no se pueden leer con DATA_ENCRYPTION_KEY`,
      );
    }
  }

  if (soloVerificar) {
    if (pendientes.length > 0) {
      console.error(`${nombre}: ${pendientes.length} valores sin cifrar.`);
    }
    return pendientes.length;
  }

  for (const fila of pendientes) {
    await actualizar(fila, encriptar(fila[campo]));
  }

  if (pendientes.length > 0) {
    console.log(`${nombre}: ${pendientes.length} valores cifrados.`);
  } else {
    console.log(`${nombre}: sin cambios.`);
  }

  return pendientes.length;
};

const main = async () => {
  const vecinos = await prisma.vecino.findMany({
    select: { idVecino: true, telefono: true },
  });
  const funcionarios = await prisma.funcionario.findMany({
    select: { idFuncionario: true, telefono: true },
  });
  const reportes = await prisma.reporte.findMany({
    select: { idReporte: true, direccion: true },
  });

  const pendientes = [
    await migrar({
      nombre: 'vecinos',
      filas: vecinos,
      campo: 'telefono',
      actualizar: (fila, telefono) =>
        prisma.vecino.update({ where: { idVecino: fila.idVecino }, data: { telefono } }),
    }),
    await migrar({
      nombre: 'funcionarios',
      filas: funcionarios,
      campo: 'telefono',
      actualizar: (fila, telefono) =>
        prisma.funcionario.update({
          where: { idFuncionario: fila.idFuncionario },
          data: { telefono },
        }),
    }),
    await migrar({
      nombre: 'reportes',
      filas: reportes,
      campo: 'direccion',
      actualizar: (fila, direccion) =>
        prisma.reporte.update({ where: { idReporte: fila.idReporte }, data: { direccion } }),
    }),
  ];

  const total = pendientes.reduce((suma, cantidad) => suma + cantidad, 0);

  if (soloVerificar) {
    if (total > 0) {
      console.error(`Hay ${total} valores sensibles sin cifrar. Ejecuta: npm run db:encrypt`);
      process.exitCode = 1;
    } else {
      console.log('Todos los datos sensibles están cifrados.');
    }
  }
};

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
