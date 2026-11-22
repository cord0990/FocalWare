// Transformación pura del backfill de sectores.
// Se separa del script para poder probar los casos sin tocar la base.
const {
  sectorDeCoordenadas,
  sectorMasCercano,
  esSectorCanonico,
} = require('./sectores');

const calcularCambioSector = (reporte, { umbralLejosKm = 10 } = {}) => {
  if (
    reporte.latitud === null ||
    reporte.latitud === undefined ||
    reporte.longitud === null ||
    reporte.longitud === undefined
  ) {
    return null;
  }

  const latitud = Number(reporte.latitud);
  const longitud = Number(reporte.longitud);

  if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) return null;

  const cercano = sectorMasCercano(latitud, longitud);
  const zona = sectorDeCoordenadas(latitud, longitud) ?? cercano;

  if (!zona) return null;

  const sectorViejo = String(reporte.sector ?? '').trim();
  const direccionVieja = String(reporte.direccion ?? '').trim();
  const nuevoSector = zona.nombre;

  // Si el texto viejo no era un sector canónico, era una dirección o
  // referencia: se conserva en `direccion` cuando todavía no hay una.
  const direccion =
    direccionVieja || (esSectorCanonico(sectorViejo) ? null : sectorViejo || null);

  const cambiaSector = nuevoSector !== sectorViejo;
  const cambiaDireccion = direccion !== (reporte.direccion ?? null);
  const distanciaKm = cercano?.distanciaKm ?? null;

  return {
    idReporte: reporte.idReporte,
    sectorViejo,
    nuevoSector,
    direccion,
    distanciaKm,
    cambiaSector,
    cambiaDireccion,
    lejos: distanciaKm !== null && distanciaKm > umbralLejosKm,
  };
};

module.exports = { calcularCambioSector };
