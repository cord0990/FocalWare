import { prisma } from "../cliente";
import { Prisma } from "../generated/client";
import type {
  ActualizarReporte,
  CrearReporte,
  FiltrosReporte,
  OpcionesListado,
  Reporte,
  ReporteDetalle,
  Vecino,
} from "../tipos";

const ORDENES = {
  fechaCreacion: { fechaCreacion: "asc" },
  indiceRiesgo: { indiceRiesgo: "asc" },
} as const;

type ClaveOrden = keyof typeof ORDENES;

/** Traduce los filtros de la API a un where de Prisma. */
function construirWhere(filtros: FiltrosReporte = {}): Prisma.ReporteWhereInput {
  return {
    ...(filtros.idVecino !== undefined ? { idVecino: filtros.idVecino } : {}),
    ...(filtros.idRevision !== undefined ? { idRevision: filtros.idRevision } : {}),
    ...(filtros.categoria !== undefined ? { categoria: filtros.categoria } : {}),
    ...(filtros.sector !== undefined ? { sector: filtros.sector } : {}),
    ...(filtros.desde !== undefined || filtros.hasta !== undefined
      ? {
        fechaCreacion: {
          ...(filtros.desde !== undefined ? { gte: filtros.desde } : {}),
          ...(filtros.hasta !== undefined ? { lte: filtros.hasta } : {}),
        },
      }
      : {}),
  };
}

export async function crearReporte(datos: CrearReporte): Promise<Reporte> {
  return prisma.reporte.create({ data: datos });
}

export async function obtenerReportePorId(idReporte: number): Promise<Reporte | null> {
  return prisma.reporte.findUnique({ where: { idReporte } });
}

/** Incluye vecino, revisión, imágenes y la cantidad de votos. */
export async function obtenerReporteDetalle(idReporte: number): Promise<ReporteDetalle | null> {
  return prisma.reporte.findUnique({
    where: { idReporte },
    include: {
      vecino: true,
      revision: true,
      imagenes: true,
      _count: { select: { votos: true } },
    },
  });
}

export async function actualizarReporte(
  idReporte: number,
  datos: ActualizarReporte
): Promise<Reporte> {
  return prisma.reporte.update({ where: { idReporte }, data: datos });
}

/** Elimina el reporte. Imágenes y votos se van en cascada. */
export async function eliminarReporte(idReporte: number): Promise<Reporte> {
  return prisma.reporte.delete({ where: { idReporte } });
}

/**
 * Lista reportes con filtros, paginación y orden.
 *
 * Si se pasa `votosMinimos`, primero cuenta los votos por reporte en la base
 * y después trae solo los que califican.
 */
export async function listarReportes(
  filtros: FiltrosReporte = {},
  opciones: OpcionesListado = {}
): Promise<ReporteDetalle[]> {
  const limite = Math.min(opciones.limite ?? 20, 100);
  const saltar = opciones.saltar ?? 0;
  const claveOrden = (opciones.ordenarPor ?? "fechaCreacion") as ClaveOrden;
  const ordenBase = ORDENES[claveOrden];
  const conSentido = opciones.orden === "asc" ? ordenBase : { [claveOrden]: "desc" as const };

  let where = construirWhere(filtros);

  if (filtros.votosMinimos !== undefined) {
    const conteo = await prisma.voto.groupBy({
      by: ["idReporte"],
      _count: { _all: true },
      having: { idVoto: { _count: { gte: filtros.votosMinimos } } },
    });

    const ids = conteo.map((fila) => fila.idReporte);
    if (ids.length === 0) return [];
    where = { ...where, idReporte: { in: ids } };
  }

  return prisma.reporte.findMany({
    where,
    include: {
      vecino: true,
      revision: true,
      imagenes: true,
      _count: { select: { votos: true } },
    },
    orderBy: conSentido,
    take: limite,
    skip: saltar,
  });
}

/** Total de reportes que matchean los filtros, para la paginación del frontend. */
export async function contarReportes(filtros: FiltrosReporte = {}): Promise<number> {
  const where = construirWhere(filtros);
  return prisma.reporte.count({ where });
}

/** Reportes creados por un vecino. */
export async function listarReportesDeVecino(idVecino: number): Promise<Reporte[]> {
  return prisma.reporte.findMany({
    where: { idVecino },
    orderBy: { fechaCreacion: "desc" },
  });
}

// Reportes que el vecino todavía no votó, del más votado al menos.
export async function listarReportesPendientesDeVoto(idVecino: number): Promise<Reporte[]> {
  return prisma.$queryRaw<Reporte[]>`
    SELECT r.*
    FROM reporte r
    LEFT JOIN votos v2 ON v2.idreporte = r.idreporte
    WHERE NOT EXISTS (
      SELECT 1 FROM votos v
      WHERE v.idreporte = r.idreporte AND v.idvecino = ${idVecino}
    )
    GROUP BY r.idreporte
    ORDER BY count(v2.idvoto) DESC, r.idreporte ASC
    LIMIT 20
  `;
}

/** Asigna un reporte a una revisión. */
export async function asignarReporteARevision(
  idReporte: number,
  idRevision: number
): Promise<Reporte> {
  return prisma.reporte.update({ where: { idReporte }, data: { idRevision } });
}

/** Saca el reporte de la revisión a la que estaba asignado. */
export async function desasignarReporte(idReporte: number): Promise<Reporte> {
  return prisma.reporte.update({ where: { idReporte }, data: { idRevision: null } });
}

/** El vecino que creó un reporte. */
export async function listarVecinosQueReportaron(idReporte: number): Promise<Vecino[]> {
  const reporte = await prisma.reporte.findUnique({
    where: { idReporte },
    include: { vecino: true },
  });
  return reporte ? [reporte.vecino] : [];
}

// --- Imágenes ---

/** Agrega una imagen al reporte. La ruta es relativa a /uploads. */
export async function agregarImagenAReporte(
  idReporte: number,
  rutaDirectorio: string,
  orden?: number
) {
  return prisma.imagenReporte.create({
    data: { rutaDirectorio, idReporte, orden: orden ?? 1 },
  });
}

export async function eliminarImagenDeReporte(idImagenReporte: number) {
  return prisma.imagenReporte.delete({ where: { idImagenReporte } });
}
