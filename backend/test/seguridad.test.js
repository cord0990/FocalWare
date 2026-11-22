const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const raiz = path.resolve(__dirname, '..', '..');

const archivosTrackeados = () =>
  execFileSync('git', ['-C', raiz, 'ls-files'], { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);

const archivosExistentes = () =>
  archivosTrackeados().filter((archivo) => fs.existsSync(path.join(raiz, archivo)));

const leer = (archivo) => fs.readFileSync(path.join(raiz, archivo), 'utf8');

test('no hay archivos .env trackeados salvo los ejemplos', () => {
  const env = archivosTrackeados().filter(
    (archivo) => /(^|\/)\.env($|\.)/.test(archivo) && !archivo.endsWith('.env.example'),
  );

  assert.deepEqual(env, []);
});

test('no aparece la clave por defecto vieja en archivos trackeados', () => {
  const patron = ['cambia', 'esta', 'clave'].join('_');
  const extensiones = new Set([
    '.js',
    '.ts',
    '.tsx',
    '.json',
    '.yml',
    '.yaml',
    '.md',
    '.sql',
    '.example',
    '.sh',
    '.txt',
    '.env',
  ]);

  const encontrados = archivosExistentes().filter((archivo) => {
    const extension = path.extname(archivo);
    if (!extensiones.has(extension) && archivo !== '.gitignore') return false;
    return leer(archivo).includes(patron);
  });

  assert.deepEqual(encontrados, []);
});

test('no se usan consultas raw sin parámetros', () => {
  const patrones = [['queryRaw', 'Unsafe'].join(''), ['executeRaw', 'Unsafe'].join('')];
  const fuentes = archivosExistentes().filter(
    (archivo) =>
      (archivo.startsWith('backend/src/') || archivo.startsWith('backend/scripts/')) &&
      /\.(js|ts)$/.test(archivo),
  );

  const encontrados = fuentes.filter((archivo) =>
    patrones.some((patron) => leer(archivo).includes(patron)),
  );

  assert.deepEqual(encontrados, []);
});
