import { prisma } from "../cliente";
import type {
  ActualizarVecino,
  CrearVecino,
  Cuadrilla,
  Vecino,
  VecinoDetalle,
} from "../tipos";

export async function crearVecino(datos: CrearVecino): Promise<Vecino> {
  return prisma.vecino.create({ data: datos });
}

export async function obtenerVecinoPorId(idVecino: number): Promise<Vecino | null> {
  return prisma.vecino.findUnique({ where: { idVecino } });
}

export async function obtenerVecinoDetalle(idVecino: number): Promise<VecinoDetalle | null> {
  return prisma.vecino.findUnique({
    where: { idVecino },
    include: { reportes: true, notificaciones: true },
  });
}

export async function obtenerVecinoPorEmail(email: string): Promise<Vecino | null> {
  return prisma.vecino.findUnique({ where: { email } });
}

export async function listarVecinos(): Promise<Vecino[]> {
  return prisma.vecino.findMany({ orderBy: { nombre: "asc" } });
}

export async function actualizarVecino(
  idVecino: number,
  datos: ActualizarVecino
): Promise<Vecino> {
  return prisma.vecino.update({ where: { idVecino }, data: datos });
}

/**
 * Elimina al vecino.
 *
 * Ojo: la base lo impide (`ON DELETE RESTRICT`) si el vecino tiene reportes,
 * porque esos reportes son parte del historial de la cuadrilla. En ese caso
 * Prisma lanza un error P2003.
 *
 * Los votos y las notificaciones sí caen en cascada, porque cuelgan de
 * `reporte` y `revision`, no directamente del vecino.
 */
export async function eliminarVecino(idVecino: number): Promise<Vecino> {
  return prisma.vecino.delete({ where: { idVecino } });
}

// Registra un voto sin generar duplicados
export async function registrarVoto(idReporte: number, idVecino: number): Promise<void> {
  await prisma.voto.upsert({
    where: { idReporte_idVecino: { idReporte, idVecino } },
    create: { idReporte, idVecino },
    update: {},
  });
}

export async function quitarVoto(idReporte: number, idVecino: number): Promise<void> {
  await prisma.voto.deleteMany({ where: { idReporte, idVecino } });
}

export async function contarVotos(idReporte: number): Promise<number> {
  return prisma.voto.count({ where: { idReporte } });
}

export async function listarVecinosQueVotaron(idReporte: number): Promise<Vecino[]> {
  const votos = await prisma.voto.findMany({
    where: { idReporte },
    include: { vecino: true },
    orderBy: { vecino: { nombre: "asc" } },
  });
  return votos.map((voto) => voto.vecino);
}

export async function listarCuadrillasDeFuncionario(idFuncionario: number): Promise<Cuadrilla[]> {
  const pertenencias = await prisma.puedePertenecer.findMany({
    where: { idFuncionario },
    include: { cuadrilla: true },
  });
  return pertenencias.map((p) => p.cuadrilla);
}
