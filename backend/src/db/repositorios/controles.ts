import { prisma } from "../cliente";
import type { ControlDetalle, CrearControl, ReporteControl } from "../tipos";

export async function crearControl(datos: CrearControl): Promise<ReporteControl> {
  return prisma.reporteControl.create({ data: datos });
}

export async function obtenerControlPorId(idReporteControl: number): Promise<ReporteControl | null> {
  return prisma.reporteControl.findUnique({ where: { idReporteControl } });
}

// Incluye funcionario, revisión e imágenes del control.
export async function obtenerControlDetalle(
  idReporteControl: number
): Promise<ControlDetalle | null> {
  return prisma.reporteControl.findUnique({
    where: { idReporteControl },
    include: { funcionario: true, revision: true, imagenes: true },
  });
}

export async function actualizarControl(
  idReporteControl: number,
  datos: { descripcion?: string | null; idRevision?: number | null }
): Promise<ReporteControl> {
  return prisma.reporteControl.update({ where: { idReporteControl }, data: datos });
}

export async function eliminarControl(idReporteControl: number): Promise<ReporteControl> {
  return prisma.reporteControl.delete({ where: { idReporteControl } });
}

// Del más reciente al más antiguo.
export async function listarControlesDeRevision(idRevision: number): Promise<ReporteControl[]> {
  return prisma.reporteControl.findMany({
    where: { idRevision },
    orderBy: { fechaControl: "desc" },
  });
}

export async function listarControlesDeFuncionario(
  idFuncionario: number
): Promise<ReporteControl[]> {
  return prisma.reporteControl.findMany({
    where: { idFuncionario },
    orderBy: { fechaControl: "desc" },
  });
}

export async function agregarImagenAControl(
  idReporteControl: number,
  rutaDirectorio: string
) {
  return prisma.imagenControl.create({ data: { rutaDirectorio, idReporteControl } });
}

export async function eliminarImagenDeControl(idImagenControl: number) {
  return prisma.imagenControl.delete({ where: { idImagenControl } });
}
