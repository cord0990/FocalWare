// El frontend manda la cercanía como una de las cuatro categorías de
// `opcionesReporte`, pero la base guarda los metros. Estas funciones traducen
// entre los dos formatos y las comparten los servicios de reportes y de riesgo.
const { DISTANCIAS, esDistanciaReporte } = require('./opcionesReporte');

// Se usa el punto medio de cada rango.
const DISTANCIAS_A_METROS = Object.freeze({
  [DISTANCIAS.MENOS_10]: 5,
  [DISTANCIAS.ENTRE_10_50]: 30,
  [DISTANCIAS.ENTRE_50_100]: 75,
  [DISTANCIAS.MAS_100]: 150,
});

const metrosDeDistancia = (valor) => {
  if (valor === undefined || valor === null || valor === '') return null;
  if (typeof valor === 'number') return valor;
  return esDistanciaReporte(valor) ? DISTANCIAS_A_METROS[valor] : null;
};

const categoriaDeDistancia = (metros) => {
  if (metros === null || metros === undefined) return '';
  const numero = Number(metros);
  if (numero < 10) return DISTANCIAS.MENOS_10;
  if (numero <= 50) return DISTANCIAS.ENTRE_10_50;
  if (numero <= 100) return DISTANCIAS.ENTRE_50_100;
  return DISTANCIAS.MAS_100;
};

module.exports = { metrosDeDistancia, categoriaDeDistancia };
