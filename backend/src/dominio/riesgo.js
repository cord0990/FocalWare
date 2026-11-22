// Fórmula del índice de riesgo (RF-05).
//
//   base   = categoría + volumen + cercanía + apoyos + antigüedad
//   índice = base × factor climático   (con tope en 100)
//
// Esta es la fuente de verdad: el backend calcula y guarda el índice. El
// frontend mantiene una copia en `frontend/src/utils/opcionesReporte.ts` solo
// para mostrar una previsualización mientras se completa el formulario. Si
// cambian los puntajes, hay que actualizar los dos archivos y sus tests.
const { DISTANCIAS } = require('./opcionesReporte');

const PUNTAJE_MAXIMO_FACTOR = 20;

const CATEGORIAS = Object.freeze([
  { valor: 'Vegetación seca', puntos: 20 },
  { valor: 'Neumáticos', puntos: 17 },
  { valor: 'Microbasural', puntos: 14 },
  { valor: 'Residuos voluminosos', puntos: 11 },
  { valor: 'Escombros', puntos: 6 },
]);

const VOLUMENES = Object.freeze([
  { valor: 'Pequeño (una bolsa)', puntos: 3 },
  { valor: 'Mediano (un auto)', puntos: 8 },
  { valor: 'Grande (una camioneta)', puntos: 14 },
  { valor: 'Muy grande (un camión)', puntos: 20 },
]);

const DISTANCIAS_RIESGO = Object.freeze([
  { valor: DISTANCIAS.MENOS_10, puntos: 20 },
  { valor: DISTANCIAS.ENTRE_10_50, puntos: 13 },
  { valor: DISTANCIAS.ENTRE_50_100, puntos: 7 },
  { valor: DISTANCIAS.MAS_100, puntos: 2 },
]);

// Factor climático según cuántas condiciones de la regla 30-30-30 se cumplen.
const FACTORES_CLIMA = Object.freeze([1, 1.15, 1.3, 1.5]);

// Regla 30-30-30: más de 30 °C, menos de 30 % de humedad y viento sobre 30 km/h.
const condicionesRegla303030 = (clima) => ({
  calor: Number(clima.temperatura) > 30,
  sequedad: Number(clima.humedad) < 30,
  viento: Number(clima.viento) > 30,
});

const puntosApoyos = (votos) =>
  Math.min(PUNTAJE_MAXIMO_FACTOR, Math.max(0, Number(votos) || 0));

const puntosAntiguedad = (fechaCreacion) => {
  if (!fechaCreacion) return 0;

  const creado = new Date(fechaCreacion).getTime();
  if (!Number.isFinite(creado)) return 0;

  const dias = Math.max(0, Math.floor((Date.now() - creado) / 86400000));
  return Math.min(PUNTAJE_MAXIMO_FACTOR, Math.floor(dias / 7));
};

const puntosDe = (opciones, valor) =>
  opciones.find((opcion) => opcion.valor === valor)?.puntos ?? null;

const calcularRiesgo = ({
  categoria,
  volumen,
  distancia,
  votos = 0,
  fechaCreacion,
  clima,
}) => {
  const puntosCategoria = puntosDe(CATEGORIAS, categoria);
  const puntosVolumen = puntosDe(VOLUMENES, volumen);
  const puntosCercania = puntosDe(DISTANCIAS_RIESGO, distancia);
  const apoyos = puntosApoyos(votos);
  const antiguedad = puntosAntiguedad(fechaCreacion);

  const base =
    (puntosCategoria ?? 0) + (puntosVolumen ?? 0) + (puntosCercania ?? 0) + apoyos + antiguedad;

  const condicionesClima = clima ? condicionesRegla303030(clima) : null;
  const cumplidas = condicionesClima
    ? Object.values(condicionesClima).filter(Boolean).length
    : 0;
  const factorClimatico = FACTORES_CLIMA[cumplidas];

  const completo =
    puntosCategoria !== null && puntosVolumen !== null && puntosCercania !== null;

  return {
    categoria: puntosCategoria,
    volumen: puntosVolumen,
    cercania: puntosCercania,
    apoyos,
    antiguedad,
    base,
    condicionesClima,
    factorClimatico,
    indice: completo ? Math.min(100, Math.round(base * factorClimatico)) : null,
  };
};

module.exports = {
  PUNTAJE_MAXIMO_FACTOR,
  CATEGORIAS,
  VOLUMENES,
  DISTANCIAS_RIESGO,
  FACTORES_CLIMA,
  condicionesRegla303030,
  calcularRiesgo,
};
