import { ErrorApi } from './api';
import { crearReporte, fechaHoraActual, type DatosNuevoReporte } from './reportesService';
import { obtenerDireccionDesdePunto, validarUbicacionEnChile } from './geocodificacionService';

// Reportes creados sin conexión (RF-02). Se guardan en el navegador hasta que se envían
// a la API.

export interface ReportePendiente extends DatosNuevoReporte {
  id: string;
  guardadoEn: string;
}

const CLAVE = 'focalware-reportes-pendientes';
export const EVENTO_PENDIENTES = 'focalware-pendientes-cambiaron';

// Antes de conectar la API la app mostraba dos reportes de ejemplo con estos ids, y
// pudieron quedar guardados en el navegador. Se descartan para no enviarlos a la base.
const IDS_DE_EJEMPLO = ['P-001', 'P-002'];

// Copia en memoria, por si el navegador no permite usar el almacenamiento local.
let enMemoria: ReportePendiente[] | null = null;

const leer = (): ReportePendiente[] => {
  if (enMemoria) return enMemoria;
  try {
    const guardado = localStorage.getItem(CLAVE);
    // Los pendientes guardados con una versión anterior pueden no tener los campos nuevos.
    enMemoria = guardado
      ? (JSON.parse(guardado) as Partial<ReportePendiente>[])
          .filter((pendiente) => !IDS_DE_EJEMPLO.includes(pendiente.id ?? ''))
          .map(
            (pendiente) =>
              ({
                descripcion: '',
                volumen: '',
                distanciaViviendas: '',
                imagenes: [],
                ...pendiente,
                riesgo: pendiente.riesgo ?? null,
              }) as ReportePendiente,
          )
      : [];
  } catch {
    enMemoria = [];
  }
  return enMemoria;
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

// Guarda un reporte creado sin conexión para enviarlo más tarde.
export const guardarPendiente = (datos: DatosNuevoReporte) =>
  guardar([
    ...leer(),
    { ...datos, id: `P-${Date.now().toString().slice(-6)}`, guardadoEn: fechaHoraActual() },
  ]);

export const obtenerPendientePorId = (id: string): ReportePendiente | undefined =>
  leer().find((pendiente) => pendiente.id === id);

// Modifica un reporte guardado sin conexión antes de enviarlo (RF-13). No necesita internet.
export const actualizarPendiente = (id: string, cambios: Partial<DatosNuevoReporte>) =>
  guardar(leer().map((pendiente) => (pendiente.id === id ? { ...pendiente, ...cambios } : pendiente)));

export const eliminarPendiente = (id: string) =>
  guardar(leer().filter((pendiente) => pendiente.id !== id));

export interface ResultadoEnvio {
  enviados: number;
  // Reportes que la API rechazó (por ejemplo, uno repetido). Se quedan guardados para
  // que el vecino los corrija o los elimine.
  rechazados: { nombre: string; motivo: string }[];
  // true si se cortó la conexión o venció la sesión: lo que faltaba se intenta después.
  interrumpido: boolean;
}

// Envía a la API los reportes guardados sin conexión, uno por uno. Cada reporte que
// llega se borra del teléfono en ese momento, así un corte a la mitad no duplica nada.
export const enviarPendientes = async (): Promise<ResultadoEnvio> => {
  const resultado: ResultadoEnvio = { enviados: 0, rechazados: [], interrumpido: false };

  for (const pendiente of leer()) {
    try {
      const res = await validarYEnviarPendiente(pendiente.id);
      if (res.ok) {
        resultado.enviados += 1;
      } else {
        resultado.rechazados.push({
          nombre: pendiente.nombre,
          motivo: res.motivo ?? 'Ocurrió un problema al enviarlo.',
        });
      }
    } catch (error) {
      // Sin conexión (0) o con la sesión vencida (401) los demás también van a fallar.
      if (error instanceof ErrorApi && (error.estado === 0 || error.estado === 401)) {
        resultado.interrumpido = true;
        break;
      }
      resultado.rechazados.push({
        nombre: pendiente.nombre,
        motivo: error instanceof Error ? error.message : 'Ocurrió un problema al enviarlo.',
      });
    }
  }

  return resultado;
};

// Valida un pendiente con OpenGeo y, si es válido, lo envía. Útil para reintentar
// manualmente un reporte que falló por falta de dirección.
export const validarYEnviarPendiente = async (
  id: string,
): Promise<{ ok: boolean; motivo?: string }> => {
  const pendiente = obtenerPendientePorId(id);
  if (!pendiente) return { ok: false, motivo: 'El reporte ya no existe.' };

  if (
    !Number.isFinite(pendiente.latitud) ||
    pendiente.latitud < -90 ||
    pendiente.latitud > 90 ||
    !Number.isFinite(pendiente.longitud) ||
    pendiente.longitud < -180 ||
    pendiente.longitud > 180
  ) {
    return { ok: false, motivo: 'Coordenadas inválidas. Corrige la ubicación.' };
  }

  const enChile = await validarUbicacionEnChile(pendiente.latitud, pendiente.longitud);
  if (enChile === false) {
    return { ok: false, motivo: 'La ubicación del reporte debe estar dentro de Chile.' };
  }

  if (enChile === true) {
    const direccion = await obtenerDireccionDesdePunto(pendiente.latitud, pendiente.longitud);
    if (direccion) {
      // Actualiza el sector con la dirección validada desde el pin.
      actualizarPendiente(id, { sector: direccion });
    } else if (!(pendiente.sector?.trim().length >= 3)) {
      return { ok: false, motivo: 'No se encontró una dirección válida. Agrega un sector/dirección.' };
    }
  }

  const actualizado = obtenerPendientePorId(id) ?? pendiente;
  try {
    await crearReporte(actualizado);
    eliminarPendiente(id);
    return { ok: true };
  } catch (error) {
    if (error instanceof ErrorApi && (error.estado === 0 || error.estado === 401)) {
      throw error;
    }
    return {
      ok: false,
      motivo: error instanceof Error ? error.message : 'Ocurrió un problema al enviarlo.',
    };
  }
};
