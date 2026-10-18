// Notificaciones del vecino. Vienen de la API y se crean cuando un funcionario
// cambia el estado de uno de sus reportes (RF-08).
import { pedir } from './api';

export interface Notificacion {
  id: string;
  reporteId: string;
  tituloReporte: string;
  mensaje: string;
  estado: string;
  leida: boolean;
  fechaCreacion: string;
  fechaAprobacion?: string;
  fechaRechazo?: string;
  fechaControl?: string;
}

// Así llega cada notificación desde GET /api/notificaciones.
interface NotificacionApi {
  id: number;
  mensaje: string;
  estado: string | null;
  leida: boolean;
  reporte: { id: number; titulo: string } | null;
  fechas: {
    creacion: string | null;
    aprobacion: string | null;
    rechazo: string | null;
    control: string | null;
  };
}

// Se avisa a la app cuando cambia algo, para que el contador del menú se actualice.
export const EVENTO_NOTIFICACIONES = 'focalware-notificaciones-cambiaron';

// "2026-09-29T11:00:00.000Z" -> "29/09/2026"
const aFecha = (fecha: string | null): string => {
  if (!fecha) return '';
  const d = new Date(fecha);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${d.getFullYear()}`;
};

const aNotificacion = (n: NotificacionApi): Notificacion => ({
  id: String(n.id),
  reporteId: n.reporte ? String(n.reporte.id) : '',
  tituloReporte: n.reporte?.titulo ?? '',
  mensaje: n.mensaje,
  estado: n.estado ?? '',
  leida: n.leida,
  fechaCreacion: aFecha(n.fechas.creacion),
  fechaAprobacion: aFecha(n.fechas.aprobacion) || undefined,
  fechaRechazo: aFecha(n.fechas.rechazo) || undefined,
  fechaControl: aFecha(n.fechas.control) || undefined,
});

export const obtenerNotificaciones = async () => {
  const datos = await pedir<{ notificaciones: NotificacionApi[]; noLeidas: number }>(
    '/notificaciones',
  );
  return { notificaciones: datos.notificaciones.map(aNotificacion), noLeidas: datos.noLeidas };
};

export const marcarNotificacionLeida = async (id: string) => {
  await pedir(`/notificaciones/${id}/leida`, { metodo: 'PUT' });
  window.dispatchEvent(new Event(EVENTO_NOTIFICACIONES));
};
