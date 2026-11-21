#!/usr/bin/env node
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const RAIZ_BACKEND = path.resolve(__dirname, '..');
const RUTA_SCHEMA = path.join(RAIZ_BACKEND, 'prisma', 'schema.prisma');
const RUTA_SQL = path.join(RAIZ_BACKEND, 'database', 'focalware.sql');
const RUTA_PRISMA = path.join(
  RAIZ_BACKEND,
  'node_modules',
  'prisma',
  'build',
  'index.js',
);

const ENCABEZADO = `-- ARCHIVO GENERADO DESDE prisma/schema.prisma.
-- NO EDITAR A MANO.
--
-- Regenerar con:
--   cd backend
--   npm run db:sql
--
-- ADVERTENCIA: este script elimina y recrea la base focalware.
-- No ejecutarlo sobre una base con datos que se quieran conservar.
--
-- Uso:
--   psql -U postgres -h localhost -f backend/database/focalware.sql

\\set ON_ERROR_STOP on
\\connect postgres
DROP DATABASE IF EXISTS focalware WITH (FORCE);
CREATE DATABASE focalware ENCODING 'UTF8' TEMPLATE template0;
\\connect focalware
SET client_encoding = 'UTF8';
`;

const PIE = `
-- Datos de prueba
\\ir datos_prueba.sql
`;

const generarDdl = () => {
  const ddl = execFileSync(
    process.execPath,
    [RUTA_PRISMA, 'migrate', 'diff', '--from-empty', `--to-schema=${RUTA_SCHEMA}`, '--script'],
    {
      cwd: RAIZ_BACKEND,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'inherit'],
    },
  );

  return ddl.trimEnd();
};

const contenido = `${ENCABEZADO}\n${generarDdl()}\n${PIE}`;
const verificar = process.argv.includes('--check');

if (verificar) {
  if (!fs.existsSync(RUTA_SQL)) {
    console.error('No existe backend/database/focalware.sql. Ejecutá: npm run db:sql');
    process.exit(1);
  }

  const actual = fs.readFileSync(RUTA_SQL, 'utf8');
  if (actual !== contenido) {
    console.error('focalware.sql está desactualizado respecto de prisma/schema.prisma.');
    console.error('Ejecutá: npm run db:sql');
    process.exit(1);
  }

  console.log('focalware.sql está sincronizado con prisma/schema.prisma.');
} else {
  fs.writeFileSync(RUTA_SQL, contenido);
  console.log('focalware.sql generado desde prisma/schema.prisma.');
}
