// Configuración centralizada de la geocodificación (Nominatim / OpenStreetMap + catálogo de cerros).
const ENDPOINT_REVERSE = 'https://nominatim.openstreetmap.org/reverse';
const ENDPOINT_SEARCH = 'https://nominatim.openstreetmap.org/search';

const CODIGO_PAIS = 'cl';
const VIEWBOX_VALPARAISO = '-71.95,-33.25,-71.40,-32.85';

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { valor: string | null; expira: number }>();
const cachePuntos = new Map<string, { valor: PuntoGeocodificado; expira: number }>();

export type EstadoPais = 'chile' | 'otro' | 'desconocido';

export interface PuntoGeocodificado {
  estado: EstadoPais;
  direccion: string | null;
}

export interface SugerenciaDireccion {
  id: string;
  texto: string;
  latitud: number;
  longitud: number;
}

const CERROS_VALPARAISO: SugerenciaDireccion[] = [
  { id: 'cerro-alegre', texto: 'Cerro Alegre, Valparaíso', latitud: -33.0436, longitud: -71.6272 },
  { id: 'cerro-arrayan', texto: 'Cerro Arrayán, Valparaíso', latitud: -33.0358, longitud: -71.6352 },
  { id: 'cerro-artilleria', texto: 'Cerro Artillería, Valparaíso', latitud: -33.0315, longitud: -71.6311 },
  { id: 'cerro-baron', texto: 'Cerro Barón, Valparaíso', latitud: -33.0425, longitud: -71.6022 },
  { id: 'cerro-bellavista', texto: 'Cerro Bellavista, Valparaíso', latitud: -33.0485, longitud: -71.6215 },
  { id: 'cerro-carcel', texto: 'Cerro Cárcel, Valparaíso', latitud: -33.0468, longitud: -71.6279 },
  { id: 'cerro-concepcion', texto: 'Cerro Concepción, Valparaíso', latitud: -33.0422, longitud: -71.6248 },
  { id: 'cerro-cordillera', texto: 'Cerro Cordillera, Valparaíso', latitud: -33.0389, longitud: -71.6335 },
  { id: 'cerro-delicias', texto: 'Cerro Delicias, Valparaíso', latitud: -33.0532, longitud: -71.6048 },
  { id: 'cerro-el-litre', texto: 'Cerro El Litre, Valparaíso', latitud: -33.0568, longitud: -71.6152 },
  { id: 'cerro-esperanza', texto: 'Cerro Esperanza, Valparaíso', latitud: -33.0365, longitud: -71.5885 },
  { id: 'cerro-florida', texto: 'Cerro Florida, Valparaíso', latitud: -33.0504, longitud: -71.6228 },
  { id: 'cerro-jimenez', texto: 'Cerro Jiménez, Valparaíso', latitud: -33.0512, longitud: -71.6272 },
  { id: 'cerro-la-cruz', texto: 'Cerro La Cruz, Valparaíso', latitud: -33.0562, longitud: -71.6112 },
  { id: 'cerro-larrain', texto: 'Cerro Larraín, Valparaíso', latitud: -33.0468, longitud: -71.6005 },
  { id: 'cerro-las-canas', texto: 'Cerro Las Cañas, Valparaíso', latitud: -33.0608, longitud: -71.6085 },
  { id: 'cerro-lecheros', texto: 'Cerro Lecheros, Valparaíso', latitud: -33.0445, longitud: -71.6025 },
  { id: 'cerro-mariposas', texto: 'Cerro Mariposas, Valparaíso', latitud: -33.0585, longitud: -71.6188 },
  { id: 'cerro-merced', texto: 'Cerro Merced, Valparaíso', latitud: -33.0565, longitud: -71.6062 },
  { id: 'cerro-mesilla', texto: 'Cerro Mesilla, Valparaíso', latitud: -33.0368, longitud: -71.6368 },
  { id: 'cerro-monjas', texto: 'Cerro Monjas, Valparaíso', latitud: -33.0548, longitud: -71.6182 },
  { id: 'cerro-ohiggins', texto: "Cerro O'Higgins, Valparaíso", latitud: -33.0588, longitud: -71.5985 },
  { id: 'cerro-pajonal', texto: 'Cerro Pajonal, Valparaíso', latitud: -33.0622, longitud: -71.6042 },
  { id: 'cerro-panteon', texto: 'Cerro Panteón, Valparaíso', latitud: -33.0462, longitud: -71.6258 },
  { id: 'cerro-perdices', texto: 'Cerro Perdices, Valparaíso', latitud: -33.0395, longitud: -71.6382 },
  { id: 'cerro-placeres', texto: 'Cerro Placeres, Valparaíso', latitud: -33.0362, longitud: -71.5935 },
  { id: 'cerro-playa-ancha', texto: 'Cerro Playa Ancha, Valparaíso', latitud: -33.0318, longitud: -71.6395 },
  { id: 'cerro-polanco', texto: 'Cerro Polanco, Valparaíso', latitud: -33.0502, longitud: -71.6028 },
  { id: 'cerro-ramaditas', texto: 'Cerro Ramaditas, Valparaíso', latitud: -33.0645, longitud: -71.6015 },
  { id: 'cerro-rocuant', texto: 'Cerro Rocuant, Valparaíso', latitud: -33.0635, longitud: -71.5965 },
  { id: 'cerro-san-juan-de-dios', texto: 'Cerro San Juan de Dios, Valparaíso', latitud: -33.0528, longitud: -71.6242 },
  { id: 'cerro-san-roque', texto: 'Cerro San Roque, Valparaíso', latitud: -33.0665, longitud: -71.5895 },
  { id: 'cerro-santo-domingo', texto: 'Cerro Santo Domingo, Valparaíso', latitud: -33.0372, longitud: -71.6312 },
  { id: 'cerro-toro', texto: 'Cerro Toro, Valparaíso', latitud: -33.0378, longitud: -71.6338 },
  { id: 'cerro-yungay', texto: 'Cerro Yungay, Valparaíso', latitud: -33.0518, longitud: -71.6225 },
  { id: 'sector-rodelillo', texto: 'Rodelillo, Valparaíso', latitud: -33.0545, longitud: -71.5812 },
  { id: 'sector-placilla', texto: 'Placilla de Peñuelas, Valparaíso', latitud: -33.1185, longitud: -71.5682 },
  { id: 'sector-laguna-verde', texto: 'Laguna Verde, Valparaíso', latitud: -33.1055, longitud: -71.6645 },
];

const normalizarTexto = (valor: string): string =>
  valor
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

function buscarCerrosLocales(consulta: string): SugerenciaDireccion[] {
  const limpia = normalizarTexto(consulta);
  if (limpia.length < 3) return [];
  return CERROS_VALPARAISO.filter((cerro) => normalizarTexto(cerro.texto).includes(limpia)).slice(
    0,
    4,
  );
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

export function formatearDireccion(address?: Record<string, string> | null, displayName?: string): string | null {
  if (!address) return displayName ?? null;
  const calle = address.road || address.pedestrian || address.footway || address.path;
  const numero = address.house_number;
  const sector =
    address.hill ||
    address.peak ||
    address.suburb ||
    address.neighbourhood ||
    address.quarter ||
    address.city_district;
  const ciudad = address.city || address.town || address.village || address.municipality || address.state;
  const partes = [calle && numero ? `${calle} ${numero}` : calle, sector, ciudad].filter(Boolean);
  if (partes.length > 0) return partes.join(', ');
  return displayName ?? null;
}

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

export async function obtenerDireccionDesdePunto(
  latitud: number,
  longitud: number,
  signal?: AbortSignal,
): Promise<string | null> {
  const resultado = await consultarPunto(latitud, longitud, signal);
  return resultado.estado === 'chile' ? resultado.direccion : null;
}

export async function buscarDirecciones(
  consulta: string,
  signal?: AbortSignal,
): Promise<SugerenciaDireccion[]> {
  const texto = consulta.trim();
  if (texto.length < 3) return [];

  const cerrosCoincidentes = buscarCerrosLocales(texto);

  const tieneCiudad = /valpara[ií]so|vi[nñ]a|chile/i.test(texto);
  const consultaFinal = tieneCiudad ? texto : `${texto}, Valparaíso, Chile`;

  const clave = `search:${consultaFinal.toLowerCase()}`;
  const enCache = cacheGet(clave);
  if (enCache !== undefined) {
    const cacheados: SugerenciaDireccion[] = enCache ? JSON.parse(enCache) : [];
    const textosVistos = new Set(cerrosCoincidentes.map((c) => normalizarTexto(c.texto)));
    return [
      ...cerrosCoincidentes,
      ...cacheados.filter((item) => !textosVistos.has(normalizarTexto(item.texto))),
    ].slice(0, 6);
  }

  try {
    const url =
      `${ENDPOINT_SEARCH}?format=jsonv2` +
      `&q=${encodeURIComponent(consultaFinal)}` +
      `&countrycodes=${CODIGO_PAIS}` +
      `&viewbox=${VIEWBOX_VALPARAISO}` +
      `&addressdetails=1&limit=5&accept-language=es`;
    const respuesta = await fetch(url, {
      signal,
      headers: { Accept: 'application/json' },
    });
    if (!respuesta.ok) {
      cacheSet(clave, null);
      return cerrosCoincidentes;
    }
    const datos = (await respuesta.json()) as Array<{
      place_id: number;
      display_name: string;
      lat: string;
      lon: string;
      address?: Record<string, string>;
    }>;
    const remotos = datos.map((item) => ({
      id: String(item.place_id),
      texto: formatearDireccion(item.address, item.display_name) ?? item.display_name,
      latitud: Number(item.lat),
      longitud: Number(item.lon),
    }));
    cacheSet(clave, JSON.stringify(remotos));

    const textosVistos = new Set(cerrosCoincidentes.map((c) => normalizarTexto(c.texto)));
    return [
      ...cerrosCoincidentes,
      ...remotos.filter((item) => !textosVistos.has(normalizarTexto(item.texto))),
    ].slice(0, 6);
  } catch {
    return cerrosCoincidentes;
  }
}