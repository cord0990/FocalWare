const test = require('node:test');
const assert = require('node:assert/strict');
// Fixture compartido con el test del frontend. Vive dentro de frontend/src
// para que también esté disponible en el contexto de build de Docker.
const fixtures = require('../../frontend/src/utils/riesgo-fixtures.json');
const {
  calcularRiesgo,
  condicionesRegla303030,
  CATEGORIAS,
  VOLUMENES,
  DISTANCIAS_RIESGO,
} = require('../src/dominio/riesgo');
const {
  CATEGORIAS_REPORTE,
  VOLUMENES_REPORTE,
  DISTANCIAS_REPORTE,
} = require('../src/dominio/opcionesReporte');

const clima = (condiciones) => {
  // Condiciones de la regla 30-30-30: calor, sequedad y viento.
  const valores = [
    { temperatura: 20, humedad: 50, viento: 10 },
    { temperatura: 31, humedad: 50, viento: 10 },
    { temperatura: 31, humedad: 20, viento: 10 },
    { temperatura: 31, humedad: 20, viento: 40 },
  ];
  return { ...valores[condiciones], condicion: 'Despejado' };
};

const haceDias = (dias) => new Date(Date.now() - dias * 86400000);

const valores = (opciones) =>
  opciones
    .map((opcion) => (typeof opcion === 'string' ? opcion : opcion.valor))
    .sort();

test('coincide con los fixtures compartidos con el frontend', () => {
  for (const caso of fixtures) {
    const resultado = calcularRiesgo({
      categoria: caso.categoria,
      volumen: caso.volumen,
      distancia: caso.distancia,
      votos: caso.votos,
      fechaCreacion: new Date(),
      clima: caso.clima,
    });

    assert.equal(resultado.indice, caso.indice, caso.nombre);
  }
});

test('cada opción válida tiene su puntaje', () => {
  assert.deepEqual(valores(CATEGORIAS), valores(CATEGORIAS_REPORTE));
  assert.deepEqual(valores(VOLUMENES), valores(VOLUMENES_REPORTE));
  assert.deepEqual(valores(DISTANCIAS_RIESGO), valores(DISTANCIAS_REPORTE));

  for (const opcion of [...CATEGORIAS, ...VOLUMENES, ...DISTANCIAS_RIESGO]) {
    assert.equal(typeof opcion.puntos, 'number', opcion.valor);
  }
});

test('calcula la base y aplica el factor climático', () => {
  const base = {
    categoria: 'Vegetación seca',
    volumen: 'Muy grande (un camión)',
    distancia: 'Menos de 10 m',
    votos: 0,
    fechaCreacion: new Date(),
  };

  assert.equal(calcularRiesgo({ ...base, clima: clima(0) }).indice, 60);
  assert.equal(calcularRiesgo({ ...base, clima: clima(1) }).indice, 69);
  assert.equal(calcularRiesgo({ ...base, clima: clima(2) }).indice, 78);
  assert.equal(calcularRiesgo({ ...base, clima: clima(3) }).indice, 90);
});

test('sin clima usa factor 1 y sin datos incompletos devuelve null', () => {
  const completo = calcularRiesgo({
    categoria: 'Escombros',
    volumen: 'Pequeño (una bolsa)',
    distancia: 'Más de 100 m',
    votos: 0,
    fechaCreacion: new Date(),
    clima: null,
  });

  assert.equal(completo.indice, 11);
  assert.equal(completo.factorClimatico, 1);

  assert.equal(
    calcularRiesgo({ volumen: 'Pequeño (una bolsa)', distancia: 'Más de 100 m' }).indice,
    null,
  );
});

test('aplica los topes de apoyos y antigüedad', () => {
  const resultado = calcularRiesgo({
    categoria: 'Vegetación seca',
    volumen: 'Muy grande (un camión)',
    distancia: 'Menos de 10 m',
    votos: 25,
    fechaCreacion: haceDias(200),
    clima: clima(3),
  });

  assert.equal(resultado.apoyos, 20);
  assert.equal(resultado.antiguedad, 20);
  assert.equal(resultado.base, 100);
  assert.equal(resultado.indice, 100);
});

test('la antigüedad suma una unidad por semana', () => {
  const resultado = calcularRiesgo({
    categoria: 'Escombros',
    volumen: 'Pequeño (una bolsa)',
    distancia: 'Más de 100 m',
    votos: 0,
    fechaCreacion: haceDias(21),
    clima: clima(0),
  });

  assert.equal(resultado.antiguedad, 3);
  assert.equal(resultado.indice, 14);
});

test('evalúa cada condición de la regla 30-30-30 por separado', () => {
  assert.deepEqual(condicionesRegla303030(clima(0)), {
    calor: false,
    sequedad: false,
    viento: false,
  });
  assert.deepEqual(condicionesRegla303030(clima(3)), {
    calor: true,
    sequedad: true,
    viento: true,
  });
});
