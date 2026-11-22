const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { crearLimitador, porEmail } = require('../src/middlewares/limiteIntentos');

const respuesta = () => {
  const res = new EventEmitter();
  res.statusCode = 200;
  res.headers = {};
  res.set = (nombre, valor) => {
    res.headers[nombre] = valor;
    return res;
  };
  res.status = (codigo) => {
    res.statusCode = codigo;
    return res;
  };
  res.json = (cuerpo) => {
    res.cuerpo = cuerpo;
    return res;
  };
  return res;
};

// Ejecuta un intento. Si el limitador deja pasar la petición, simula el final
// de la respuesta con el estado indicado para que cuente (o no) el intento.
const intento = (limitador, clave, estado = 401) => {
  const req = { clave };
  const res = respuesta();
  let siguio = false;

  limitador(req, res, () => {
    siguio = true;
  });

  if (siguio) {
    res.statusCode = estado;
    res.emit('finish');
  }

  return { res, siguio };
};

test('bloquea con 429 y Retry-After al superar el máximo', () => {
  const limitador = crearLimitador({
    nombre: 'prueba-429',
    maximo: 2,
    ventanaMs: 60000,
    obtenerClave: (req) => req.clave,
  });

  assert.equal(intento(limitador, 'a').siguio, true);
  assert.equal(intento(limitador, 'a').siguio, true);

  const bloqueado = intento(limitador, 'a');
  assert.equal(bloqueado.siguio, false);
  assert.equal(bloqueado.res.statusCode, 429);
  assert.equal(bloqueado.res.cuerpo.ok, false);
  assert.ok(Number(bloqueado.res.headers['Retry-After']) > 0);
});

test('un login exitoso reinicia el contador por correo', () => {
  const limitador = crearLimitador({
    nombre: 'prueba-reinicio',
    maximo: 2,
    ventanaMs: 60000,
    obtenerClave: (req) => req.clave,
    reiniciarEnExito: true,
  });

  intento(limitador, 'b');
  intento(limitador, 'b', 200);
  intento(limitador, 'b');
  intento(limitador, 'b');

  assert.equal(intento(limitador, 'b').siguio, false);
});

test('con contarExitos también cuentan las respuestas correctas', () => {
  const limitador = crearLimitador({
    nombre: 'prueba-exitos',
    maximo: 2,
    ventanaMs: 60000,
    obtenerClave: (req) => req.clave,
    contarExitos: true,
  });

  intento(limitador, 'c', 200);
  intento(limitador, 'c', 200);

  assert.equal(intento(limitador, 'c', 200).siguio, false);
});

test('sin clave no limita', () => {
  const limitador = crearLimitador({
    nombre: 'prueba-sin-clave',
    maximo: 1,
    ventanaMs: 60000,
    obtenerClave: () => null,
  });

  assert.equal(intento(limitador, 'd').siguio, true);
  assert.equal(intento(limitador, 'd').siguio, true);
});

test('la ventana vencida reinicia el contador', async () => {
  const limitador = crearLimitador({
    nombre: 'prueba-ventana',
    maximo: 1,
    ventanaMs: 10,
    obtenerClave: (req) => req.clave,
  });

  intento(limitador, 'e');
  assert.equal(intento(limitador, 'e').siguio, false);

  await new Promise((listo) => setTimeout(listo, 25));
  assert.equal(intento(limitador, 'e').siguio, true);
});

test('normaliza el correo y devuelve null si falta', () => {
  assert.equal(porEmail({ body: { email: '  A@B.CL ' } }), 'a@b.cl');
  assert.equal(porEmail({ body: {} }), null);
  assert.equal(porEmail({ body: { email: '' } }), null);
});
