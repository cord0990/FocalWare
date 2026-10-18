import { prisma } from "../cliente";
import type { CrearNotificacion, Notificacion } from "../tipos";

export async function crearNotificacion(datos: CrearNotificacion): Promise<Notificacion> {
  return prisma.notificacion.create({ data: datos });
}

// Además de la notificación, trae el reporte al que se refiere y los cambios de
// estado de su revisión, para mostrar la línea de tiempo en la app.
export async function listarNotificacionesDeVecino(idVecino: number, soloNoLeidas?: boolean) {
  return prisma.notificacion.findMany({
    where: {
      idVecino,
      ...(soloNoLeidas ? { leida: false } : {}),
    },
    include: {
      revision: {
        select: {
          reportes: { select: { idReporte: true, titulo: true, fechaCreacion: true } },
          logs: { select: { estadoLog: true, fechaHora: true }, orderBy: { fechaHora: "asc" } },
        },
      },
    },
    orderBy: { fecha: "desc" },
    take: 50,
  });
}

export async function contarNoLeidas(idVecino: number): Promise<number> {
  return prisma.notificacion.count({ where: { idVecino, leida: false } });
}

export async function marcarComoLeida(idNotificacion: number): Promise<Notificacion> {
  return prisma.notificacion.update({ where: { idNotificacion }, data: { leida: true } });
}

export async function marcarTodasComoLeidas(idVecino: number): Promise<number> {
  const resultado = await prisma.notificacion.updateMany({
    where: { idVecino, leida: false },
    data: { leida: true },
  });
  return resultado.count;
}

export async function eliminarNotificacion(idNotificacion: number): Promise<Notificacion> {
  return prisma.notificacion.delete({ where: { idNotificacion } });
}

export async function marcarComoLeidaDeVecino(
  idNotificacion: number,
  idVecino: number
): Promise<number> {
  const resultado = await prisma.notificacion.updateMany({
    where: { idNotificacion, idVecino },
    data: { leida: true },
  });
  return resultado.count;
}