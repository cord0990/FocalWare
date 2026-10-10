import { prisma } from "../cliente";
import { Prisma } from "../generated/client";
import type {
  ActualizarRevision,
  CrearRevision,
  Revision,
  RevisionDetalle,
} from "../tipos";

export const ESTADOS_REVISION = ["pendiente", "en_proceso", "resuelto"] as const;
export type EstadoRevision = (typeof ESTADOS_REVISION)[number];

export async function crearRevision(datos: CrearRevision): Promise<Revision> {
  return prisma.revision.create({ data: datos });
}

export async function obtenerRevisionPorId(idRevision: number): Promise<Revision | null> {
  return prisma.revision.findUnique({ where: { idRevision } });
}

export async function obtenerRevisionDetalle(
  idRevision: number
): Promise<RevisionDetalle | null> {
  return prisma.revision.findUnique({
    where: { idRevision },
    include: { funcionario: true, cuadrilla: true, reportes: true },
  });
}

export async function actualizarRevision(
  idRevision: number,
  datos: ActualizarRevision
): Promise<Revision> {
  return prisma.revision.update({ where: { idRevision }, data: datos });
}

export async function cambiarEstadoRevision(
  idRevision: number,
  estado: EstadoRevision,
  comentario: string | null,
  idFuncionario: number
): Promise<Revision> {
  return prisma.$transaction(async (tx) => {
    const revision = await tx.revision.update({ where: { idRevision }, data: { estado } });

    await tx.log.create({
      data: { estadoLog: estado, comentario, idFuncionario, idRevision },
    });

    return revision;
  });
}

export async function listarRevisionesPendientes(idCuadrilla?: number): Promise<Revision[]> {
  return prisma.revision.findMany({
    where: {
      estado: { not: "resuelto" },
      ...(idCuadrilla !== undefined ? { idCuadrilla } : {}),
    },
    orderBy: { fechaAtencion: "asc" },
  });
}

export async function listarHistorialDeRevision(idRevision: number) {
  return prisma.log.findMany({
    where: { idRevision },
    include: { funcionario: true },
    orderBy: { fechaHora: "desc" },
  });
}

export async function cerrarRevisionYNotificar(
  idRevision: number,
  idVecino: number,
  mensaje: string
): Promise<Revision> {
  return prisma.$transaction(async (tx) => {
    const revision = await tx.revision.update({
      where: { idRevision },
      data: { estado: "resuelto", fechaAtencion: new Date() },
    });

    await tx.notificacion.create({
      data: {
        mensaje,
        tipo: "revision_cerrada",
        idVecino,
        idRevision,
      },
    });

    return revision;
  });
}

export async function listarReportesParaRevisar(votosMinimos: number) {
  const conteo = await prisma.voto.groupBy({
    by: ["idReporte"],
    _count: { _all: true },
    having: { idVoto: { _count: { gte: votosMinimos } } },
    orderBy: { _count: { idVoto: "desc" } },
  });

  if (conteo.length === 0) return [];

  const idsConVotos = conteo.map((fila) => fila.idReporte);

  const reportes = await prisma.reporte.findMany({
    where: { idRevision: null, idReporte: { in: idsConVotos } },
    include: { vecino: true, _count: { select: { votos: true } } },
  });

  const porId = new Map(reportes.map((reporte) => [reporte.idReporte, reporte]));
  return idsConVotos
    .map((id) => porId.get(id))
    .filter((reporte): reporte is NonNullable<typeof reporte> => reporte !== undefined);
}

export type ClienteTransaccion = Prisma.TransactionClient;
