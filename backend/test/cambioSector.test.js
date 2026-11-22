const test = require('node:test');
const assert = require('node:assert/strict');
const { calcularCambioSector } = require('../src/dominio/cambioSector');

test('convierte un sector viejo no canónico en dirección', () => {
  const cambio = calcularCambioSector({
    idReporte: 7,
    sector: 'Cerro Barón',
    direccion: null,
    latitud: -33.0518,
    longitud: -71.5795,
  });

  assert.equal(cambio.nuevoSector, 'Rodelillo');
  assert.equal(cambio.direccion, 'Cerro Barón');
  assert.equal(cambio.cambiaSector, true);
  assert.equal(cambio.cambiaDireccion, true);
});

test('corrige el sector aunque el viejo fuera canónico', () => {
  const cambio = calcularCambioSector({
    idReporte: 9,
    sector: 'Cerro Cordillera',
    direccion: null,
    latitud: -33.0433,
    longitud: -71.6268,
  });

  assert.equal(cambio.nuevoSector, 'Cerro Alegre');
  assert.equal(cambio.direccion, null);
  assert.equal(cambio.cambiaSector, true);
  assert.equal(cambio.cambiaDireccion, false);
});

test('no cambia nada si el sector y la dirección ya están bien', () => {
  const cambio = calcularCambioSector({
    idReporte: 12,
    sector: 'Cerro Alegre',
    direccion: 'Subida Cerro Alegre',
    latitud: -33.0433,
    longitud: -71.6268,
  });

  assert.equal(cambio.cambiaSector, false);
  assert.equal(cambio.cambiaDireccion, false);
});

test('conserva una dirección que ya existía', () => {
  const cambio = calcularCambioSector({
    idReporte: 14,
    sector: 'Cerro Barón',
    direccion: 'Referencia existente',
    latitud: -33.0518,
    longitud: -71.5795,
  });

  assert.equal(cambio.direccion, 'Referencia existente');
  assert.equal(cambio.cambiaDireccion, false);
});

test('ignora reportes con coordenadas inválidas', () => {
  const casos = [
    { latitud: null, longitud: null },
    { latitud: undefined, longitud: undefined },
    { latitud: NaN, longitud: NaN },
    { latitud: 'no-es-numero', longitud: -71.6 },
  ];

  for (const coordenadas of casos) {
    const cambio = calcularCambioSector({
      idReporte: 1,
      sector: 'Cerro Cordillera',
      direccion: null,
      ...coordenadas,
    });

    assert.equal(cambio, null, JSON.stringify(coordenadas));
  }
});

test('marca como lejano un reporte fuera de los sectores', () => {
  const cambio = calcularCambioSector({
    idReporte: 99,
    sector: 'Cerro Cordillera',
    direccion: null,
    latitud: -33.24,
    longitud: -71.94,
  });

  assert.ok(cambio);
  assert.equal(cambio.cambiaSector, true);
  assert.equal(cambio.lejos, true);
  assert.ok(cambio.distanciaKm > 10);
});
