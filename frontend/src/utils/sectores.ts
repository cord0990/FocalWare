// Cálculo local del sector a partir de las coordenadas. El backend vuelve a
// calcularlo y es la autoridad; esto sirve para mostrar el sector mientras se
// completa el formulario y para bloquear ubicaciones fuera de Valparaíso.
import type {
  CatalogoSectores,
  CajaValparaiso,
  Sector,
} from '../services/sectoresService';

const RADIO_TIERRA_KM = 6371;
const aRadianes = (grados: number) => (grados * Math.PI) / 180;

export const distanciaKm = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
) => {
  const dLat = aRadianes(lat2 - lat1);
  const dLng = aRadianes(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRadianes(lat1)) * Math.cos(aRadianes(lat2)) * Math.sin(dLng / 2) ** 2;

  return 2 * RADIO_TIERRA_KM * Math.asin(Math.sqrt(a));
};

export const puntoEnPoligono = (
  latitud: number,
  longitud: number,
  poligono: [number, number][],
) => {
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

const dentroDeCaja = (caja: CajaValparaiso, latitud: number, longitud: number) =>
  latitud >= caja.minLat &&
  latitud <= caja.maxLat &&
  longitud >= caja.minLng &&
  longitud <= caja.maxLng;

export const sectorMasCercano = (
  catalogo: CatalogoSectores,
  latitud: number,
  longitud: number,
): { sector: Sector; distanciaKm: number } | null => {
  if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) return null;

  return catalogo.sectores.reduce<{ sector: Sector; distanciaKm: number } | null>(
    (cercano, sector) => {
      const distancia = distanciaKm(
        latitud,
        longitud,
        sector.centro.latitud,
        sector.centro.longitud,
      );

      return !cercano || distancia < cercano.distanciaKm
        ? { sector, distanciaKm: distancia }
        : cercano;
    },
    null,
  );
};

export const sectorDeCoordenadas = (
  catalogo: CatalogoSectores,
  latitud: number,
  longitud: number,
): { sector: Sector; asignadoPor: 'poligono' | 'cercania' } | null => {
  if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) return null;

  const encontrado = catalogo.sectores.find((sector) =>
    puntoEnPoligono(latitud, longitud, sector.poligono),
  );

  if (encontrado) return { sector: encontrado, asignadoPor: 'poligono' };

  if (!dentroDeCaja(catalogo.caja, latitud, longitud)) return null;

  const cercano = sectorMasCercano(catalogo, latitud, longitud);
  const distanciaMaxima = catalogo.distanciaMaximaKm ?? 8;

  if (!cercano || cercano.distanciaKm > distanciaMaxima) return null;

  return { sector: cercano.sector, asignadoPor: 'cercania' };
};
