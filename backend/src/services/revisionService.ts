// 1. Importamos la conexión centralizada desde tu carpeta db
import prisma from '../db/cliente.js'; //no me queda claro donde esta, es temporal

export const obtenerColaDeReportes = async () => {
  // 2. Usamos la variable 'prisma' importada para buscar en la tabla reporte
  const reportesPendientes = await prisma.reporte.findMany({
    where: {
      idRevision: null, // Si no tiene revisión, está "pendiente" en la cola
    },
    orderBy: {
      indiceRiesgo: 'desc', // Ordenamos del más peligroso al menos
    },
  });

  // 3. Retornamos los datos al controlador
  return reportesPendientes;
};
interface DatosNuevaRevision {
    idReporte: number;
    idFuncionario: number;
    estado: string;
    motivo?: string;
    // Añade aquí más propiedades según lo que tengas en tu esquema
}

export const procesarRevision = async (datos: DatosNuevaRevision) => {
    // 1. Regla de Negocio: Si rechaza, DEBE tener motivo
    if (datos.estado === 'Rechazado' && (!datos.motivo || datos.motivo.trim() === '')) {
        throw new Error('Si se rechaza el reporte, es obligatorio especificar un motivo.');
    }

    // 2. Transacción de Base de Datos
    // Usamos una transacción por si falla algo, no se guarde a medias
    const resultado = await prisma.$transaction(async (tx) => {
        
        // A. Creamos la nueva revisión
        const revision = await tx.revision.create({
            data: {
                estado: datos.estado,
                descripcion: datos.estado === 'Rechazado' ? datos.motivo : null,
                idFuncionario: datos.idFuncionario,
                idRevision: datos.idReporte,
                // + agregar aquí los datos extra de la imagen que enviaste (prioridad, etc)
            }
        });

        // B. Actualizamos el reporte para enlazarlo con esta revisión
        // ¡Al hacer esto, idRevision ya no será NULL y saldrá de la ruta GET /cola!
        await tx.reporte.update({
            where: { idReporte: datos.idReporte },
            data: {
                idRevision: revision.idRevision // Ajusta a la mayúscula/minúscula de tu Prisma
            }
        });

        return revision;
    });

    return resultado;
};