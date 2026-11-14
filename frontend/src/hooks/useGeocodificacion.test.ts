import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGeocodificacion } from './useGeocodificacion';
import { consultarPunto } from '../services/geocodificacionService';

vi.mock('../services/geocodificacionService', () => ({
  consultarPunto: vi.fn(),
  buscarDirecciones: vi.fn().mockResolvedValue([]),
}));

const valparaiso = { latitud: -33.045, longitud: -71.615 };
const buenosAires = { latitud: -34.603, longitud: -58.381 };

describe('useGeocodificacion', () => {
  beforeEach(() => {
    vi.mocked(consultarPunto).mockReset();
  });

  it('acepta un punto en Chile y autocompleta el sector', async () => {
    vi.mocked(consultarPunto).mockResolvedValue({
      estado: 'chile',
      direccion: 'Valparaíso, Chile',
    });

    const { result } = renderHook(() => useGeocodificacion());

    let aceptado = false;
    await act(async () => {
      aceptado = await result.current.cambiarUbicacion(valparaiso);
    });

    expect(aceptado).toBe(true);
    expect(result.current.ubicacion).toEqual(valparaiso);
    expect(result.current.sector).toBe('Valparaíso, Chile');
    expect(result.current.errorUbicacion).toBe('');
  });

  it('rechaza un punto fuera de Chile y avisa', async () => {
    vi.mocked(consultarPunto).mockResolvedValue({
      estado: 'otro',
      direccion: null,
    });

    const onError = vi.fn();
    const { result } = renderHook(() => useGeocodificacion('', null, onError));

    let aceptado = true;
    await act(async () => {
      aceptado = await result.current.cambiarUbicacion(buenosAires);
    });

    expect(aceptado).toBe(false);
    expect(result.current.ubicacion).toBeNull();
    expect(result.current.errorUbicacion).toBe('La ubicación debe estar dentro de Chile.');
    expect(onError).toHaveBeenCalledWith('La ubicación debe estar dentro de Chile.');
  });

  it('vuelve a la última ubicación válida si el nuevo punto está fuera', async () => {
    vi.mocked(consultarPunto).mockResolvedValueOnce({
      estado: 'chile',
      direccion: 'Valparaíso, Chile',
    });

    const { result } = renderHook(() => useGeocodificacion());

    await act(async () => {
      await result.current.cambiarUbicacion(valparaiso);
    });

    vi.mocked(consultarPunto).mockResolvedValueOnce({
      estado: 'otro',
      direccion: null,
    });

    await act(async () => {
      await result.current.cambiarUbicacion(buenosAires);
    });

    expect(result.current.ubicacion).toEqual(valparaiso);
  });

  it('mantiene el pin si no se pudo verificar el país', async () => {
    vi.mocked(consultarPunto).mockResolvedValue({
      estado: 'desconocido',
      direccion: null,
    });

    const { result } = renderHook(() => useGeocodificacion());

    let aceptado = false;
    await act(async () => {
      aceptado = await result.current.cambiarUbicacion(valparaiso);
    });

    expect(aceptado).toBe(true);
    expect(result.current.ubicacion).toEqual(valparaiso);
    expect(result.current.errorUbicacion).toBe('');
  });
});
