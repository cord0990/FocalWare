# FocalWare: backend

API REST de FocalWare hecha con Node.js, Express y PostgreSQL.

## Estructura

```
backend/
├── src/
│   ├── routes/         # Definición de endpoints
│   ├── controllers/    # Reciben la petición y responden
│   ├── services/       # Lógica y consultas a la base de datos
│   ├── middlewares/    # Sesión, roles y manejo de errores
│   ├── db/             # Conexión a PostgreSQL
│   └── app.js          # Punto de entrada de la API
├── database/
│   └── focalware.sql   # Tablas, claves y datos de prueba
├── uploads/
│   ├── reportes/       # Fotos que suben los vecinos
│   └── controles/      # Fotos de evidencia de los funcionarios
├── .env.example
└── package.json
```

## Requisitos

- Node.js 20 o superior
- PostgreSQL 14 o superior

## Instalación

1. Crear la base de datos ejecutando `database/focalware.sql` en PostgreSQL.
2. Instalar las dependencias:

   ```bash
   cd backend
   npm install
   ```

3. Copiar `.env.example` como `.env` y completar los datos de conexión.

## Variables de entorno

| Variable | Para qué sirve |
|---|---|
| `PORT` | Puerto donde corre la API |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Datos de conexión a PostgreSQL |
| `FRONTEND_URL` | Dirección del frontend que puede usar la API (CORS) |
| `JWT_SECRETO` | Clave para firmar los tokens de sesión |
| `JWT_EXPIRACION` | Tiempo que dura la sesión, por ejemplo `15m` |

## Ejecución

```bash
npm run dev
```

La API queda en `http://localhost:3000`. Para comprobar que funciona, abrir `http://localhost:3000/api/salud`.

## Imágenes

Las fotos se guardan como archivos en `uploads/` y en la base de datos solo se guarda su ruta (atributo `Ruta_Directorio`). Se pueden ver desde el navegador, por ejemplo: `http://localhost:3000/uploads/reportes/foto.jpg`.

Las fotos no se suben al repositorio, solo las carpetas.

La API recibe las fotos en el campo `fotos` de un formulario (`multipart/form-data`): máximo 5 por envío, solo JPG, PNG o WEBP y de hasta 5 MB cada una.

## Formato de respuestas

Todas las respuestas son JSON:

- Correcta: `{ "ok": true, "data": ... }`
- Con error: `{ "ok": false, "error": "mensaje" }`
