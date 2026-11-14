FROM node:22-alpine

WORKDIR /app

# Primero las dependencias, así la capa se cachea y no se reinstala
# en cada cambio de código.
COPY package*.json ./
RUN npm ci

# El schema de Prisma es necesario para generar el cliente en el build.
COPY prisma ./prisma
COPY prisma.config.ts tsconfig.json tsconfig.check.json ./

# El código se copia antes de compilar porque tsc necesita las fuentes.
COPY src ./src

RUN npm run build

# Genera un JWT_SECRETO aleatorio si no se definió uno y lo persiste en /app/data.
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# El servidor corre sobre el JS compilado.
EXPOSE 3000

# Docker puede esperar a que la API y la base respondan antes de dar el
# servicio por levantado. Lo usa el frontend con depends_on.
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/salud').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# El entrypoint asegura el JWT_SECRETO, aplica las migraciones pendientes y recién después levanta la API.
# Si falla la migración, el contenedor no arranca.
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "src/app.js"]
