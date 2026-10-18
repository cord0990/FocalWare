// Estadísticas para el Funcionario (RF-09) y exportación a CSV (RNF-12).
// Los reportes de los últimos 12 meses vienen de la API y las cifras se calculan acá.
import { pedir } from './api';

export interface ReporteHistorico {
  id: string;
  fecha: string;
  sector: string;
  riesgo: number | null;
  fechaResolucion?: string;
  diasResolucion?: number;
}

export interface MesEstadistica {
  valor: string;
  etiqueta: string;
  corta: string;
}

// Así llega cada reporte desde GET /api/estadisticas.
interface ReporteHistoricoApi {
  id: number;
  fecha: string;
  sector: string;
  riesgo: number | null;
  fechaResolucion: string | null;
  diasResolucion: number | null;
}

const NOMBRES_MES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const dosDigitos = (numero: number) => String(numero).padStart(2, '0');

// "2026-09-29T11:00:00.000Z" -> "2026-09-29", con la fecha local.
const aTexto = (fecha: string) => {
  const d = new Date(fecha);
  return `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}`;
};

// Los últimos 12 meses, del más antiguo al actual.
export const ultimosMeses = (): MesEstadistica[] => {
  const hoy = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - 11 + i, 1);
    const nombre = NOMBRES_MES[fecha.getMonth()];
    return {
      valor: `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}`,
      etiqueta: `${nombre} ${fecha.getFullYear()}`,
      corta: nombre.slice(0, 3),
    };
  });
};

// Reportes de los últimos 12 meses. Un reporte está resuelto cuando quedó Controlado.
export const obtenerReportesDelAnio = async (): Promise<ReporteHistorico[]> => {
  const datos = await pedir<{ reportes: ReporteHistoricoApi[] }>('/estadisticas');
  return datos.reportes.map((reporte) => ({
    id: String(reporte.id),
    fecha: aTexto(reporte.fecha),
    sector: reporte.sector,
    riesgo: reporte.riesgo,
    ...(reporte.fechaResolucion && reporte.diasResolucion !== null
      ? { fechaResolucion: aTexto(reporte.fechaResolucion), diasResolucion: reporte.diasResolucion }
      : {}),
  }));
};

const promedio = (valores: number[]) =>
  valores.length ? Math.round((valores.reduce((a, b) => a + b, 0) / valores.length) * 10) / 10 : null;

// Cifras de un mes (AAAA-MM): reportes recibidos, resueltos y tiempo promedio de resolución.
export const cifrasDelMes = (historial: ReporteHistorico[], mes: string) => {
  const recibidos = historial.filter((r) => r.fecha.startsWith(mes));
  const resueltos = historial.filter((r) => r.fechaResolucion?.startsWith(mes));
  return {
    total: recibidos.length,
    resueltos: resueltos.length,
    promedioDias: promedio(resueltos.map((r) => r.diasResolucion ?? 0)),
  };
};

// Tiempo promedio de resolución (días) por sector, de mayor a menor.
// Solo aparecen los sectores que tienen al menos un reporte resuelto.
export const promedioPorSector = (historial: ReporteHistorico[]) => {
  const sectores = [...new Set(historial.map((r) => r.sector))];
  return sectores
    .map((sector) => {
      const resueltos = historial.filter((r) => r.sector === sector && r.diasResolucion !== undefined);
      return {
        sector,
        dias: promedio(resueltos.map((r) => r.diasResolucion ?? 0)) ?? 0,
        cantidad: resueltos.length,
      };
    })
    .filter((dato) => dato.cantidad > 0)
    .sort((a, b) => b.dias - a.dias);
};

// Reportes recibidos y resueltos en cada uno de los últimos 12 meses.
export const evolucionMensual = (historial: ReporteHistorico[]) =>
  ultimosMeses().map((mes) => ({
    ...mes,
    recibidos: historial.filter((r) => r.fecha.startsWith(mes.valor)).length,
    resueltos: historial.filter((r) => r.fechaResolucion?.startsWith(mes.valor)).length,
  }));

// CSV separado por punto y coma, que Excel en español abre directamente en columnas.
export const generarCsv = (historial: ReporteHistorico[]) => {
  const encabezado = ['ID', 'Fecha', 'Sector', 'Riesgo (%)', 'Fecha de resolución', 'Días de resolución'];
  const filas = historial.map((r) => [
    r.id,
    r.fecha,
    // El sector lo escribe el vecino: un ";" partiría la fila en dos columnas.
    r.sector.replace(/;/g, ','),
    r.riesgo !== null ? String(r.riesgo) : 'En cálculo',
    r.fechaResolucion ?? 'Sin resolver',
    r.diasResolucion !== undefined ? String(r.diasResolucion) : '',
  ]);
  return [encabezado, ...filas].map((fila) => fila.join(';')).join('\r\n');
};
