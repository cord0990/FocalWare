const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const secretFile = process.env.JWT_SECRETO_FILE || '/app/data/jwt_secret';

if (!process.env.JWT_SECRETO) {
  const dir = path.dirname(secretFile);
  fs.mkdirSync(dir, { recursive: true });

  let secret;
  if (fs.existsSync(secretFile) && fs.statSync(secretFile).size > 0) {
    secret = fs.readFileSync(secretFile, 'utf8').trim();
  } else {
    process.umask(0o077);
    secret = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(secretFile, secret, { mode: 0o600 });
    try { fs.chmodSync(secretFile, 0o600); } catch {}
    console.log(`[SEGURIDAD] Se generó un JWT_SECRETO aleatorio en ${secretFile}`);
  }

  process.env.JWT_SECRETO = secret;
}

// Aplica las migraciones pendientes y después ejecuta el comando del contenedor.
// Si falla la migración, el contenedor no arranca.
const migrate = spawnSync('npx', ['prisma', 'migrate', 'deploy'], {
  stdio: 'inherit',
  env: process.env,
});
if (migrate.status !== 0) {
  process.exit(migrate.status ?? 1);
}

// Ejecuta el comando indicado por CMD (por defecto: node src/app.js).
const [cmd, ...args] = process.argv.slice(2);
if (!cmd) {
  console.error('No se indicó comando a ejecutar');
  process.exit(1);
}

const run = spawnSync(cmd, args, { stdio: 'inherit', env: process.env });
process.exit(run.status ?? 0);
