import { prisma } from "../cliente";
import type {
  ActualizarFuncionario,
  CrearFuncionario,
  Cuadrilla,
  Funcionario,
  Revision,
} from "../tipos";

export async function crearFuncionario(datos: CrearFuncionario): Promise<Funcionario> {
  return prisma.funcionario.create({ data: datos });
}

export async function obtenerFuncionarioPorId(idFuncionario: number): Promise<Funcionario | null> {
  return prisma.funcionario.findUnique({ where: { idFuncionario } });
}

export async function obtenerFuncionarioPorEmail(email: string): Promise<Funcionario | null> {
  return prisma.funcionario.findUnique({ where: { email } });
}

export async function listarFuncionarios(): Promise<Funcionario[]> {
  return prisma.funcionario.findMany({ orderBy: { nombre: "asc" } });
}

export async function actualizarFuncionario(
  idFuncionario: number,
  datos: ActualizarFuncionario
): Promise<Funcionario> {
  return prisma.funcionario.update({ where: { idFuncionario }, data: datos });
}

export async function eliminarFuncionario(idFuncionario: number): Promise<Funcionario> {
  return prisma.funcionario.delete({ where: { idFuncionario } });
}

// #=====> Cuadrillas <=====#
export async function crearCuadrilla(nombre: string, sectorTrabajo?: string): Promise<Cuadrilla> {
  return prisma.cuadrilla.create({
    data: { nombre, sectorTrabajo: sectorTrabajo ?? null },
  });
}

export async function obtenerCuadrillaPorId(idCuadrilla: number): Promise<Cuadrilla | null> {
  return prisma.cuadrilla.findUnique({ where: { idCuadrilla } });
}

export async function obtenerCuadrillaPorNombre(nombre: string): Promise<Cuadrilla | null> {
  return prisma.cuadrilla.findUnique({ where: { nombre } });
}

export async function listarCuadrillas(): Promise<Cuadrilla[]> {
  return prisma.cuadrilla.findMany({ orderBy: { nombre: "asc" } });
}

export async function actualizarCuadrilla(
  idCuadrilla: number,
  datos: { nombre?: string; sectorTrabajo?: string | null }
): Promise<Cuadrilla> {
  return prisma.cuadrilla.update({ where: { idCuadrilla }, data: datos });
}

export async function eliminarCuadrilla(idCuadrilla: number): Promise<Cuadrilla> {
  return prisma.cuadrilla.delete({ where: { idCuadrilla } });
}

// Asigna un funcionario a una cuadrilla. (no falla al reasignar los mismos valores)
export async function agregarFuncionarioACuadrilla(
  idFuncionario: number,
  idCuadrilla: number
): Promise<void> {
  await prisma.puedePertenecer.upsert({
    where: { idFuncionario_idCuadrilla: { idFuncionario, idCuadrilla } },
    create: { idFuncionario, idCuadrilla },
    update: {},
  });
}

export async function quitarFuncionarioDeCuadrilla(
  idFuncionario: number,
  idCuadrilla: number
): Promise<void> {
  await prisma.puedePertenecer.deleteMany({ where: { idFuncionario, idCuadrilla } });
}

export async function listarMiembrosDeCuadrilla(idCuadrilla: number): Promise<Funcionario[]> {
  const pertenencias = await prisma.puedePertenecer.findMany({
    where: { idCuadrilla },
    include: { funcionario: true },
    orderBy: { funcionario: { nombre: "asc" } },
  });
  return pertenencias.map((p) => p.funcionario);
}

export async function listarRevisionesDeFuncionario(
  idFuncionario: number
): Promise<Revision[]> {
  return prisma.revision.findMany({
    where: { idFuncionario },
    orderBy: { fechaAtencion: "desc" },
  });
}
