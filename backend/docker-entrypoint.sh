#!/bin/sh
set -eu

# Si no se definió un secreto, se genera una vez y se guarda en el volumen.
# Así el arranque sigue siendo un solo comando y el secreto sobrevive a
# reinicios y a "docker compose down" (no a "down -v").
ARCHIVO_SECRETO="${JWT_SECRETO_FILE:-/app/data/jwt_secret}"

if [ -z "${JWT_SECRETO:-}" ]; then
  mkdir -p "$(dirname "$ARCHIVO_SECRETO")"
  umask 077

  if [ -s "$ARCHIVO_SECRETO" ]; then
    JWT_SECRETO="$(cat "$ARCHIVO_SECRETO")"
  else
    JWT_SECRETO="$(node -e "process.stdout.write(require('crypto').randomBytes(32).toString('hex'))")"
    printf '%s' "$JWT_SECRETO" > "$ARCHIVO_SECRETO"
    chmod 600 "$ARCHIVO_SECRETO"
    echo "[SEGURIDAD] Se generó un JWT_SECRETO aleatorio en $ARCHIVO_SECRETO"
  fi

  export JWT_SECRETO
fi

# Aplica las migraciones pendientes y después ejecuta el comando del contenedor.
npx prisma migrate deploy
exec "$@"
