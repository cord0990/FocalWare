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

## Ejecución

```bash
npm run dev
```

La API queda en `http://localhost:3000`. Para comprobar que funciona, abrir `http://localhost:3000/api/salud`.

## Formato de respuestas

Todas las respuestas son JSON:

- Correcta: `{ "ok": true, "data": ... }`
- Con error: `{ "ok": false, "error": "mensaje" }`
