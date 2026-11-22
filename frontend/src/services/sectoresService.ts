// Catálogo geográfico de sectores que entrega el backend.
// Se cachea para que el filtro y el formulario no dependan de una consulta en
// cada pantalla y para poder seguir funcionando si la red falla.
import { pedir } from './api';

export interface Sector {
  id: string;
  nombre: string;
  poligono: [number, number][];
  centro: { latitud: number; longitud: number };
}

export interface CajaValparaiso {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface CatalogoSectores {
  version: string;
  actualizadoEn: string;
  distanciaMaximaKm: number;
  caja: CajaValparaiso;
  sectores: Sector[];
}

type EntradaCache = { catalogo: CatalogoSectores; expira: number };

const CLAVE_CACHE = 'focalware-sectores-v2';
const TTL_MS = 5 * 60 * 1000; // 5 minutos

let memoria: EntradaCache | null = null;
let enCurso: Promise<CatalogoSectores> | null = null;

const leerCache = (): EntradaCache | null => {
  try {
    const guardado = localStorage.getItem(CLAVE_CACHE);
    if (!guardado) return null;
    const datos = JSON.parse(guardado) as EntradaCache;
    if (
      !datos?.catalogo?.sectores ||
      !datos?.catalogo?.caja ||
      typeof datos.catalogo.distanciaMaximaKm !== 'number'
    ) {
      return null;
    }
    return datos;
  } catch {
    return null;
  }
};

const guardarCache = (datos: EntradaCache) => {
  memoria = datos;
  try {
    localStorage.setItem(CLAVE_CACHE, JSON.stringify(datos));
  } catch {
    // Sin almacenamiento el catálogo dura mientras la app esté abierta.
  }
};

const cargar = async (): Promise<CatalogoSectores> => {
  try {
    const recibido = await pedir<CatalogoSectores>('/sectores', { autenticado: false });
    const catalogo: CatalogoSectores = {
      ...recibido,
      version: recibido.version ?? 'desconocida',
      actualizadoEn: recibido.actualizadoEn ?? '',
      distanciaMaximaKm: Number.isFinite(recibido.distanciaMaximaKm)
        ? recibido.distanciaMaximaKm
        : 8,
    };

    guardarCache({ catalogo, expira: Date.now() + TTL_MS });
    return catalogo;
  } catch (error) {
    // Si ya había un catálogo, aunque esté vencido, se usa para no dejar el
    // filtro vacío por un problema momentáneo de red.
    const respaldo = memoria ?? leerCache();
    if (respaldo) return respaldo.catalogo;
    throw error;
  }
};

export const obtenerCatalogoSectores = async (
  forzar = false,
): Promise<CatalogoSectores> => {
  if (!forzar && memoria && memoria.expira > Date.now()) {
    return memoria.catalogo;
  }

  const guardado = leerCache();
  if (!forzar && guardado && guardado.expira > Date.now()) {
    memoria = guardado;
    return guardado.catalogo;
  }

  // Si dos pantallas piden el catálogo al mismo tiempo, comparten la misma
  // consulta en vez de lanzar una cada una.
  if (enCurso) return enCurso;

  enCurso = cargar().finally(() => {
    enCurso = null;
  });

  return enCurso;
};

export const limpiarCacheSectores = () => {
  memoria = null;
  try {
    localStorage.removeItem(CLAVE_CACHE);
  } catch {
    // Nada que limpiar.
  }
};
