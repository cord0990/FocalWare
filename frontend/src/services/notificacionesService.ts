// Notificaciones de cada rol. Por ahora son datos de prueba; en la Entrega 2 vendrán de la API
// y se generarán cuando cambie el estado de un reporte (RF-08).
import type { Rol } from './sesionService';

export interface Notificacion {
  id: string;
  reporteId: string;
  mensaje: string;
  estado: 'controlado' | 'aceptado' | 'rechazado';
  fechaCreacion: string;
  fechaAprobacion?: string;
  fechaControl?: string;
  fechaRechazo?: string;
}

// El vecino recibe avisos sobre sus propios reportes.
const NOTIFICACIONES_VECINO: Notificacion[] = [
  {
    id: 'notif-8f3a91b2',
    reporteId: 'REP-2026-0482',
    mensaje: '¡Tu reporte ha sido controlado!, ¡Gracias por ayudar a la comunidad!',
    estado: 'controlado',
    fechaCreacion: '12/03/2026',
    fechaAprobacion: '14/03/2026',
    fechaControl: '20/03/2026',
  },
  {
    id: 'notif-4c1e78a9',
    reporteId: 'REP-2026-0391',
    mensaje: '¡Tu reporte ha sido aceptado!',
    estado: 'aceptado',
    fechaCreacion: '01/03/2026',
    fechaAprobacion: '05/03/2026',
  },
  {
    id: 'notif-1b9d45e3',
    reporteId: 'REP-2026-0215',
    mensaje: 'Tu reporte ha sido rechazado.',
    estado: 'rechazado',
    fechaCreacion: '10/02/2026',
    fechaRechazo: '10/02/2026',
  },
];

// El funcionario no crea reportes: recibe avisos de las cuadrillas, atenciones y controles.
const NOTIFICACIONES_FUNCIONARIO: Notificacion[] = [
  {
    id: 'notif-f-4d21a7c0',
    reporteId: 'R-009',
    mensaje: 'La Cuadrilla Norte (Operaciones) registró el control del reporte, con evidencia de cierre.',
    estado: 'controlado',
    fechaCreacion: '22/09/2026',
    fechaAprobacion: '23/09/2026',
    fechaControl: '24/09/2026',
  },
  {
    id: 'notif-f-9b3e52f1',
    reporteId: 'R-002',
    mensaje: 'Se asignó la Cuadrilla Quebradas (OMZ). Atención programada para el 30/09/2026.',
    estado: 'aceptado',
    fechaCreacion: '20/09/2026',
    fechaAprobacion: '22/09/2026',
  },
  {
    id: 'notif-f-2c8a6d14',
    reporteId: 'R-001',
    mensaje: 'La Cuadrilla Cerros (DIMAO) comenzó la atención del reporte.',
    estado: 'aceptado',
    fechaCreacion: '02/09/2026',
    fechaAprobacion: '04/09/2026',
  },
  {
    id: 'notif-f-7e1f03b9',
    reporteId: 'R-006',
    mensaje: 'Se cerró el reporte con el control de la Cuadrilla Norte (Operaciones).',
    estado: 'controlado',
    fechaCreacion: '10/08/2026',
    fechaAprobacion: '12/08/2026',
    fechaControl: '20/08/2026',
  },
];

export const obtenerNotificaciones = (rol: Rol): Notificacion[] =>
  rol === 'funcionario' ? NOTIFICACIONES_FUNCIONARIO : NOTIFICACIONES_VECINO;

export const buscarNotificacion = (id: string): Notificacion | undefined =>
  [...NOTIFICACIONES_VECINO, ...NOTIFICACIONES_FUNCIONARIO].find((n) => n.id === id);
