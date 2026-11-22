const test = require('node:test');
const assert = require('node:assert/strict');
const {
  SECTORES,
  CAJA_VALPARAISO,
  DISTANCIA_MAXIMA_KM,
  puntoEnPoligono,
  sectorDeCoordenadas,
  sectorMasCercano,
  esSectorCanonico,
  catalogoSectores,
} = require('../src/dominio/sectores');

test('el catálogo tiene los cinco sectores y el área de Valparaíso', () => {
  assert.equal(SECTORES.length, 5);
  assert.equal(catalogoSectores().sectores.length, 5);
  assert.equal(catalogoSectores().caja.minLat, CAJA_VALPARAISO.minLat);
  assert.equal(typeof catalogoSectores().version, 'string');
  assert.equal(catalogoSectores().distanciaMaximaKm, DISTANCIA_MAXIMA_KM);
});

test('cada reporte del seed cae en su sector', () => {
  const casos = [
    { lat: -33.0418, lng: -71.6335, esperado: 'Cerro Cordillera' },
    { lat: -33.0562, lng: -71.6118, esperado: 'Las Cañas' },
    { lat: -33.0305, lng: -71.6402, esperado: 'Playa Ancha' },
    { lat: -33.0518, lng: -71.5795, esperado: 'Rodelillo' },
    { lat: -33.0561, lng: -71.6452, esperado: 'Playa Ancha' },
    { lat: -33.0433, lng: -71.6268, esperado: 'Cerro Alegre' },
  ];

  for (const caso of casos) {
    const zona = sectorDeCoordenadas(caso.lat, caso.lng);
    assert.equal(zona?.nombre, caso.esperado, `${caso.lat},${caso.lng}`);
    assert.equal(zona?.asignadoPor, 'poligono');
  }
});

test('dentro del área pero fuera de los polígonos asigna el más cercano', () => {
  const zona = sectorDeCoordenadas(-33.025, -71.610);

  assert.ok(zona);
  assert.equal(zona.asignadoPor, 'cercania');
  assert.ok(SECTORES.some((sector) => sector.nombre === zona.nombre));
});

test('fuera del área no asigna sector, pero el más cercano existe', () => {
  assert.equal(sectorDeCoordenadas(-33.45, -70.66), null);

  const cercano = sectorMasCercano(-33.45, -70.66);
  assert.ok(cercano);
  assert.ok(cercano.distanciaKm > 0);
});

test('dentro del área pero demasiado lejos tampoco asigna sector', () => {
  assert.equal(sectorDeCoordenadas(-33.24, -71.94), null);

  const cercano = sectorMasCercano(-33.24, -71.94);
  assert.ok(cercano);
  assert.ok(cercano.distanciaKm > DISTANCIA_MAXIMA_KM);
});

test('el más cercano devuelve null con coordenadas inválidas', () => {
  assert.equal(sectorMasCercano(NaN, NaN), null);
  assert.equal(sectorMasCercano(null, null), null);
  assert.equal(sectorMasCercano(undefined, undefined), null);
});

test('puntoEnPoligono detecta dentro y fuera de un cuadrado', () => {
  const cuadrado = [
    [0, 0],
    [0, 1],
    [1, 1],
    [1, 0],
  ];

  assert.equal(puntoEnPoligono(0.5, 0.5, cuadrado), true);
  assert.equal(puntoEnPoligono(2, 2, cuadrado), false);
});

test('reconoce solo nombres canónicos', () => {
  assert.equal(esSectorCanonico('Cerro Alegre'), true);
  assert.equal(esSectorCanonico('cerro alegre'), false);
  assert.equal(esSectorCanonico('Cualquier cosa'), false);
});
