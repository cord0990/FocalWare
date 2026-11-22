const test = require('node:test');
const assert = require('node:assert/strict');
const {
  CATEGORIAS_REPORTE,
  VOLUMENES_REPORTE,
  DISTANCIAS_REPORTE,
  esCategoriaReporte,
  esVolumenReporte,
  esDistanciaReporte,
} = require('../src/dominio/opcionesReporte');
const {
  CATEGORIAS,
  VOLUMENES,
  DISTANCIAS_RIESGO,
} = require('../src/dominio/riesgo');

const valores = (opciones) =>
  opciones
    .map((opcion) => (typeof opcion === 'string' ? opcion : opcion.valor))
    .sort();

test('las listas cerradas coinciden con las opciones del cálculo de riesgo', () => {
  assert.deepEqual(valores(CATEGORIAS_REPORTE), valores(CATEGORIAS));
  assert.deepEqual(valores(VOLUMENES_REPORTE), valores(VOLUMENES));
  assert.deepEqual(valores(DISTANCIAS_REPORTE), valores(DISTANCIAS_RIESGO));
});

test('las listas cerradas están congeladas', () => {
  assert.equal(Object.isFrozen(CATEGORIAS_REPORTE), true);
  assert.equal(Object.isFrozen(VOLUMENES_REPORTE), true);
  assert.equal(Object.isFrozen(DISTANCIAS_REPORTE), true);
});

test('las categorías aceptan solo valores de la lista', () => {
  for (const valor of CATEGORIAS_REPORTE) {
    assert.equal(esCategoriaReporte(valor), true, valor);
  }

  for (const valor of ['Basura', 'categoria', '', ' Microbasural ', null, undefined, 42, {}]) {
    assert.equal(esCategoriaReporte(valor), false, String(valor));
  }
});

test('los volúmenes aceptan solo valores de la lista', () => {
  for (const valor of VOLUMENES_REPORTE) {
    assert.equal(esVolumenReporte(valor), true, valor);
  }

  for (const valor of ['Enorme', 'Mediano', '', ' Mediano (un auto) ', null, undefined, 8, {}]) {
    assert.equal(esVolumenReporte(valor), false, String(valor));
  }
});

test('las distancias aceptan solo valores de la lista', () => {
  for (const valor of DISTANCIAS_REPORTE) {
    assert.equal(esDistanciaReporte(valor), true, valor);
  }

  for (const valor of ['A 5 metros', 'Menos de 10', '', ' Menos de 10 m ', null, undefined, 10, {}]) {
    assert.equal(esDistanciaReporte(valor), false, String(valor));
  }
});
