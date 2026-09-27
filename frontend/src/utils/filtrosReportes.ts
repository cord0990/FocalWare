import type { Reporte } from '../services/reportesService';
import { formatearFecha } from './fechas';
import { normalizarTexto } from './texto';

export type CriterioOrden = 'riesgo' | 'votos' | 'fecha';

export interface FiltrosReportes {
  estado: string;
  sector: string;
  categorias: string[];
  desde: string;
  hasta: string;
  orden: CriterioOrden;
  descendente: boolean;
}

export const FILTROS_INICIALES: FiltrosReportes = {
  estado: '',
  sector: '',
  categorias: [],
  desde: '',
  hasta: '',
  orden: 'riesgo',
  descendente: true,
};

export interface FiltroActivo {
  clave: string;
  texto: string;
  // Cómo quedan los filtros si se quita solo este.
  sinEste: FiltrosReportes;
}

const NOMBRES_ORDEN: Record<CriterioOrden, string> = {
  riesgo: 'Riesgo',
  votos: 'Votos',
  fecha: 'Fecha',
};

// "Mis reportes" muestra primero los más recientes.
export const FILTROS_MIS_REPORTES: FiltrosReportes = {
  ...FILTROS_INICIALES,
  orden: 'fecha',
};

// Lista los filtros aplicados para mostrarlos como etiquetas que se pueden quitar una a una.
// `base` es el estado sin filtros de cada pantalla: el orden solo cuenta si es distinto al de base.
export const listarFiltrosActivos = (
  filtros: FiltrosReportes,
  base: FiltrosReportes = FILTROS_INICIALES,
): FiltroActivo[] => {
  const activos: FiltroActivo[] = [];

  if (filtros.estado) {
    activos.push({ clave: 'estado', texto: filtros.estado, sinEste: { ...filtros, estado: '' } });
  }
  if (filtros.sector) {
    activos.push({ clave: 'sector', texto: filtros.sector, sinEste: { ...filtros, sector: '' } });
  }
  filtros.categorias.forEach((categoria) =>
    activos.push({
      clave: `categoria-${categoria}`,
      texto: categoria,
      sinEste: { ...filtros, categorias: filtros.categorias.filter((c) => c !== categoria) },
    }),
  );
  if (filtros.desde) {
    activos.push({
      clave: 'desde',
      texto: `Desde ${formatearFecha(filtros.desde)}`,
      sinEste: { ...filtros, desde: '' },
    });
  }
  if (filtros.hasta) {
    activos.push({
      clave: 'hasta',
      texto: `Hasta ${formatearFecha(filtros.hasta)}`,
      sinEste: { ...filtros, hasta: '' },
    });
  }
  if (filtros.orden !== base.orden || filtros.descendente !== base.descendente) {
    activos.push({
      clave: 'orden',
      texto: `Orden: ${NOMBRES_ORDEN[filtros.orden]} ${filtros.descendente ? '↓' : '↑'}`,
      sinEste: { ...filtros, orden: base.orden, descendente: base.descendente },
    });
  }

  return activos;
};

const valorOrden = (reporte: Reporte, criterio: CriterioOrden): number =>
  criterio === 'fecha' ? new Date(reporte.fecha).getTime() : reporte[criterio];

export const aplicarFiltros = (reportes: Reporte[], filtros: FiltrosReportes): Reporte[] =>
  reportes
    .filter(
      (reporte) =>
        (!filtros.estado || reporte.estado === filtros.estado) &&
        (!filtros.sector || reporte.sector === filtros.sector) &&
        (filtros.categorias.length === 0 || filtros.categorias.includes(reporte.categoria)) &&
        // Las fechas vienen en formato AAAA-MM-DD, así que se pueden comparar como texto.
        (!filtros.desde || reporte.fecha >= filtros.desde) &&
        (!filtros.hasta || reporte.fecha <= filtros.hasta),
    )
    .sort((a, b) => {
      const diferencia = valorOrden(a, filtros.orden) - valorOrden(b, filtros.orden);
      return filtros.descendente ? -diferencia : diferencia;
    });

// Busca por sector, nombre o categoría, sin importar tildes ni mayúsculas.
export const buscarReportes = (reportes: Reporte[], busqueda: string): Reporte[] => {
  const termino = normalizarTexto(busqueda.trim());
  return reportes.filter((reporte) =>
    [reporte.sector, reporte.nombre, reporte.categoria].some((campo) =>
      normalizarTexto(campo).includes(termino),
    ),
  );
};
