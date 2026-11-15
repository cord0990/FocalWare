const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { spawn, spawnSync } = require('child_process');

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
// Se resuelve el CLI de Prisma y se ejecuta con el propio Node para no depender
// de npx (que en Windows es npx.cmd y podría intentar descargar el paquete).
const prismaCli = require.resolve('prisma/build/index.js');
const migrate = spawnSync(process.execPath, [prismaCli, 'migrate', 'deploy'], {
  stdio: 'inherit',
  env: process.env,
});
if (migrate.error) {
  console.error(migrate.error);
  process.exit(1);
}
if (migrate.status !== 0) {
  process.exit(migrate.status ?? 1);
}

// Ejecuta el comando indicado por CMD (por defecto: node src/app.js).
const [cmd, ...args] = process.argv.slice(2);
if (!cmd) {
  console.error('No se indicó comando a ejecutar');
  process.exit(1);
}

// Con spawn (y no spawnSync) el entrypoint puede reenviar las señales al
// proceso hijo: así "docker stop/restart" cierra la API en el acto en vez de
// esperar el timeout de Docker y matarla con SIGKILL.
const run = spawn(cmd, args, { stdio: 'inherit', env: process.env });

for (const senal of ['SIGTERM', 'SIGINT', 'SIGHUP']) {
  process.on(senal, () => {
    try {
      run.kill(senal);
    } catch {
      // El hijo ya terminó; no hay a quién reenviar.
    }
  });
}

run.on('error', (error) => {
  console.error(error);
  process.exit(1);
});

run.on('exit', (code, signal) => {
  if (code !== null) {
    process.exit(code);
  }
  // Si el hijo murió por una señal, el código 128+n permite distinguir
  // un cierre normal de una terminación forzada (por ejemplo, SIGTERM = 143).
  process.exit(signal ? 128 + (os.constants.signals[signal] ?? 0) : 0);
});
