import { describe, expect, it } from 'vitest';
import {
  esCategoriaReporte,
  esDistanciaReporte,
  esVolumenReporte,
} from './opcionesReporte';

describe('guards de opciones de reporte', () => {
  it('acepta las categorías del catálogo', () => {
    expect(esCategoriaReporte('Vegetación seca')).toBe(true);
    expect(esCategoriaReporte('Escombros')).toBe(true);
  });

  it('rechaza categorías inventadas o de otro tipo', () => {
    expect(esCategoriaReporte('Cualquier cosa')).toBe(false);
    expect(esCategoriaReporte('')).toBe(false);
    expect(esCategoriaReporte(null)).toBe(false);
    expect(esCategoriaReporte(42)).toBe(false);
  });

  it('acepta los volúmenes del catálogo', () => {
    expect(esVolumenReporte('Pequeño (una bolsa)')).toBe(true);
    expect(esVolumenReporte('Muy grande (un camión)')).toBe(true);
    expect(esVolumenReporte('Enorme')).toBe(false);
  });

  it('acepta las distancias del catálogo', () => {
    expect(esDistanciaReporte('Menos de 10 m')).toBe(true);
    expect(esDistanciaReporte('Más de 100 m')).toBe(true);
    expect(esDistanciaReporte('Lejos')).toBe(false);
  });
});
