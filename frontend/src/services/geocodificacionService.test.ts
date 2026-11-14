import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  obtenerDireccionDesdePunto,
  validarUbicacionEnChile,
} from './geocodificacionService';

const respuestaNominatim = (datos: unknown) =>
  ({
    ok: true,
    json: async () => datos,
  }) as Response;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('validarUbicacionEnChile', () => {
  it('acepta un punto con country_code cl', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        respuestaNominatim({
          display_name: 'Valparaíso, Chile',
          address: { country_code: 'cl', city: 'Valparaíso' },
        }),
      ),
    );

    await expect(validarUbicacionEnChile(-33.101, -71.201)).resolves.toBe(true);
  });

  it('rechaza un punto de otro país', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        respuestaNominatim({
          display_name: 'Mendoza, Argentina',
          address: { country_code: 'ar' },
        }),
      ),
    );

    await expect(validarUbicacionEnChile(-32.202, -68.402)).resolves.toBe(false);
  });

  it('rechaza un punto sin país, como el océano', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        respuestaNominatim({
          display_name: 'Océano Pacífico',
          address: {},
        }),
      ),
    );

    await expect(validarUbicacionEnChile(-35.303, -90.503)).resolves.toBe(false);
  });

  it('acepta por el nombre cuando falta country_code', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        respuestaNominatim({
          display_name: 'Cerro Alegre, Valparaíso, Chile',
          address: {},
        }),
      ),
    );

    await expect(validarUbicacionEnChile(-33.404, -71.604)).resolves.toBe(true);
  });

  it('devuelve null si no se pudo consultar', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('sin red')));

    await expect(validarUbicacionEnChile(-33.505, -71.705)).resolves.toBeNull();
  });
});

describe('obtenerDireccionDesdePunto', () => {
  it('no devuelve dirección para un punto fuera de Chile', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        respuestaNominatim({
          display_name: 'Lima, Perú',
          address: { country_code: 'pe' },
        }),
      ),
    );

    await expect(obtenerDireccionDesdePunto(-12.106, -77.006)).resolves.toBeNull();
  });
});
