import { condicionesRegla303030, type Clima } from '../services/climaService';
import { diasDesde } from './fechas';

// Índice de riesgo de un reporte (RF-05), con la estructura definida en el proyecto:
//
//   base   = categoría + volumen + cercanía a viviendas + apoyos vecinales + antigüedad
//   índice = base × factor climático   (con tope en 100)
//
// Cada factor aporta de 0 a 20 puntos, así que la base va de 0 a 100. Los puntajes son valores
// de ejemplo para la Entrega 1; los definitivos se ajustarán en la Entrega 2, cuando el cálculo
// se haga en el backend con el clima real de Open-Meteo.

export const PUNTAJE_MAXIMO_FACTOR = 20;

export const CATEGORIAS = [
  { valor: 'Vegetación seca', puntos: 20 },
  { valor: 'Neumáticos', puntos: 17 },
  { valor: 'Microbasural', puntos: 14 },
  { valor: 'Residuos voluminosos', puntos: 11 },
  { valor: 'Escombros', puntos: 6 },
] as const;

export const VOLUMENES = [
  { valor: 'Pequeño (una bolsa)', puntos: 3 },
  { valor: 'Mediano (un auto)', puntos: 8 },
  { valor: 'Grande (una camioneta)', puntos: 14 },
  { valor: 'Muy grande (un camión)', puntos: 20 },
] as const;

export const DISTANCIAS = [
  { valor: 'Menos de 10 m', puntos: 20 },
  { valor: 'Entre 10 y 50 m', puntos: 13 },
  { valor: 'Entre 50 y 100 m', puntos: 7 },
  { valor: 'Más de 100 m', puntos: 2 },
] as const;

// Apoyos: 1 punto por cada apoyo vecinal, hasta 20.
export const puntosApoyos = (votos: number) => Math.min(PUNTAJE_MAXIMO_FACTOR, votos);

// Antigüedad: 1 punto por cada semana sin resolver, hasta 20.
export const puntosAntiguedad = (dias: number) => Math.min(PUNTAJE_MAXIMO_FACTOR, Math.floor(dias / 7));

// Factor climático según cuántas condiciones de la regla 30-30-30 se cumplen.
export const FACTORES_CLIMA = [1, 1.15, 1.3, 1.5] as const;

const puntosDe = (opciones: readonly { valor: string; puntos: number }[], valor: string) =>
  opciones.find((opcion) => opcion.valor === valor)?.puntos ?? null;

export interface DatosIndice {
  categoria: string;
  volumen: string;
  distancia: string;
  votos: number;
  // Fecha del reporte (AAAA-MM-DD). Si no se indica, se considera un reporte de hoy.
  fecha?: string;
  clima?: Clima;
}

export interface DesgloseIndice {
  categoria: number | null;
  volumen: number | null;
  cercania: number | null;
  apoyos: number;
  antiguedad: number;
  base: number;
  condicionesClima: ReturnType<typeof condicionesRegla303030> | null;
  factorClimatico: number;
  // null si todavía falta categoría, volumen o distancia.
  indice: number | null;
}

export const calcularIndice = (datos: DatosIndice): DesgloseIndice => {
  const categoria = puntosDe(CATEGORIAS, datos.categoria);
  const volumen = puntosDe(VOLUMENES, datos.volumen);
  const cercania = puntosDe(DISTANCIAS, datos.distancia);
  const apoyos = puntosApoyos(datos.votos);
  const antiguedad = puntosAntiguedad(datos.fecha ? diasDesde(datos.fecha) : 0);
  const base = (categoria ?? 0) + (volumen ?? 0) + (cercania ?? 0) + apoyos + antiguedad;

  const condicionesClima = datos.clima ? condicionesRegla303030(datos.clima) : null;
  const cumplidas = condicionesClima ? Object.values(condicionesClima).filter(Boolean).length : 0;
  const factorClimatico = FACTORES_CLIMA[cumplidas];

  const completo = categoria !== null && volumen !== null && cercania !== null;
  return {
    categoria,
    volumen,
    cercania,
    apoyos,
    antiguedad,
    base,
    condicionesClima,
    factorClimatico,
    indice: completo ? Math.min(100, Math.round(base * factorClimatico)) : null,
  };
};
