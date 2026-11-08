FROM node:22-alpine AS build

WORKDIR /app

# Cypress no se usa dentro del contenedor: evita descargar su binario en el build.
ENV CYPRESS_INSTALL_BINARY=0

# Primero las dependencias, así la capa se cachea y no se reinstala cada vez que cambia el código.
COPY package*.json ./
RUN npm ci

COPY . .

# La app pide la API como ruta relativa.
# nginx se encarga de reenviar '/api' y '/uploads' al contenedor del backend.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM nginx:stable-alpine

# Configuración propia: SPA, proxy a la API y límite para subir fotos.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
