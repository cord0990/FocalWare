import { describe, expect, it } from 'vitest';
import type { CatalogoSectores } from '../services/sectoresService';
import {
  puntoEnPoligono,
  sectorDeCoordenadas,
  sectorMasCercano,
} from './sectores';

const catalogo: CatalogoSectores = {
  version: 'test',
  actualizadoEn: '2026-11-22',
  distanciaMaximaKm: 1000,
  caja: { minLat: -10, maxLat: 10, minLng: -10, maxLng: 20 },
  sectores: [
    {
      id: 'centro',
      nombre: 'Centro',
      centro: { latitud: 0, longitud: 0 },
      poligono: [
        [-1, -1],
        [-1, 1],
        [1, 1],
        [1, -1],
      ],
    },
    {
      id: 'este',
      nombre: 'Este',
      centro: { latitud: 0, longitud: 10 },
      poligono: [
        [-1, 9],
        [-1, 11],
        [1, 11],
        [1, 9],
      ],
    },
  ],
};

describe('sectores geográficos', () => {
  it('detecta un punto dentro de un polígono', () => {
    expect(puntoEnPoligono(0, 0, catalogo.sectores[0].poligono)).toBe(true);
    expect(puntoEnPoligono(5, 5, catalogo.sectores[0].poligono)).toBe(false);
  });

  it('asigna el polígono que contiene el punto', () => {
    const zona = sectorDeCoordenadas(catalogo, 0, 0);

    expect(zona?.sector.nombre).toBe('Centro');
    expect(zona?.asignadoPor).toBe('poligono');
  });

  it('si está dentro de la caja pero fuera de los polígonos, asigna el más cercano', () => {
    const zona = sectorDeCoordenadas(catalogo, 5, 5);

    expect(zona?.asignadoPor).toBe('cercania');
    expect(zona?.sector.nombre).toBe('Centro');
  });

  it('fuera de la caja no asigna sector', () => {
    expect(sectorDeCoordenadas(catalogo, 50, 50)).toBeNull();
  });

  it('dentro de la caja pero demasiado lejos tampoco asigna sector', () => {
    expect(sectorDeCoordenadas(catalogo, -9, -9)).toBeNull();
  });

  it('el más cercano devuelve una distancia', () => {
    const cercano = sectorMasCercano(catalogo, 0, 10);

    expect(cercano?.sector.nombre).toBe('Este');
    expect(cercano?.distanciaKm).toBeCloseTo(0, 5);
  });

  it('el más cercano devuelve null con coordenadas inválidas', () => {
    expect(sectorMasCercano(catalogo, NaN, NaN)).toBeNull();
  });

  it('usa 8 km si el catálogo no trae distanciaMaximaKm', () => {
    const sinUmbral = {
      ...catalogo,
      distanciaMaximaKm: undefined as unknown as number,
      caja: { minLat: -0.1, maxLat: 0.1, minLng: -0.1, maxLng: 0.1 },
      sectores: [
        {
          id: 'centro',
          nombre: 'Centro',
          centro: { latitud: 0, longitud: 0 },
          poligono: [
            [-0.0001, -0.0001],
            [-0.0001, 0.0001],
            [0.0001, 0.0001],
            [0.0001, -0.0001],
          ],
        },
      ],
    } as unknown as CatalogoSectores;

    expect(sectorDeCoordenadas(sinUmbral, 0.001, 0)?.sector.nombre).toBe('Centro');
  });
});
