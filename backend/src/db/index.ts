import { prisma } from "./cliente";

export { prisma };
export * from "./tipos";
export * as vecinos from "./repositorios/vecinos";
export * as funcionarios from "./repositorios/funcionarios";
export * as revisiones from "./repositorios/revisiones";
export * as reportes from "./repositorios/reportes";
export * as notificaciones from "./repositorios/notificaciones";
export * as controles from "./repositorios/controles";

export async function verificarConexion(): Promise<Date> {
  const resultado = await prisma.$queryRaw<Array<{ hora: Date }>>`SELECT NOW() AS hora`;
  return resultado[0]?.hora ?? new Date();
}
