import { Prisma } from "./generated/client";

export type Vecino = Prisma.VecinoGetPayload<{}>;
export type Funcionario = Prisma.FuncionarioGetPayload<{}>;
export type Cuadrilla = Prisma.CuadrillaGetPayload<{}>;
export type Revision = Prisma.RevisionGetPayload<{}>;
export type Reporte = Prisma.ReporteGetPayload<{}>;
export type Voto = Prisma.VotoGetPayload<{}>;
export type Log = Prisma.LogGetPayload<{}>;
export type Notificacion = Prisma.NotificacionGetPayload<{}>;
export type ReporteControl = Prisma.ReporteControlGetPayload<{}>;

// Vecino con sus reportes y notificaciones anidados.
export type VecinoDetalle = Prisma.VecinoGetPayload<{
  include: { reportes: true; notificaciones: true };
}>;

// Reporte con vecino, revisión, imágenes y cantidad de votos.
export type ReporteDetalle = Prisma.ReporteGetPayload<{
  include: { vecino: true; revision: true; imagenes: true; _count: { select: { votos: true } } };
}>;

// Revisión con las relaciones que se piden seguido.
export type RevisionDetalle = Prisma.RevisionGetPayload<{
  include: { funcionario: true; cuadrilla: true; reportes: true };
}>;

// Control de una revisión con sus imágenes.
export type ControlDetalle = Prisma.ReporteControlGetPayload<{
  include: { funcionario: true; revision: true; imagenes: true };
}>;

export type CrearVecino = Prisma.VecinoCreateInput;
export type ActualizarVecino = Prisma.VecinoUpdateInput;
export type CrearFuncionario = Prisma.FuncionarioCreateInput;
export type ActualizarFuncionario = Prisma.FuncionarioUpdateInput;
export type CrearCuadrilla = Prisma.CuadrillaCreateInput;
export type ActualizarCuadrilla = Prisma.CuadrillaUpdateInput;
export type CrearRevision = Prisma.RevisionCreateInput;
export type ActualizarRevision = Prisma.RevisionUpdateInput;
export type CrearReporte = Prisma.ReporteCreateInput;
export type ActualizarReporte = Prisma.ReporteUpdateInput;
export type CrearNotificacion = Prisma.NotificacionCreateInput;
export type CrearControl = Prisma.ReporteControlCreateInput;

// Filtros de búsqueda de reportes. Todos son opcionales y se combinan.
export interface FiltrosReporte {
  idVecino?: number;
  idRevision?: number;
  categoria?: string;
  sector?: string;
  votosMinimos?: number;
  desde?: Date;
  hasta?: Date;
}

// Paginación y orden para listados.
export interface OpcionesListado {
  limite?: number;
  saltar?: number;
  ordenarPor?: "fechaCreacion" | "indiceRiesgo";
  orden?: "asc" | "desc";
}
