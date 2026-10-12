# EP 2.1 · Estructura del Backend

**FocalWare** · Priorización de limpieza por riesgo de incendio en las quebradas de Valparaíso

[← Volver al README](../README.md)

---

El backend de FocalWare es una **API REST** hecha con Node.js, Express y PostgreSQL. El acceso a la base de datos se hace con **Prisma ORM**, y esa capa (`src/db`) está escrita en TypeScript; el resto del servidor está en JavaScript. Este documento explica cómo está armado y qué falta hacer, para que cada uno pueda tomar una parte y avanzar.

## 1. Palabras claves para entender este documento

| Palabra | Qué significa |
|---|---|
| **Backend** | La parte de la app que no se ve. Recibe pedidos de la app, los procesa y guarda o busca datos en la base de datos |
| **API** | El conjunto de direcciones que la app puede llamar para pedir o enviar datos |
| **API REST** | Una forma ordenada de armar la API. Cada dirección representa una cosa (reportes, votos, notificaciones), el método dice qué se hace con ella y siempre se responde en JSON |
| **Endpoint** | Una de esas direcciones. Por ejemplo `GET /api/reportes` entrega la lista de reportes |
| **Método** | El tipo de pedido. `GET` es pedir datos, `POST` es crear algo, `PUT` es modificar y `DELETE` es borrar |
| **JSON** | El formato en que se mandan los datos. Se ve así: `{ "titulo": "Basura en quebrada" }` |
| **Token** | Una especie de "pulsera" que recibe el usuario al iniciar sesión. Con ella el backend sabe quién es y si es vecino o funcionario |
| **bcrypt** | Una librería que transforma la contraseña en un texto que no se puede leer. Así en la base nunca queda la contraseña real |
| **multer** | Una librería que recibe las fotos que manda la app y las guarda en la carpeta `uploads` |
| **ORM** | Una herramienta que deja trabajar con la base de datos usando código en vez de escribir SQL a mano. Nosotros usamos **Prisma** |
| **Prisma** | El ORM del proyecto. Lee el archivo `schema.prisma` (donde se describen las tablas) y genera un cliente en TypeScript para consultar la base de forma segura |
| **Migración** | Un archivo que registra un cambio en la estructura de la base (crear una tabla, agregar una columna). Con las migraciones, cualquiera del equipo puede reconstruir la misma base |
| **Repositorio** | Un archivo que junta todas las consultas de una misma entidad (por ejemplo, todo lo de reportes). Es lo único que habla con Prisma |

## 2. Cómo funciona por dentro (ejemplo con restaurante)

Se puede pensar como un restaurante:

| Parte del backend | En el restaurante | Qué hace |
|---|---|---|
| `routes` | La carta | Dice qué cosas se pueden pedir y a quién se le pasa el pedido |
| `middlewares` | El guardia de la puerta | Revisa antes de atender: si tienes sesión, si eres vecino o funcionario, si mandaste fotos |
| `controllers` | El mesero | Recibe el pedido, revisa que venga completo y entrega la respuesta |
| `services` | El cocinero | Hace los cálculos y la lógica: contraseñas, clima, riesgo |
| `db` (repositorios) | La bodega | Guarda y busca datos en PostgreSQL a través de Prisma |

Ejemplo: un vecino abre un reporte en la app.

1. La app pide `GET /api/reportes/15` (15 es el número del reporte, es solo un ejemplo).
2. **routes** ve el pedido y se lo pasa al controlador de reportes.
3. **controllers** saca el número 15 y le pide los datos al repositorio.
4. **db / repositorios** busca el reporte 15 en la base de datos con Prisma.
5. **controllers** le responde a la app con los datos del reporte.

Lo importante es que cada uno hace solo lo suyo. El mesero no cocina y el cocinero no atiende mesas. En particular, **los controladores nunca llaman a Prisma directamente: siempre pasan por los repositorios.**

## 3. Las carpetas de nuestro proyecto

```
backend/
├── src/
│   ├── routes/         La carta: qué direcciones existen
│   ├── middlewares/    El guardia: revisa sesión, rol y fotos
│   ├── controllers/    El mesero: recibe y responde
│   ├── services/       El cocinero: lógica (seguridad, clima, riesgo)
│   ├── db/             La bodega: acceso a la base con Prisma
│   │   ├── cliente.ts        Instancia única de PrismaClient
│   │   ├── tipos.ts          Tipos de las entidades y de los filtros
│   │   ├── index.ts          Punto de entrada (importar desde acá)
│   │   ├── generated/        Cliente generado por Prisma (no se versiona)
│   │   └── repositorios/
│   │       ├── vecinos.ts          vecino, votos y cuadrillas del funcionario
│   │       ├── funcionarios.ts     funcionario, cuadrillas y revisiones asignadas
│   │       ├── revisiones.ts       revisiones, historial y cierre con notificación
│   │       ├── reportes.ts         reportes, filtros, imágenes y votos
│   │       ├── notificaciones.ts   notificaciones del vecino
│   │       └── controles.ts        controles de revisión e imágenes
│   └── app.js          Enciende el backend
├── prisma.config.ts    Configuración de Prisma (acá vive la URL de conexión)
├── prisma/
│   ├── schema.prisma   Descripción de las tablas (fuente de verdad del modelo)
│   └── migrations/     Historial de cambios de la base
├── database/
│   ├── focalware.sql       Esquema inicial como documentación
│   └── datos_prueba.sql    Datos de prueba
└── uploads/
    ├── reportes/       Fotos de los vecinos
    └── controles/      Fotos de los funcionarios
```

Lo que ya está hecho:

- La conexión a la base de datos con Prisma y la capa de repositorios.
- El endpoint `GET /api/salud`, que sirve para comprobar que todo funciona.
- El manejo de errores, que responde siempre con el mismo formato.
- Las carpetas para las fotos.
- Los middlewares `autenticacion.js` (revisa el token), `roles.js` (revisa si es vecino o funcionario) y `validaciones.js` (revisa que lleguen los campos y que el correo y la contraseña tengan buen formato).
- `seguridad.service.js`, que saca el hash de las contraseñas con bcrypt, las compara y crea el token al iniciar sesión.
- El middleware `subirFotos.js`, que recibe hasta 5 fotos (JPG, PNG o WEBP de máximo 5 MB) y las guarda en `uploads/reportes` o `uploads/controles`.

## 4. Partes que faltan

Cada parte necesita un archivo en `routes` y uno en `controllers`. Si además tiene lógica propia (cálculos, llamadas externas), va en `services`. Las consultas a la base ya tienen su repositorio en `db/repositorios`. Por ejemplo, para votos: `votosRoutes.js` y `votosController.js`, que usan las funciones de votos de los repositorios.

Cuando una ruta tiene `{id}`, se reemplaza por el número de lo que se busca. Por ejemplo, para el reporte 15 la ruta `GET /api/reportes/{id}` queda `GET /api/reportes/15`.

| Parte | Qué hace | Encargado |
|---|---|---|
| Cuentas | Registrarse, iniciar sesión y ver el perfil | |
| Reportes | Crear, ver, modificar y listar reportes con fotos | |
| Riesgo y clima | Calcular qué tan peligroso es un reporte y guardar el clima del día | |
| Votos | Que un vecino apoye un reporte | |
| Gestión municipal | Que el funcionario acepte, rechace y asigne cuadrilla | |
| Controles | Que el funcionario suba la evidencia de que se limpió | |
| Notificaciones | Avisarle al vecino cuando su reporte cambia de estado | |
| Estadísticas | Resumen del mes y descarga en Excel (CSV) | |

### 4.1 Cuentas

- `POST /api/auth/registro`: crea una cuenta de vecino. La contraseña se guarda con bcrypt.
- `POST /api/auth/login`: revisa correo y contraseña y entrega el token.
- `GET /api/auth/perfil`: entrega los datos del usuario que inició sesión.

Solo los vecinos se registran. Los funcionarios vienen creados en los datos de prueba (`datos_prueba.sql`).

### 4.2 Reportes

- `GET /api/reportes`: lista de reportes para el mapa. Se puede filtrar por estado, categoría, riesgo, sector y fecha. No necesita sesión.
- `GET /api/reportes/{id}`: detalle de un reporte. No necesita sesión.
- `GET /api/reportes/mios`: los reportes del vecino que inició sesión.
- `POST /api/reportes`: crea un reporte con hasta 5 fotos. Solo vecinos.
- `PUT /api/reportes/{id}`: modifica un reporte. Solo el vecino que lo creó.

Ojo: el modelo `Reporte` no tiene un campo `estado`. El estado vive en su `Revision`. Por eso, para filtrar por estado hay que ir a través de la revisión, y un reporte sin revisión (`idRevision` vacío) cuenta como "Pendiente".

Hay que cuidar tres cosas:

- **Anonimato:** cuando cualquiera ve un reporte, no debe aparecer el nombre ni el correo del vecino que lo hizo. Con Prisma esto se logra con `select`, pidiendo solo los campos públicos (nunca se pide el vecino completo).
- **Duplicados:** antes de crear un reporte, revisar si ya hay uno parecido muy cerca. Si existe, responder "Ya existe un antecedente previo de este reporte".
- **Reportes antiguos:** los reportes "Controlados" hace más de un mes ya no salen en el mapa, salvo para funcionarios.

### 4.3 Riesgo y clima

- Al crear un reporte, se le pregunta el clima a Open-Meteo (una página gratuita del clima) y se guarda en el reporte la temperatura, humedad, viento y condición (`climaTemperatura`, `climaHumedad`, `climaViento` y `climaCondicion`).
- Con eso, más la categoría, el tamaño, la distancia a casas (`distanciaACasas`), los reportes cercanos y la antigüedad, se calcula el índice de riesgo, que se guarda en `indiceRiesgo` junto con la fecha del cálculo (`fechaCalculoRiesgo`).

### 4.4 Votos

- `POST /api/reportes/{id}/votos`: el vecino apoya el reporte. Si ya había votado, se le avisa.
- `DELETE /api/reportes/{id}/votos`: el vecino quita su apoyo.

### 4.5 Gestión municipal

- `GET /api/revisiones/cola`: reportes pendientes, del más peligroso al menos peligroso.
- `POST /api/reportes/{id}/revision`: el funcionario acepta o rechaza con todos los datos llenos. Si rechaza, tiene que escribir el motivo.
- `PUT /api/revisiones/{id}`: asigna cuadrilla y fecha, o cambia el estado.
- `GET /api/revisiones/{id}/historial`: todos los cambios de estado del reporte.
- `GET /api/cuadrillas`: lista de cuadrillas para elegir.

La revisión recién se crea cuando el funcionario aprieta aceptar o rechazar. Antes de eso el reporte queda como "Pendiente" y sin revisión.

Cada vez que cambia el estado se guarda en la tabla `log` (modelo `Log`) y se crea una notificación para el vecino. El repositorio `revisiones.ts` ya hace el cierre con notificación, así que conviene usarlo en vez de repetir esa lógica.

### 4.6 Controles

- `POST /api/revisiones/{id}/controles`: el funcionario sube la evidencia con fotos.
- `GET /api/revisiones/{id}/controles`: lista de controles de una revisión.

Solo puede subir un control el funcionario que pertenece a la cuadrilla asignada (se revisa en la tabla `puede_pertenecer`, modelo `PuedePertenecer`).

### 4.7 Notificaciones

- `GET /api/notificaciones`: las notificaciones del vecino.
- `PUT /api/notificaciones/{id}/leida`: marca una notificación como leída.

### 4.8 Estadísticas

- `GET /api/estadisticas?mes=2026-10`: total de reportes, cuántos se resolvieron y cuánto se demoraron en promedio.
- `GET /api/estadisticas/csv`: descarga los reportes en un archivo que se abre con Excel.

Las dos son solo para funcionarios.

## 5. Reglas a seguir para implementar el backend

### 5.1 Cómo responder

Siempre con el mismo formato, así la app sabe qué esperar:

```json
{ "ok": true, "data": { ... } }        cuando sale bien
{ "ok": false, "error": "mensaje" }     cuando sale mal
```

Además, cada respuesta lleva un número que indica cómo salió:

| Número | Cuándo |
|---|---|
| 200 | Salió bien |
| 201 | Se creó algo nuevo |
| 400 | Faltan datos o vienen mal |
| 401 | No inició sesión |
| 403 | Inició sesión, pero no tiene permiso (por ejemplo, un vecino queriendo rechazar un reporte) |
| 404 | No existe lo que busca |
| 409 | Ya existe (correo repetido, voto repetido, reporte duplicado) |
| 500 | Falló algo del servidor |

### 5.2 Cómo hacer las consultas a la base

Todas las consultas pasan por los repositorios de `db/repositorios`. Los controladores no importan Prisma directamente: importan desde `db/index.ts`.

Prisma ya manda los valores por separado de la consulta, así que usando sus funciones (`findMany`, `findUnique`, `create`, `update`, etc.) no hay riesgo de inyección SQL. Eso cubre la protección básica que pide EP 2.6(d).

El único caso peligroso es cuando hace falta escribir SQL a mano (`$queryRaw`). Ahí hay una regla simple:

```ts
// Bien: con $queryRaw y plantilla, Prisma manda ${id} como parámetro
await prisma.$queryRaw`SELECT * FROM reporte WHERE idreporte = ${id}`;

// Mal: nunca armar el texto del SQL pegando lo que escribe el usuario
await prisma.$queryRawUnsafe(`SELECT * FROM reporte WHERE idreporte = ${id}`);
```

(Los nombres de tabla y columna de estos ejemplos son los reales de la base: `reporte` e `idreporte`. Ver la tabla de la sección 6.5.)

### 5.3 Cómo avisar un error

Desde el repositorio, el servicio o el controlador se avisa así:

```js
const error = Object.assign(new Error('Reporte no encontrado'), { estado: 404 });
throw error;
```

El archivo `manejoErrores.js`, que ya está hecho, lo recibe y le responde a la app. Los errores internos de Prisma o de la base nunca se muestran tal cual al usuario, porque pueden revelar información sensible: se registran en el servidor y a la app se le responde un mensaje genérico con código 500.

### 5.4 Nombres

Todo en español, igual que lo que ya está: `crearReporte`, `votosController.js`, `obtenerPerfil`.

## 6. Cómo trabajar con la base de datos (Prisma)

### 6.1 Fuente de verdad

El modelo de la base vive en `prisma/schema.prisma` y su historial en `prisma/migrations`. El archivo `database/focalware.sql` quedó como documentación del esquema inicial y como script reproducible para quien quiera crear la base sin Prisma, pero **si hay diferencias, mandan las migraciones**.

La URL de conexión a la base no está en `schema.prisma` sino en `prisma.config.ts` (Prisma 7 lo exige así), y se lee desde la variable de entorno `DATABASE_URL`. El cliente que genera Prisma queda en `src/db/generated/`.

### 6.2 Cambiar el modelo

Si hay que agregar una tabla o una columna:

1. Editar `prisma/schema.prisma`.
2. Correr `npm run db:migrate` (o directamente `npx prisma migrate dev --name <nombre>`, con un nombre que describa el cambio). Esto crea la migración y actualiza la base.
3. Subir al repositorio el cambio de `schema.prisma` junto con la carpeta nueva de `prisma/migrations`.
4. Avisar al equipo, para que corran `npm run db:migrate` y `npm run build` (o `npm run db:generate`) y regeneren su cliente.

El cliente generado (`src/db/generated/`) no se sube al repositorio.

### 6.3 Comandos útiles

| Comando | Qué hace |
|---|---|
| `docker compose up -d --build` | Levanta la base y la API. Aplica las migraciones al iniciar |
| `docker compose up -d db` | Levanta solo la base (para trabajar sin Docker en la API) |
| `npm run db:migrate` | Aplica las migraciones y crea las tablas |
| `npm run db:generate` | Regenera el cliente de Prisma |
| `npm run db:studio` | Abre Prisma Studio para ver y editar los datos |
| `npm run db:reset` | Borra y recrea la base aplicando las migraciones |
| `npm run build` | Genera el cliente de Prisma y compila TypeScript a `dist/` |
| `npm run typecheck` | Revisa los tipos sin generar nada |
| `npm run dev` | Levanta la API en `http://localhost:3000` |
| `docker compose down -v` | Detiene todo y borra la base (se reconstruye sola) |

### 6.4 Datos de prueba

`backend/database/datos_prueba.sql` trae 3 vecinos, 2 funcionarios, 3 cuadrillas y 7 reportes en distintos estados, con votos, historial y notificaciones. Con Docker se cargan desde la raíz con:

```bash
docker exec -i focalware-db psql -U postgres -d focalware < backend/database/datos_prueba.sql
```

### 6.5 Modelos de Prisma y tablas

En el código los modelos se escriben con mayúscula y campos en camelCase (`Reporte`, `idReporte`), pero en PostgreSQL las tablas y columnas están en minúscula (`reporte`, `idreporte`). Prisma hace la traducción con `@@map` y `@map`. Son 12 tablas:

| Modelo (código) | Tabla (PostgreSQL) | Qué guarda |
|---|---|---|
| `Vecino` | `vecino` | Cuenta del vecino (nombre, email, hash de contraseña, teléfono opcional) |
| `Funcionario` | `funcionario` | Cuenta del funcionario municipal |
| `Cuadrilla` | `cuadrilla` | Cuadrillas de trabajo y su sector |
| `PuedePertenecer` | `puede_pertenecer` | Qué funcionario pertenece a qué cuadrilla (clave compuesta) |
| `Revision` | `revision` | Decisión del funcionario sobre un reporte: estado, cuadrilla asignada, fecha de atención |
| `Reporte` | `reporte` | El reporte: ubicación, categoría, tamaño, riesgo y clima |
| `ImagenReporte` | `imagen_reporte` | Fotos de un reporte, con su orden |
| `Voto` | `votos` | Apoyos de vecinos a reportes (uno por vecino y reporte) |
| `Log` | `log` | Historial de cambios de estado de una revisión |
| `Notificacion` | `notificacion` | Avisos para el vecino, con marca de leída |
| `ReporteControl` | `reporte_control` | Control de limpieza hecho por un funcionario |
| `ImagenControl` | `imagen_control` | Fotos de un control |

## 7. En qué orden hacerlo

### 7.1 Sin base de datos

Estas partes no guardan ni buscan nada en la base, así que se pueden hacer desde ya:

- **Revisar el token y el rol** (`autenticacion.js` y `roles.js`): solo leen el token que manda la app.
- **Recibir fotos** (`subirFotos.js`): solo las guarda en la carpeta `uploads`.
- **Consultar el clima** (`climaService.js`): le pregunta a Open-Meteo, no a nuestra base.
- **La fórmula del riesgo** (`riesgoService.js`): se puede armar y probar con números inventados.

### 7.2 Con base de datos

Estas partes necesitan las tablas, y algunas necesitan que otras estén listas antes:

1. **Levantar la base y cargar los datos de prueba:** con `docker compose up -d --build` las tablas se crean solas (migraciones de Prisma); sin tablas no se puede probar nada.
2. **Cuentas:** casi todo necesita saber quién inició sesión.
3. **Reportes:** todo lo demás gira en torno a ellos. Aquí se usan el clima y el riesgo de la sección 7.1.
4. **Votos:** es corto y solo necesita reportes.
5. **Gestión municipal y notificaciones.**
6. **Controles:** necesita una cuadrilla asignada.
7. **Estadísticas:** necesita datos de todo lo anterior.

### 7.3 Librerías

Ya están instaladas `jsonwebtoken` (token), `bcryptjs` (contraseñas), `multer` (fotos), `cors`, `dotenv`, `prisma`, `@prisma/client` y `@prisma/adapter-pg` (base de datos) y TypeScript. Basta con correr `npm install` dentro de `backend`.

## 8. Decisiones del modelo de datos

### 8.1 Ya acordado

1. **IDRevision en REPORTE puede quedar vacío (NULL).** La revisión recién se crea cuando el funcionario acepta o rechaza el reporte con todos los datos llenos. Mientras tanto el reporte no tiene revisión. En `schema.prisma` el campo se declara opcional (`Int?`).
2. **Un vecino vota una sola vez por reporte.** Se agrega la restricción única sobre (IDReporte, IDVecino) en la tabla VOTOS, que en Prisma se declara con `@@unique`. Si se intenta votar dos veces, Prisma lanza el error `P2002`, que el backend traduce a un 409.
3. **Solo los vecinos votan (RF-14).** Por eso VOTOS solo guarda IDVecino.
4. **Prisma es la fuente de verdad del modelo.** La estructura de la base sale de las migraciones y las consultas van con Prisma a través de los repositorios, no con SQL escrito a mano.

### 8.2 Por conversar

1. **NOTIFICACION y LOG están conectadas con REVISION y no con REPORTE.** No es un error y funciona. Lo único es que las consultas quedan más largas: para mostrarle al vecino "Tu reporte Basura en quebrada fue aceptado", hay que ir de NOTIFICACION a REVISION y de ahí a REPORTE para sacar el título. Con Prisma esto se resuelve con `include` anidado, así que se puede dejar así.
2. **RNF-05 pide un token más seguro** (con dos claves y renovación automática). Se deja para el final: si alcanzamos se hace completo y si no, solo con tiempo de expiración y se ajusta el requerimiento.

