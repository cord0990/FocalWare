import { registrarReportesEnviados } from './reportesService';

// Reportes creados sin conexión (RF-02). Se guardan en el navegador hasta que se envían.
// En la Entrega 2 el envío llamará a la API REST.

export interface ReportePendiente {
  id: string;
  nombre: string;
  sector: string;
  categoria: string;
  latitud: number;
  longitud: number;
  guardadoEn: string;
}

const CLAVE = 'focalware-reportes-pendientes';
export const EVENTO_PENDIENTES = 'focalware-pendientes-cambiaron';

const PENDIENTES_PRUEBA: ReportePendiente[] = [
  {
    id: 'P-001',
    nombre: 'Basura acumulada en escalera',
    sector: 'Cerro Cordillera',
    categoria: 'Microbasural',
    latitud: -33.0425,
    longitud: -71.6318,
    guardadoEn: '2026-09-26T18:42:00',
  },
  {
    id: 'P-002',
    nombre: 'Pastizal seco en sitio eriazo',
    sector: 'Cerro Cordillera',
    categoria: 'Vegetación seca',
    latitud: -33.0409,
    longitud: -71.6347,
    guardadoEn: '2026-09-26T19:05:00',
  },
];

// Copia en memoria, por si el navegador no permite usar el almacenamiento local.
let enMemoria: ReportePendiente[] | null = null;

const leer = (): ReportePendiente[] => {
  if (enMemoria) return enMemoria;
  try {
    const guardado = localStorage.getItem(CLAVE);
    enMemoria = guardado ? JSON.parse(guardado) : PENDIENTES_PRUEBA;
  } catch {
    enMemoria = PENDIENTES_PRUEBA;
  }
  return enMemoria ?? [];
};

const guardar = (pendientes: ReportePendiente[]) => {
  enMemoria = pendientes;
  try {
    localStorage.setItem(CLAVE, JSON.stringify(pendientes));
  } catch {
    // Sin almacenamiento local los pendientes solo duran mientras la app esté abierta.
  }
  // Avisa a las pantallas que muestran los pendientes para que se actualicen.
  window.dispatchEvent(new Event(EVENTO_PENDIENTES));
};

export const obtenerPendientes = (): ReportePendiente[] => leer();

export const eliminarPendiente = (id: string) =>
  guardar(leer().filter((pendiente) => pendiente.id !== id));

// Simula el envío al servidor y devuelve cuántos reportes se enviaron.
export const enviarPendientes = async (): Promise<number> => {
  await new Promise((resolver) => setTimeout(resolver, 1200));
  const enviados = leer();
  // Pasan a la lista de "Mis reportes" con estado Pendiente hasta que el municipio los revise.
  registrarReportesEnviados(enviados);
  guardar([]);
  return enviados.length;
};
