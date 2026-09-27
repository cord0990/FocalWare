import {
  checkmarkCircleOutline,
  shieldCheckmarkOutline,
  syncOutline,
  timeOutline,
} from 'ionicons/icons';
import type { EstadoReporte } from '../services/reportesService';

// Color e ícono de cada estado del reporte. Se usan colores distintos a los del riesgo
// para que no se confundan.
export const ESTILO_ESTADO: Record<EstadoReporte, { color: string; icono: string }> = {
  Pendiente: { color: '#8a5a00', icono: timeOutline },
  Aprobado: { color: '#1e6fb8', icono: checkmarkCircleOutline },
  'En atención': { color: '#b3470f', icono: syncOutline },
  Controlado: { color: '#2e7d32', icono: shieldCheckmarkOutline },
};
