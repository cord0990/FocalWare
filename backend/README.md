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
│   ├── focalware.sql   # Generado desde prisma/schema.prisma
│   └── datos_prueba.sql
├── scripts/
│   └── generarSql.js   # Regenera focalware.sql
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

1. Crear la base de datos ejecutando `database/focalware.sql` en PostgreSQL. Ese archivo se genera desde `prisma/schema.prisma`; si cambias el schema, regeneralo con `npm run db:sql`. Para verificar que el SQL y el schema siguen sincronizados, ejecuta `npm run db:check`.
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
| `FRONTEND_URL` | Orígenes permitidos por CORS, separados por coma. No se permite `*` |
| `JWT_SECRETO` | Clave para firmar los tokens de sesión (mínimo 32 caracteres). En Docker se autogenera si queda vacía |
| `JWT_EXPIRACION` | Tiempo que dura la sesión, por ejemplo `15m` |
| `DATA_ENCRYPTION_KEY` | Clave AES-256-GCM para cifrar datos sensibles (64 caracteres hexadecimales). En Docker se autogenera |

## Ejecución

```bash
npm run dev
```

La API queda en `http://localhost:3000`. Para comprobar que funciona, abrir `http://localhost:3000/api/salud`.

## Imágenes

Las fotos se guardan como archivos en `uploads/` y en la base de datos solo se guarda su ruta (atributo `Ruta_Directorio`). Se pueden ver desde el navegador, por ejemplo: `http://localhost:3000/uploads/reportes/foto.jpg`.

Las fotos no se suben al repositorio, solo las carpetas.

La API recibe las fotos en el campo `fotos` de un formulario (`multipart/form-data`): máximo 5 por envío, solo JPG, PNG o WEBP y de hasta 5 MB cada una.

El tipo se detecta por el contenido real con `file-type`, no por el nombre ni por el MIME que envía el cliente. Por eso un `.html`, `.svg` o texto renombrado se rechaza con `400`, y la extensión guardada (`.jpg`, `.png` o `.webp`) corresponde al contenido. El nombre de cada archivo se genera con un UUID.

Las imágenes se sirven en `/uploads` solo si tienen extensión `.jpg`, `.jpeg`, `.png` o `.webp`, con las cabeceras `X-Content-Type-Options: nosniff`, `Content-Security-Policy: default-src 'none'; sandbox` y `Cross-Origin-Resource-Policy: same-origin`.

## Cálculo del riesgo

El backend calcula el índice de riesgo al crear un reporte, al editarlo, al corregir el desglose y al registrar o quitar apoyos. La fórmula está en `src/dominio/riesgo.js`; el frontend solo la usa para previsualizar mientras se completa el formulario. El cliente no puede imponer el riesgo: si manda un valor, se ignora. La categoría y el volumen también se validan contra las listas cerradas `CATEGORIAS_REPORTE` y `VOLUMENES_REPORTE` de `src/dominio/opcionesReporte.js`.

## Límite de intentos

Login y recuperación de contraseña limitan los intentos por correo y por IP. Al superar el tope responden `429` con la cabecera `Retry-After`. Los valores están en `src/routes/authRoutes.js` y el detalle en `docs/EP2.7-endpoints-y-pruebas.md`.

## Sectores geográficos

El catálogo de sectores vive en `src/dominio/sectores.json` y se expone en `GET /api/sectores`. El backend calcula el sector de cada reporte desde sus coordenadas y guarda la dirección escrita por el vecino en `direccion`. Si la ubicación está fuera del área o a más de `distanciaMaximaKm` del sector más cercano, el reporte nuevo se rechaza.

Para recalcular el sector de reportes existentes:

```bash
npm run db:sectores:check   # solo muestra los cambios
npm run db:sectores         # los aplica
```

El script informa los reportes con coordenadas inválidas y los que quedan lejos del sector más cercano.

## Pruebas

Las pruebas unitarias usan el runner nativo de Node:

```bash
npm test
```

Cubren la fórmula del riesgo, la detección de imágenes por magic bytes, el límite de intentos, las guardas de seguridad (`.env` trackeados, clave por defecto vieja y consultas raw sin parámetros) y el catálogo geográfico de sectores.

## Formato de respuestas

Todas las respuestas son JSON:

- Correcta: `{ "ok": true, "data": ... }`
- Con error: `{ "ok": false, "error": "mensaje" }`

## Cabeceras de seguridad

Todas las respuestas de la API incluyen
`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` y una CSP restrictiva.
Express no envía `X-Powered-By`.
El frontend servido por nginx agrega su propia CSP y el resto de cabeceras;
HSTS se agrega solo en despliegues con HTTPS.

## Datos sensibles

Los teléfonos de vecinos y funcionarios y la dirección exacta de los reportes se cifran con **AES-256-GCM** en `src/services/cryptoService.js`.

- En Docker, `DATA_ENCRYPTION_KEY` se genera y persiste en el volumen `focalware_appdata`.
- Fuera de Docker hay que definirla en `backend/.env` (64 caracteres hexadecimales).
- Los valores existentes en texto plano se migran con `npm run db:encrypt`.
- `npm run db:encrypt:check` falla si queda algún valor sin cifrar o si la clave no puede descifrarlo.

La misma clave debe conservarse entre reinicios y despliegues.

## Pruebas del backend

Además de la colección de Postman, hay pruebas unitarias/integración con el runner nativo de Node:

```bash
cd backend
npm run test:backend
```

Incluyen la validación de `FRONTEND_URL` y el comportamiento del middleware de CORS: orígenes permitidos, preflight, orígenes rechazados y peticiones sin `Origin`.
