const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { cargarOrigenes, normalizarOrigen } = require('../src/config/cors');
const { crearCors } = require('../src/middlewares/cors');

const ORIGEN = 'http://localhost:5173';
const ORIGEN_LAN = 'http://192.168.1.122:5173';

const iniciarApi = async (frontendUrl) => {
  process.env.FRONTEND_URL = frontendUrl;

  const app = express();
  app.use(crearCors());
  app.get('/x', (req, res) => res.json({ ok: true }));

  return new Promise((resolve, reject) => {
    const servidor = app.listen(0, '127.0.0.1', () => {
      const { port } = servidor.address();
      resolve({
        url: `http://127.0.0.1:${port}`,
        cerrar: () => new Promise((listo) => servidor.close(listo)),
      });
    });
    servidor.on('error', reject);
  });
};

const pedir = async (url, opciones = {}) => {
  const respuesta = await fetch(url, opciones);
  return {
    estado: respuesta.status,
    headers: respuesta.headers,
    cuerpo: await respuesta.text(),
  };
};

test('normaliza orígenes y acepta listas separadas por coma', () => {
  assert.equal(normalizarOrigen('http://localhost:5173/'), ORIGEN);
  assert.deepEqual([...cargarOrigenes(`${ORIGEN}/,${ORIGEN_LAN}`)], [ORIGEN, ORIGEN_LAN]);
});

test('rechaza configuraciones inválidas', () => {
  for (const valor of ['', '*', 'ftp://localhost:5173', `${ORIGEN},*`, 'no-es-una-url']) {
    assert.throws(() => cargarOrigenes(valor));
  }
});

test('permite el preflight de un origen permitido', async () => {
  const api = await iniciarApi(ORIGEN);

  try {
    const respuesta = await pedir(`${api.url}/x`, {
      method: 'OPTIONS',
      headers: {
        Origin: ORIGEN,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'authorization,content-type',
      },
    });

    assert.equal(respuesta.estado, 204);
    assert.equal(respuesta.headers.get('access-control-allow-origin'), ORIGEN);
    assert.equal(respuesta.headers.get('access-control-allow-credentials'), null);
    assert.match(respuesta.headers.get('access-control-allow-methods'), /POST/);
    assert.match(respuesta.headers.get('access-control-allow-headers'), /Authorization/i);
    assert.equal(respuesta.headers.get('access-control-max-age'), '600');
  } finally {
    await api.cerrar();
  }
});

test('no entrega cabeceras CORS a un origen no permitido', async () => {
  const api = await iniciarApi(ORIGEN);

  try {
    const respuesta = await pedir(`${api.url}/x`, {
      headers: { Origin: 'http://evil.example' },
    });

    assert.equal(respuesta.headers.get('access-control-allow-origin'), null);
  } finally {
    await api.cerrar();
  }
});

test('permite peticiones sin Origin', async () => {
  const api = await iniciarApi(ORIGEN);

  try {
    const respuesta = await pedir(`${api.url}/x`);

    assert.equal(respuesta.estado, 200);
    assert.equal(respuesta.headers.get('access-control-allow-origin'), null);
  } finally {
    await api.cerrar();
  }
});

test('acepta el segundo origen de la lista y expone Retry-After', async () => {
  const api = await iniciarApi(`${ORIGEN},${ORIGEN_LAN}`);

  try {
    const respuesta = await pedir(`${api.url}/x`, {
      headers: { Origin: ORIGEN_LAN },
    });

    assert.equal(respuesta.estado, 200);
    assert.equal(respuesta.headers.get('access-control-allow-origin'), ORIGEN_LAN);
    assert.equal(respuesta.headers.get('access-control-expose-headers'), 'Retry-After');
  } finally {
    await api.cerrar();
  }
});
