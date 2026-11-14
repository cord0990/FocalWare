// Configuración centralizada de la geocodificación (Nominatim / OpenStreetMap).
const ENDPOINT_REVERSE = 'https://nominatim.openstreetmap.org/reverse';
const ENDPOINT_SEARCH = 'https://nominatim.openstreetmap.org/search';

// Restringe los resultados a Chile.
const CODIGO_PAIS = 'cl';
// Cuadro aproximado de la región de Valparaíso (minLng, minLat, maxLng, maxLat).
const VIEWBOX_VALPARAISO = '-71.95,-33.25,-71.40,-32.85';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos
const cache = new Map<string, { valor: string | null; expira: number }>();
const cachePuntos = new Map<string, { valor: PuntoGeocodificado; expira: number }>();

export type EstadoPais = 'chile' | 'otro' | 'desconocido';

export interface PuntoGeocodificado {
  estado: EstadoPais;
  direccion: string | null;
}

function cacheGet(clave: string): string | null | undefined {
  const entrada = cache.get(clave);
  if (!entrada) return undefined;
  if (Date.now() > entrada.expira) {
    cache.delete(clave);
    return undefined;
  }
  return entrada.valor;
}

function cacheSet(clave: string, valor: string | null) {
  cache.set(clave, { valor, expira: Date.now() + CACHE_TTL_MS });
}

// funcion: formatearDireccion - arma una direccion legible (calle, numero, barrio, ciudad) a partir de los datos de Nominatim.
// Si no hay datos de address (o faltan campos), usa displayName como fallback para no devolver null y mostrar algo legible al usuario.
export function formatearDireccion(address?: Record<string, string> | null, displayName?: string): string | null {
  if (!address) return displayName ?? null;
  const calle = address.road || address.pedestrian || address.footway || address.path;
  const numero = address.house_number;
  const barrio = address.suburb || address.neighbourhood || address.quarter || address.city_district;
  const ciudad = address.city || address.town || address.village || address.municipality || address.state;
  const partes = [calle && numero ? `${calle} ${numero}` : calle, barrio, ciudad].filter(Boolean);
  if (partes.length > 0) return partes.join(', ');
  return displayName ?? null;
}

// Consulta Nominatim para un punto y clasifica si está en Chile.
// - chile: country_code "cl", o no viene país pero el nombre menciona Chile.
// - otro: otro país o una respuesta sin país (por ejemplo, océano).
// - desconocido: no se pudo consultar (red caída, timeout, HTTP no exitoso).
//
// El caché por coordenada redondeada evita repetir la misma consulta a Nominatim
// dentro de 5 minutos. No se cachea "desconocido" para poder reintentar.
export async function consultarPunto(
  latitud: number,
  longitud: number,
  signal?: AbortSignal,
): Promise<PuntoGeocodificado> {
  const clave = `punto:${latitud.toFixed(5)},${longitud.toFixed(5)}`;
  const enCache = cachePuntos.get(clave);

  if (enCache) {
    if (enCache.expira > Date.now()) return enCache.valor;
    cachePuntos.delete(clave);
  }

  try {
    const url = `${ENDPOINT_REVERSE}?format=jsonv2&lat=${encodeURIComponent(latitud)}&lon=${encodeURIComponent(longitud)}&addressdetails=1&accept-language=es`;
    const respuesta = await fetch(url, {
      signal,
      headers: { Accept: 'application/json' },
    });

    if (!respuesta.ok) return { estado: 'desconocido', direccion: null };

    const datos = (await respuesta.json()) as {
      display_name?: string;
      address?: Record<string, string>;
    };

    const codigoPais = datos.address?.country_code?.toLowerCase();
    const enChile =
      codigoPais === CODIGO_PAIS ||
      (!codigoPais && /chile/i.test(datos.display_name ?? ''));

    const resultado: PuntoGeocodificado = {
      estado: enChile ? 'chile' : 'otro',
      direccion: enChile ? formatearDireccion(datos.address, datos.display_name) : null,
    };

    cachePuntos.set(clave, { valor: resultado, expira: Date.now() + CACHE_TTL_MS });
    return resultado;
  } catch {
    return { estado: 'desconocido', direccion: null };
  }
}

// Devuelve true si el punto está en Chile, false si está fuera y null si no se
// pudo verificar. El null permite seguir creando reportes sin conexión.
export async function validarUbicacionEnChile(
  latitud: number,
  longitud: number,
  signal?: AbortSignal,
): Promise<boolean | null> {
  const resultado = await consultarPunto(latitud, longitud, signal);

  if (resultado.estado === 'chile') return true;
  if (resultado.estado === 'otro') return false;
  return null;
}

// funcion: obtenerDireccionDesdePunto - consulta Nominatim (reverse) para obtener la direccion de un punto; valida que sea Chile.
export async function obtenerDireccionDesdePunto(
  latitud: number,
  longitud: number,
  signal?: AbortSignal,
): Promise<string | null> {
  const resultado = await consultarPunto(latitud, longitud, signal);
  return resultado.estado === 'chile' ? resultado.direccion : null;
}

export interface SugerenciaDireccion {
  id: string;
  texto: string;
  latitud: number;
  longitud: number;
}

// funcion: buscarDirecciones - busca direcciones en Nominatim (search) restringidas a Chile; agrega "Chile" si falta y usa cache por 5 minutos.
export async function buscarDirecciones(
  consulta: string,
  signal?: AbortSignal,
): Promise<SugerenciaDireccion[]> {
  const texto = consulta.trim();
  if (texto.length < 3) return [];

  // Si el usuario no incluyó "Chile", lo añadimos para priorizar resultados locales.
  const consultaFinal = /chile/i.test(texto) ? texto : `${texto}, Chile`;

  const clave = `search:${consultaFinal.toLowerCase()}`;
  const enCache = cacheGet(clave);
  if (enCache !== undefined) {
    // El caché guarda string; para búsquedas devolvemos [] si no hay valor.
    return enCache ? JSON.parse(enCache) : [];
  }

  try {
    const url =
      `${ENDPOINT_SEARCH}?format=jsonv2` +
      `&q=${encodeURIComponent(consultaFinal)}` +
      `&countrycodes=${CODIGO_PAIS}` +
      `&viewbox=${VIEWBOX_VALPARAISO}` +
      `&bounded=1` +
      `&addressdetails=1&limit=5&accept-language=es`;
    const respuesta = await fetch(url, {
      signal,
      headers: { Accept: 'application/json' },
    });
    if (!respuesta.ok) {
      cacheSet(clave, null);
      return [];
    }
    const datos = (await respuesta.json()) as Array<{
      place_id: number;
      display_name: string;
      lat: string;
      lon: string;
      address?: Record<string, string>;
    }>;
    const resultado = datos.map((item) => ({
      id: String(item.place_id),
      texto: formatearDireccion(item.address, item.display_name) ?? item.display_name,
      latitud: Number(item.lat),
      longitud: Number(item.lon),
    }));
    cacheSet(clave, JSON.stringify(resultado));
    return resultado;
  } catch {
    return [];
  }
}
