// Catálogo geográfico de sectores de Valparaíso.
//
// La geometría vive en `sectores.json` para poder reemplazarla por polígonos
// oficiales sin tocar el cálculo. La versión del catálogo permite invalidar la
// caché del frontend cuando cambia.
const datos = require('./sectores.json');

const CAJA_VALPARAISO = Object.freeze(datos.caja);
const DISTANCIA_MAXIMA_KM = datos.distanciaMaximaKm;
const SECTORES = Object.freeze(datos.sectores);

// Ray casting. El polígono viene como [latitud, longitud]; internamente se usa
// x = longitud, y = latitud.
const puntoEnPoligono = (latitud, longitud, poligono) => {
  let dentro = false;

  for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
    const [latI, lngI] = poligono[i];
    const [latJ, lngJ] = poligono[j];

    const cruza =
      latI > latitud !== latJ > latitud &&
      longitud < ((lngJ - lngI) * (latitud - latI)) / (latJ - latI) + lngI;

    if (cruza) dentro = !dentro;
  }

  return dentro;
};

const dentroDeValparaiso = (latitud, longitud) =>
  latitud >= CAJA_VALPARAISO.minLat &&
  latitud <= CAJA_VALPARAISO.maxLat &&
  longitud >= CAJA_VALPARAISO.minLng &&
  longitud <= CAJA_VALPARAISO.maxLng;

const RADIO_TIERRA_KM = 6371;
const aRadianes = (grados) => (grados * Math.PI) / 180;

const distanciaKm = (lat1, lng1, lat2, lng2) => {
  const dLat = aRadianes(lat2 - lat1);
  const dLng = aRadianes(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRadianes(lat1)) * Math.cos(aRadianes(lat2)) * Math.sin(dLng / 2) ** 2;

  return 2 * RADIO_TIERRA_KM * Math.asin(Math.sqrt(a));
};

const sectorMasCercano = (latitud, longitud) => {
  if (
    latitud === null ||
    latitud === undefined ||
    longitud === null ||
    longitud === undefined
  ) {
    return null;
  }

  const lat = Number(latitud);
  const lng = Number(longitud);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return SECTORES.reduce((cercano, sector) => {
    const distancia = distanciaKm(
      lat,
      lng,
      sector.centro.latitud,
      sector.centro.longitud,
    );

    return !cercano || distancia < cercano.distanciaKm
      ? { id: sector.id, nombre: sector.nombre, distanciaKm: distancia }
      : cercano;
  }, null);
};

// Para reportes nuevos: si cae fuera de todos los polígonos pero dentro del área
// de Valparaíso y cerca de un sector, se asigna el más cercano. Si está fuera
// del área o demasiado lejos, no se acepta.
const sectorDeCoordenadas = (latitud, longitud) => {
  const lat = Number(latitud);
  const lng = Number(longitud);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const encontrado = SECTORES.find((sector) =>
    puntoEnPoligono(lat, lng, sector.poligono),
  );

  if (encontrado) {
    return { id: encontrado.id, nombre: encontrado.nombre, asignadoPor: 'poligono' };
  }

  if (!dentroDeValparaiso(lat, lng)) return null;

  const cercano = sectorMasCercano(lat, lng);
  if (!cercano || cercano.distanciaKm > DISTANCIA_MAXIMA_KM) return null;

  return { ...cercano, asignadoPor: 'cercania' };
};

const esSectorCanonico = (nombre) =>
  SECTORES.some((sector) => sector.nombre === nombre);

const catalogoSectores = () => ({
  version: datos.version,
  actualizadoEn: datos.actualizadoEn,
  distanciaMaximaKm: DISTANCIA_MAXIMA_KM,
  caja: { ...CAJA_VALPARAISO },
  sectores: SECTORES.map(({ id, nombre, poligono, centro }) => ({
    id,
    nombre,
    poligono,
    centro,
  })),
});

module.exports = {
  CAJA_VALPARAISO,
  DISTANCIA_MAXIMA_KM,
  VERSION_CATALOGO: datos.version,
  SECTORES,
  puntoEnPoligono,
  distanciaKm,
  sectorMasCercano,
  sectorDeCoordenadas,
  esSectorCanonico,
  catalogoSectores,
};
