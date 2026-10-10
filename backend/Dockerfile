FROM node:22-alpine

WORKDIR /app

# Primero las dependencias, así la capa se cachea y no se reinstala
# en cada cambio de código.
COPY package*.json ./
RUN npm ci

# El schema de Prisma es necesario para generar el cliente en el build.
COPY prisma ./prisma
COPY prisma.config.ts tsconfig.json ./

# El código se copia antes de compilar para que tsx pueda leerlo al aplicar
# las migraciones (las migraciones son TypeScript en este proyecto).
COPY src ./src
COPY scripts ./scripts

RUN npm run build

# El servidor corre sobre el JS compilado.
EXPOSE 3000

# Aplica las migraciones pendientes y recién después levanta la API.
# Si falla la migración, el contenedor no arranca.
CMD ["sh", "-c", "npx prisma migrate deploy && node src/app.js"]