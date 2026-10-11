# EP 2.1 · Estructura del Backend

**FocalWare** · Priorización de limpieza por riesgo de incendio en las quebradas de Valparaíso

[← Volver al README](../README.md)

---

El backend de FocalWare es una **API REST** hecha con Node.js, Express y PostgreSQL. Este documento explica cómo está armado y qué falta hacer, para que cada uno pueda tomar una parte y avanzar.

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

## 2. Cómo funciona por dentro (ejemplo con restaurante)

Se puede pensar como un restaurante:

| Parte del backend | En el restaurante | Qué hace |
|---|---|---|
| `routes` | La carta | Dice qué cosas se pueden pedir y a quién se le pasa el pedido |
| `middlewares` | El guardia de la puerta | Revisa antes de atender: si tienes sesión, si eres vecino o funcionario, si mandaste fotos |
| `controllers` | El mesero | Recibe el pedido, revisa que venga completo y entrega la respuesta |
| `services` | El cocinero | Hace el trabajo de verdad: busca, calcula y guarda datos |
| `db` | La bodega | La conexión con la base de datos PostgreSQL |

Ejemplo: un vecino abre un reporte en la app.

1. La app pide `GET /api/reportes/15` (15 es el número del reporte, es solo un ejemplo).
2. **routes** ve el pedido y se lo pasa al controlador de reportes.
3. **controllers** saca el número 15 y le pide los datos al servicio.
4. **services** busca el reporte 15 en la base de datos.
5. **controllers** le responde a la app con los datos del reporte.

Lo importante es que cada uno hace solo lo suyo. El mesero no cocina y el cocinero no atiende mesas.

## 3. Las carpetas de nuestro proyecto

```
backend/
├── src/
│   ├── routes/         La carta: qué direcciones existen
│   ├── middlewares/    El guardia: revisa sesión, rol y fotos
│   ├── controllers/    El mesero: recibe y responde
│   ├── services/       El cocinero: lógica y base de datos
│   ├── db/             Conexión a la base de datos (lista)
│   └── app.js          Enciende el backend (listo)
├── database/
│   └── focalware.sql   Script que crea las tablas
└── uploads/
    ├── reportes/       Fotos de los vecinos
    └── controles/      Fotos de los funcionarios
```

Lo que ya está hecho:

- La conexión a la base de datos.
- El endpoint `GET /api/salud`, que sirve para comprobar que todo funciona.
- El manejo de errores, que responde siempre con el mismo formato.
- Las carpetas para las fotos.
- Los middlewares `autenticacion.js` (revisa el token), `roles.js` (revisa si es vecino o funcionario) y `validaciones.js` (revisa que lleguen los campos y que el correo y la contraseña tengan buen formato).
- `seguridadService.js`, que encripta y compara contraseñas con bcrypt y crea el token al iniciar sesión.
- El middleware `subirFotos.js`, que recibe hasta 5 fotos (JPG, PNG o WEBP de máximo 5 MB) y las guarda en `uploads/reportes` o `uploads/controles`.

## 4. Partes que faltan

Cada parte necesita tres archivos: uno en `routes`, uno en `controllers` y uno en `services`. Por ejemplo, para votos: `votosRoutes.js`, `votosController.js` y `votosService.js`.

Cuando una ruta tiene `{id}`, se reemplaza por el número de lo que se busca. Por ejemplo, `GET /api/reportes/{id}` para el reporte 15 queda `GET /api/reportes/{id}`.

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

Solo los vecinos se registran. Los funcionarios vienen creados en `focalware.sql`.

### 4.2 Reportes

- `GET /api/reportes`: lista de reportes para el mapa. Se puede filtrar por estado, categoría, riesgo, sector y fecha. No necesita sesión.
- `GET /api/reportes/{id}`: detalle de un reporte. No necesita sesión.
- `GET /api/reportes/mios`: los reportes del vecino que inició sesión.
- `POST /api/reportes`: crea un reporte con hasta 5 fotos. Solo vecinos.
- `PUT /api/reportes/{id}`: modifica un reporte. Solo el vecino que lo creó.

Hay que cuidar tres cosas:

- **Anonimato:** cuando cualquiera ve un reporte, no debe aparecer el nombre ni el correo del vecino que lo hizo.
- **Duplicados:** antes de crear un reporte, revisar si ya hay uno parecido muy cerca. Si existe, responder "Ya existe un antecedente previo de este reporte".
- **Reportes antiguos:** los reportes "Controlados" hace más de un mes ya no salen en el mapa, salvo para funcionarios.

### 4.3 Riesgo y clima

- Al crear un reporte, se le pregunta el clima a Open-Meteo (una página gratuita del clima) y se guarda la temperatura, humedad, viento y condición.
- Con eso, más la categoría, el tamaño, los reportes cercanos y la antigüedad, se calcula el **Indice_Riesgo**.

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

Cada vez que cambia el estado se guarda en la tabla LOG y se crea una notificación para el vecino.

### 4.6 Controles

- `POST /api/revisiones/{id}/controles`: el funcionario sube la evidencia con fotos.
- `GET /api/revisiones/{id}/controles`: lista de controles de una revisión.

Solo puede subir un control el funcionario que pertenece a la cuadrilla asignada (se revisa en la tabla PUEDE_PERTENECER).

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

### 5.2 Cómo escribir las consultas a la base

Nunca se pega directo lo que escribe el usuario dentro del SQL, porque alguien podría escribir código malicioso y borrar la base. Se usa `$1`, `$2`, etc., y los valores van aparte:

```js
// Bien
pool.query('SELECT * FROM reporte WHERE idreporte = $1', [id]);

// Mal
pool.query(`SELECT * FROM reporte WHERE idreporte = ${id}`);
```

### 5.3 Cómo avisar un error

Desde el servicio se avisa así:

```js
const error = new Error('Reporte no encontrado');
error.estado = 404;
throw error;
```

El archivo `manejoErrores.js`, que ya está hecho, lo recibe y le responde a la app.

### 5.4 Nombres

Todo en español, igual que lo que ya está: `crearReporte`, `votosService.js`, `obtenerPerfil`.

## 6. En qué orden hacerlo

### 6.1 Sin base de datos

Estas partes no guardan ni buscan nada en la base, así que se pueden hacer desde ya:

- **Revisar el token y el rol** (`autenticacion.js` y `roles.js`): solo leen el token que manda la app.
- **Recibir fotos** (`subirFotos.js`): solo las guarda en la carpeta `uploads`.
- **Consultar el clima** (`climaService.js`): le pregunta a Open-Meteo, no a nuestra base.
- **La fórmula del riesgo** (`riesgoService.js`): se puede armar y probar con números inventados.

### 6.2 Con base de datos

Estas partes necesitan las tablas, y algunas necesitan que otras estén listas antes:

1. **Cargar `focalware.sql`:** sin tablas no se puede probar nada.
2. **Cuentas:** casi todo necesita saber quién inició sesión.
3. **Reportes:** todo lo demás gira en torno a ellos. Aquí se usan el clima y el riesgo de la sección 6.1.
4. **Votos:** es corto y solo necesita reportes.
5. **Gestión municipal y notificaciones.**
6. **Controles:** necesita una cuadrilla asignada.
7. **Estadísticas:** necesita datos de todo lo anterior.

### 6.3 Librerías

Ya están instaladas `jsonwebtoken` (token), `bcryptjs` (contraseñas) y `multer` (fotos). Basta con correr `npm install` dentro de `backend`.

## 7. Decisiones del modelo de datos

### 7.1 Ya acordado

1. **IDRevision en REPORTE puede quedar vacío (NULL).** La revisión recién se crea cuando el funcionario acepta o rechaza el reporte con todos los datos llenos. Mientras tanto el reporte no tiene revisión.
2. **Un vecino vota una sola vez por reporte.** En el SQL se agrega `UNIQUE (IDReporte, IDVecino)` en la tabla VOTOS.
3. **Solo los vecinos votan (RF-14).** Por eso VOTOS solo guarda IDVecino.

### 7.2 Por conversar

1. **NOTIFICACION y LOG están conectadas con REVISION y no con REPORTE.** No es un error y funciona. Lo único es que las consultas quedan más largas: para mostrarle al vecino "Tu reporte Basura en quebrada fue aceptado", hay que ir de NOTIFICACION a REVISION y de ahí a REPORTE para sacar el título. Se puede dejar así.
2. **RNF-05 pide un token más seguro** (con dos claves y renovación automática). Se deja para el final: si alcanzamos se hace completo y si no, solo con tiempo de expiración y se ajusta el requerimiento.
