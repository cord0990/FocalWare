// Configuración centralizada de la geocodificación (Nominatim / OpenStreetMap).
const ENDPOINT_REVERSE = 'https://nominatim.openstreetmap.org/reverse';
const ENDPOINT_SEARCH = 'https://nominatim.openstreetmap.org/search';

// Restringe los resultados a Chile.
const CODIGO_PAIS = 'cl';
// Cuadro aproximado de la región de Valparaíso (minLng, minLat, maxLng, maxLat).
const VIEWBOX_VALPARAISO = '-71.95,-33.25,-71.40,-32.85';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos
const cache = new Map<string, { valor: string | null; expira: number }>();

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

// funcion: obtenerDireccionDesdePunto - consulta Nominatim (reverse) para obtener la direccion de un punto; valida que sea Chile.
// El cache (cache key por lat/lng redondeado) evita repetir la misma consulta a Nominatim para el mismo punto dentro de 5 minutos, asi reduce latencia y consumo de red.
export async function obtenerDireccionDesdePunto(
  latitud: number,
  longitud: number,
  signal?: AbortSignal,
): Promise<string | null> {
  const clave = `rev:${latitud.toFixed(5)},${longitud.toFixed(5)}`;
  const enCache = cacheGet(clave);
  if (enCache !== undefined) return enCache;

  try {
    const url = `${ENDPOINT_REVERSE}?format=jsonv2&lat=${encodeURIComponent(latitud)}&lon=${encodeURIComponent(longitud)}&addressdetails=1&accept-language=es`;
    const respuesta = await fetch(url, {
      signal,
      headers: { Accept: 'application/json' },
    });
    if (!respuesta.ok) {
      cacheSet(clave, null);
      return null;
    }
    const datos = (await respuesta.json()) as {
      display_name?: string;
      address?: Record<string, string>;
    };
    // Restringir a Chile.
    if (datos.address?.country_code && datos.address.country_code.toLowerCase() !== CODIGO_PAIS) {
      cacheSet(clave, null);
      return null;
    }
    const resultado = formatearDireccion(datos.address, datos.display_name);
    cacheSet(clave, resultado);
    return resultado;
  } catch {
    return null;
  }
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
