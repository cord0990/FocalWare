# FocalWare · Backend

API REST de **FocalWare**, plataforma de reportes georreferenciados de residuos y material combustible en los cerros de Valparaíso, con priorización de la atención municipal según un índice de riesgo de incendio.

Este README corresponde a la rama `backend`. La documentación general del proyecto está en el [README principal](../README.md) y el detalle de la estructura del servidor en [EP 2.1 · Estructura del Backend](docs/EP2.1-estructura-backend.md).

## Tabla de contenidos

- [Tecnologías](#tecnologías)
- [Estructura](#estructura)
- [Requisitos previos](#requisitos-previos)
- [Variables de entorno](#variables-de-entorno)
- [Instalación y ejecución con Docker](#instalación-y-ejecución-con-docker-recomendado)
- [Ejecución sin Docker](#ejecución-sin-docker)
- [Base de datos y migraciones](#base-de-datos-y-migraciones)
- [Datos de prueba](#datos-de-prueba)
- [Autenticación y roles](#autenticación-y-roles)
- [Endpoints](#endpoints)
- [Equipo](#equipo)

## Tecnologías

| Capa | Herramienta |
|---|---|
| Servidor | Node.js con Express (JavaScript); la capa de acceso a datos está en TypeScript |
| Base de datos | PostgreSQL |
| Acceso a datos | Prisma ORM 7, con el adaptador `@prisma/adapter-pg` |
| Autenticación | JWT (`jsonwebtoken`) y contraseñas con bcrypt (`bcryptjs`) |
| Subida de fotos | multer |
| Configuración y CORS | `dotenv` (variables de entorno) y `cors` |
| Servicio externo | Open-Meteo (temperatura, humedad y viento) |
| Despliegue | Docker y Docker Compose |

## Estructura

```
backend/
├── src/
│   ├── routes/         Definición de endpoints
│   ├── middlewares/    Sesión, roles, validaciones y subida de fotos
│   ├── controllers/    Lógica de cada endpoint
│   ├── services/       Lógica de negocio (seguridad, clima, riesgo)
│   ├── db/             Acceso a la base de datos con Prisma
│   │   ├── cliente.ts        Instancia única de PrismaClient
│   │   ├── tipos.ts          Tipos de las entidades y de los filtros
│   │   ├── index.ts          Punto de entrada (importar desde acá)
│   │   └── repositorios/     Consultas agrupadas por entidad
│   └── app.js          Enciende el servidor (punto de entrada)
├── prisma.config.ts    Configuración de Prisma
├── prisma/
│   ├── schema.prisma   Modelo de datos (fuente de verdad)
│   └── migrations/     Historial de cambios de la base
├── database/
│   ├── focalware.sql       Esquema inicial como documentación
│   └── datos_prueba.sql    Datos de prueba
└── uploads/
    ├── reportes/       Fotos de los vecinos
    └── controles/      Fotos de los funcionarios
```

Los controladores no llaman a Prisma directamente: usan siempre los repositorios de `src/db/repositorios`. El cliente que genera Prisma queda en `src/db/generated/` y no se versiona.

## Requisitos previos

- Node.js 18 o superior y npm 9 o superior
- Docker y Docker Compose

## Variables de entorno

Copiar el archivo de ejemplo y completarlo:

```bash
cp .env.example .env
```

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL | `postgresql://postgres:postgres@localhost:5434/focalware` |
| `JWT_SECRETO` | Clave de firma de los tokens | valor propio |
| `JWT_EXPIRACION` | Tiempo que dura la sesión | `15m` |

El archivo `.env` no se versiona (está en `.gitignore`). Nunca se deben subir claves reales al repositorio.

## Instalación y ejecución con Docker (recomendado)

Desde la raíz del repositorio:

```bash
docker compose up -d --build
```

Esto levanta dos servicios: la base de datos PostgreSQL y la API. El contenedor de la API aplica las migraciones de Prisma antes de arrancar, así que las tablas se crean solas.

| Servicio | Puerto | Qué es |
|---|---|---|
| `db` | 5434 | PostgreSQL con el volumen `pgdata`. Usa el 5434 para no chocar con un PostgreSQL instalado en el equipo |
| `api` | 3000 | La API, con las migraciones aplicadas al iniciar |

La API queda en `http://localhost:3000`. Para comprobar que funciona:

```
GET http://localhost:3000/api/salud
```

Para detener todo y borrar la base (se reconstruye sola al volver a levantar):

```bash
docker compose down -v
```

## Ejecución sin Docker

Solo la base de datos va en Docker; la API corre directamente en tu equipo:

```bash
cd backend
npm install
cp .env.example .env     # completar DATABASE_URL

docker compose up -d db  # solo la base
npm run db:migrate       # crea las tablas
npm run build            # genera el cliente de Prisma y compila TypeScript a dist/
npm run dev              # la API en http://localhost:3000
```

## Base de datos y migraciones

El modelo está en `prisma/schema.prisma` y su historial en `prisma/migrations`. El archivo `database/focalware.sql` queda como documentación del esquema inicial: **si hay diferencias, mandan las migraciones.**

Son 12 tablas: `vecino`, `funcionario`, `cuadrilla`, `puede_pertenecer`, `revision`, `reporte`, `imagen_reporte`, `votos`, `log`, `notificacion`, `reporte_control` e `imagen_control`. La correspondencia con los modelos de Prisma está en la sección 6.5 del [EP 2.1](docs/EP2.1-estructura-backend.md).

Para cambiar el modelo: editar `schema.prisma`, correr `npm run db:migrate` (o `npx prisma migrate dev --name <nombre>`), y subir el cambio junto con la carpeta nueva de `prisma/migrations`.

Comandos útiles:

| Comando | Qué hace |
|---|---|
| `npm start` | Levanta la API (`node src/app.js`) |
| `npm run dev` | Levanta la API en modo desarrollo, reiniciando al guardar cambios |
| `npm run build` | Genera el cliente de Prisma y compila TypeScript a `dist/` |
| `npm run typecheck` | Revisa los tipos sin generar nada |
| `npm run db:migrate` | Crea y aplica migraciones en desarrollo (`prisma migrate dev`) |
| `npm run db:deploy` | Aplica las migraciones ya existentes, sin crear nuevas (`prisma migrate deploy`) |
| `npm run db:generate` | Regenera el cliente de Prisma |
| `npm run db:studio` | Abre Prisma Studio para ver los datos |
| `npm run db:reset` | Borra y recrea la base aplicando las migraciones |

## Datos de prueba

`database/datos_prueba.sql` trae 3 vecinos, 2 funcionarios, 3 cuadrillas y 7 reportes en distintos estados, con votos, historial y notificaciones. La contraseña de todos los usuarios de prueba es `Clave123`.

| Usuario | Correo | Rol |
|---|---|---|
| Valentina Rojas | valentina.rojas@correo.cl | Vecino |
| Javiera Muñoz | javiera.munoz@focalware.cl | Funcionario |

Si la base se creó con Docker, los datos se cargan desde la raíz del repositorio con:

```bash
docker exec -i focalware-db psql -U postgres -d focalware < backend/database/datos_prueba.sql
```

Si la base se creó con `focalware.sql`, los datos ya vienen cargados.

## Autenticación y roles

- Las contraseñas se guardan con **bcrypt**; nunca en texto plano.
- Al iniciar sesión se entrega un **JWT** con expiración de 15 minutos.
- Hay dos roles: **Vecino** (crea y apoya reportes, ve sus reportes y recibe notificaciones) y **Funcionario municipal** (gestiona la cola priorizada, asigna cuadrillas, cambia estados y sube controles).
- Solo los vecinos se registran. Los funcionarios existen desde los datos de prueba.
- Las rutas protegidas exigen el token en la cabecera `Authorization`, y cada ruta valida además el rol que corresponde.

## Endpoints

Todas las respuestas son JSON con el mismo formato:

```json
{ "ok": true, "data": { } }
{ "ok": false, "error": "mensaje" }
```

Resumen por módulo (el detalle, las reglas y el orden de implementación están en el [EP 2.1](docs/EP2.1-estructura-backend.md)):

| Módulo | Endpoints principales | Acceso |
|---|---|---|
| Salud | `GET /api/salud` | Público |
| Cuentas | `POST /api/auth/registro`, `POST /api/auth/login`, `GET /api/auth/perfil` | Público / sesión |
| Reportes | `GET /api/reportes`, `GET /api/reportes/{id}`, `GET /api/reportes/mios`, `POST /api/reportes`, `PUT /api/reportes/{id}` | Público / Vecino |
| Votos | `POST` y `DELETE /api/reportes/{id}/votos` | Vecino |
| Gestión municipal | `GET /api/revisiones/cola`, `POST /api/reportes/{id}/revision`, `PUT /api/revisiones/{id}`, `GET /api/revisiones/{id}/historial`, `GET /api/cuadrillas` | Funcionario |
| Controles | `POST` y `GET /api/revisiones/{id}/controles` | Funcionario |
| Notificaciones | `GET /api/notificaciones`, `PUT /api/notificaciones/{id}/leida` | Vecino |
| Estadísticas | `GET /api/estadisticas`, `GET /api/estadisticas/csv` | Funcionario |

Códigos HTTP usados: 200, 201, 400, 401, 403, 404, 409 y 500.

## Equipo

| Integrante | Responsabilidades |
|---|---|
| Diego Cordova | Desarrollo web y Diseño UI/UX en Figma |
| Macarena Catalan | Diseño UI/UX en Figma y Documentación |
| Agustín Guzmán | Desarrollo web y Diseño UI/UX en Figma |
| Daniel Castro | Diseño UI/UX en Figma y Documentación |

