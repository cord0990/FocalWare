import { describe, expect, it } from 'vitest';
// Fixture compartido con backend/test/riesgo.test.js.
import fixtures from './riesgo-fixtures.json';
import type { Clima } from '../services/climaService';
import {
  calcularIndice,
  esCategoriaReporte,
  esDistanciaReporte,
  esVolumenReporte,
  type CategoriaReporte,
  type DistanciaReporte,
  type VolumenReporte,
} from './opcionesReporte';

interface CasoRiesgo {
  nombre: string;
  categoria: CategoriaReporte | '';
  volumen: VolumenReporte | '';
  distancia: DistanciaReporte | '';
  votos: number;
  clima?: Clima;
  indice: number | null;
}

const casosRiesgo = fixtures as CasoRiesgo[];

const clima = (condiciones: number) => {
  const valores = [
    { temperatura: 20, humedad: 50, viento: 10 },
    { temperatura: 31, humedad: 50, viento: 10 },
    { temperatura: 31, humedad: 20, viento: 10 },
    { temperatura: 31, humedad: 20, viento: 40 },
  ];
  return { ...valores[condiciones], condicion: 'Despejado' };
};

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

describe('cálculo del índice', () => {
  const base = {
    categoria: 'Vegetación seca' as const,
    volumen: 'Muy grande (un camión)' as const,
    distancia: 'Menos de 10 m' as const,
    votos: 0,
  };

  it('coincide con los fixtures compartidos con el backend', () => {
    for (const caso of casosRiesgo) {
      const resultado = calcularIndice({
        categoria: caso.categoria,
        volumen: caso.volumen,
        distancia: caso.distancia,
        votos: caso.votos,
        ...(caso.clima ? { clima: caso.clima } : {}),
      });

      expect(resultado.indice, caso.nombre).toBe(caso.indice);
    }
  });

  it('aplica la base y el factor climático', () => {
    expect(calcularIndice({ ...base, clima: clima(0) }).indice).toBe(60);
    expect(calcularIndice({ ...base, clima: clima(1) }).indice).toBe(69);
    expect(calcularIndice({ ...base, clima: clima(2) }).indice).toBe(78);
    expect(calcularIndice({ ...base, clima: clima(3) }).indice).toBe(90);
  });

  it('devuelve null si falta un dato del desglose', () => {
    expect(
      calcularIndice({ categoria: '', volumen: base.volumen, distancia: base.distancia, votos: 0 }).indice,
    ).toBeNull();
  });
});
