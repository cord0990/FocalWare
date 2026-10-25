# EP 2.1 · Backend de FocalWare

**FocalWare** · Priorización de limpieza por riesgo de incendio en las quebradas de Valparaíso

[← Volver al README](../README.md)

---

El backend de FocalWare es una **API REST** hecha con Node.js, Express, PostgreSQL y Prisma. Este documento explica cómo está armado, qué funcionalidades tiene, qué requerimientos de la Entrega 1 cumple y en qué estado quedó la seguridad.

Documentos relacionados:

- [Endpoints y pruebas de la API (EP 2.7)](EP2.7-endpoints-y-pruebas.md): cada endpoint con sus datos, respuestas, errores y la evidencia de Postman.
- [Integración de la app con la API (EP 2.6)](EP2.6-integracion-frontend-backend.md): cómo la app consume la API, maneja los errores y el token.
- [Base de datos](base-de-datos.md): tablas, relaciones, reglas y datos de prueba.

## 1. Palabras claves para entender este documento

| Palabra | Qué significa |
|---|---|
| **Backend** | La parte de la app que no se ve. Recibe pedidos de la app, los procesa y guarda o busca datos en la base de datos |
| **API** | El conjunto de direcciones que la app puede llamar para pedir o enviar datos |
| **API REST** | Una forma ordenada de armar la API. Cada dirección representa una cosa (reportes, votos, notificaciones), el método dice qué se hace con ella y siempre se responde en JSON |
| **Endpoint** | Una de esas direcciones. Por ejemplo `GET /api/reportes` entrega la lista de reportes |
| **Método** | El tipo de pedido. `GET` es pedir datos, `POST` es crear algo, `PUT` y `PATCH` son modificar y `DELETE` es borrar |
| **JSON** | El formato en que se mandan los datos. Se ve así: `{ "titulo": "Basura en quebrada" }` |
| **Middleware** | Un paso que se ejecuta antes del controlador. Por ejemplo, revisar que venga el token |
| **JWT (token)** | Una especie de "pulsera" que recibe el usuario al iniciar sesión. Con ella el backend sabe quién es y si es vecino o funcionario. Dura 15 minutos |
| **bcrypt** | Una librería que transforma la contraseña en un texto que no se puede leer. Así en la base nunca queda la contraseña real |
| **Prisma** | El ORM: deja que el backend lea y guarde datos en PostgreSQL sin escribir SQL a mano |
| **multer** | Una librería que recibe las fotos que manda la app y las guarda en la carpeta `uploads` |
| **Postman** | El programa con el que probamos la API. La colección está en `backend/postman` |

## 2. Cómo funciona por dentro (ejemplo con restaurante)

Se puede pensar como un restaurante:

| Parte del backend | En el restaurante | Qué hace |
|---|---|---|
| `routes` | La carta | Dice qué cosas se pueden pedir y a quién se le pasa el pedido |
| `middlewares` | El guardia de la puerta | Revisa antes de atender: si tienes sesión, si eres vecino o funcionario, si mandaste fotos |
| `controllers` | El mesero | Recibe el pedido, revisa que venga completo y entrega la respuesta |
| `services` | El cocinero | Hace el trabajo de verdad: busca, calcula y guarda datos |
| `db` | La bodega | La conexión con la base de datos PostgreSQL, a través de Prisma |

Ejemplo: un vecino abre un reporte en la app.

1. La app pide `GET /api/reportes/15` (15 es el número del reporte, es solo un ejemplo).
2. **routes** ve el pedido y se lo pasa al controlador de reportes.
3. **controllers** saca el número 15, revisa que sea un número y le pide los datos al servicio.
4. **services** busca el reporte 15 en la base de datos y le quita el nombre y el correo del vecino si quien pregunta no es el dueño ni un funcionario.
5. **controllers** le responde a la app con los datos del reporte.

Lo importante es que cada uno hace solo lo suyo. El mesero no cocina y el cocinero no atiende mesas.

## 3. Las carpetas de nuestro proyecto

```
backend/
├── src/
│   ├── routes/         La carta: qué direcciones existen
│   ├── middlewares/    El guardia: token, rol, cuadrilla, validaciones, fotos y errores
│   ├── controllers/    El mesero: recibe y responde
│   ├── services/       El cocinero: lógica, cálculos y consultas
│   ├── db/             Prisma: cliente, tipos y repositorios
│   └── app.js          Enciende el backend
├── prisma/
│   ├── schema.prisma   Esquema de la base (fuente de verdad)
│   └── migrations/     Migraciones que aplica Docker al arrancar
├── database/
│   ├── focalware.sql   Script reproducible: crea la base, las tablas y carga los datos
│   └── datos_prueba.sql
├── postman/            Colección de pruebas de la API
└── uploads/
    ├── reportes/       Fotos de los vecinos
    └── controles/      Fotos de evidencia de los funcionarios
```

Cada módulo tiene sus tres archivos: uno en `routes`, uno en `controllers` y uno en `services`. Por ejemplo, para votos: [votosRoutes.js](../backend/src/routes/votosRoutes.js), [votosController.js](../backend/src/controllers/votosController.js) y [votosService.js](../backend/src/services/votosService.js).

## 4. Funcionalidades implementadas (descripción y alcance)

Esta tabla resume lo que hace la API hoy. La columna **Estado** usa dos valores:

- **Presente:** la funcionalidad está en el código fuente (se puede revisar en el archivo enlazado).
- **Probada:** además se ejecutó y pasó sus pruebas en Postman. La evidencia está en [EP2.7, sección 6](EP2.7-endpoints-y-pruebas.md#6-evidencia-de-las-pruebas), con la colección completa y las capturas de la corrida.

Todas las rutas empiezan con `http://localhost:3000/api`.

| # | Funcionalidad | Qué hace | Endpoint | Código | Estado y evidencia |
|---|---|---|---|---|---|
| F01 | Estado de la API | Revisa que la API y la base de datos estén funcionando | `GET /salud` | [saludService.js](../backend/src/services/saludService.js) | Probada · Postman carpeta 1 |
| F02 | Registro de vecinos | Crea una cuenta de vecino con la contraseña hasheada. No deja usar correos `@focalware.cl` | `POST /auth/registro` | [authService.js](../backend/src/services/authService.js) | Probada · Postman carpeta 2 |
| F03 | Inicio de sesión y emisión del JWT | Revisa correo y contraseña y entrega un token que dura 15 minutos con el id y el rol | `POST /auth/login` | [seguridadService.js](../backend/src/services/seguridadService.js) | Probada · Postman carpeta 2 y [captura del login](img/postman-login.png) |
| F04 | Consulta del perfil | Entrega los datos de quien inició sesión. Al funcionario le agrega sus cuadrillas | `GET /auth/perfil` | [authController.js](../backend/src/controllers/authController.js) | Probada · Postman carpeta 2 |
| F05 | Edición del perfil | Cambia el nombre y el correo, revisando que el correo no esté usado | `PUT /auth/perfil` | [authService.js](../backend/src/services/authService.js) | Probada · Postman carpeta 9 |
| F06 | Cambio de contraseña | Pide la contraseña actual y valida que la nueva sea segura | `PUT /auth/password` | [authService.js](../backend/src/services/authService.js) | Probada · Postman carpeta 9 |
| F07 | Recuperación de contraseña | Genera un código de 6 dígitos (vence en 10 minutos, máximo 5 intentos), lo verifica y permite poner una contraseña nueva. El código se muestra en la consola del backend | `POST /auth/recuperacion/...` | [authService.js](../backend/src/services/authService.js) | Probada · Postman carpeta 9 (solicitud y errores). El camino completo se prueba en la app con el código de la consola |
| F08 | Protección con token | Corta con 401 las peticiones sin token, con token inválido o vencido | Todas las privadas | [autenticacion.js](../backend/src/middlewares/autenticacion.js) | Probada · "Perfil sin token" y "Perfil con token inválido" |
| F09 | Permisos por rol | Corta con 403 cuando el rol no corresponde (por ejemplo, un vecino que intenta revisar) | Todas las de rol | [roles.js](../backend/src/middlewares/roles.js) | Probada · todos los casos "como vecino" y "como funcionario" |
| F10 | Mapa de reportes | Lista los reportes con filtros, sin mostrar quién los creó, sin rechazados y sin controlados de hace más de un mes | `GET /reportes` | [reportesService.js](../backend/src/services/reportesService.js) | Probada · Postman carpeta 3 |
| F11 | Detalle de un reporte | Fotos, clima y avance de la gestión. Los datos del vecino solo los ven el dueño y los funcionarios | `GET /reportes/:id` | [reportesService.js](../backend/src/services/reportesService.js) | Probada · Postman carpeta 3 |
| F12 | Crear reporte | Guarda el reporte con hasta 5 fotos y el clima real. Rechaza los repetidos (misma categoría a menos de 50 m) | `POST /reportes` | [reportesController.js](../backend/src/controllers/reportesController.js) | Probada · Postman carpeta 3 |
| F13 | Mis reportes | Los reportes del vecino que inició sesión | `GET /reportes/mios` | [reportesService.js](../backend/src/services/reportesService.js) | Probada · Postman carpeta 3 |
| F14 | Modificar y eliminar el reporte propio | Solo el dueño, y solo mientras nadie lo ha revisado | `PUT` y `DELETE /reportes/:id` | [reportesService.js](../backend/src/services/reportesService.js) | Probada · Postman carpetas 3 y 5 |
| F15 | Corregir el desglose | El funcionario corrige categoría, volumen, distancia y riesgo | `PATCH /reportes/:id/desglose` | [reportesController.js](../backend/src/controllers/reportesController.js) | Probada · Postman carpeta 3 |
| F16 | Apoyos de vecinos | Apoyar y quitar el apoyo. Uno por vecino, no el propio, no en rechazados | `POST` y `DELETE /reportes/:id/votos` | [votosService.js](../backend/src/services/votosService.js) | Probada · Postman carpeta 4 |
| F17 | Cola priorizada | Reportes sin revisión, del más riesgoso al menos | `GET /revisiones/cola` | [revisionService.js](../backend/src/services/revisionService.js) | Probada · Postman carpeta 6 |
| F18 | Revisar un reporte | Aprobar, rechazar (con motivo obligatorio) o dejar en atención, con cuadrilla y fecha. Guarda el historial y avisa al vecino en la misma operación | `POST /reportes/:id/revision` | [revisionService.js](../backend/src/services/revisionService.js) | Probada · Postman carpeta 6 y [captura](img/postman-revisiones.png) |
| F19 | Registrar el control | El cierre del trabajo con 1 a 5 fotos. Solo un funcionario de la cuadrilla asignada | `PUT /revisiones/:id` | [cuadrilla.js](../backend/src/middlewares/cuadrilla.js) | Probada · Postman carpeta 6 |
| F20 | Notificaciones | Listar los avisos del vecino y marcarlos como leídos | `GET /notificaciones` | [notificacionesService.js](../backend/src/services/notificacionesService.js) | Probada · Postman carpeta 7 y [captura](img/postman-notificaciones.png) |
| F21 | Estadísticas | Reportes del año para el panel del funcionario y el aporte del vecino | `GET /estadisticas` | [estadisticasService.js](../backend/src/services/estadisticasService.js) | Probada · Postman carpeta 8 |
| F22 | Clima real | Clima de Open-Meteo por zona de Valparaíso, guardado hasta que sale el siguiente dato | `GET /clima` | [climaService.js](../backend/src/services/climaService.js) | Probada · Postman carpeta 1 |

La lista completa de endpoints (27), con sus datos y errores, está en [EP2.7](EP2.7-endpoints-y-pruebas.md#4-lista-de-endpoints).

## 5. Relación con la Entrega 1

Estos son los requerimientos funcionales de [EP1.1](EP1.1.%20Requerimientos%20del%20sistema.md) y cómo quedaron en esta entrega:

| RF | Nombre | Estado | Cómo se cumple |
|---|---|---|---|
| RF-01 | Registro de reporte georreferenciado | Implementado | `POST /reportes` con ubicación, fotos, categoría, volumen y descripción. Solo lo crean vecinos (acuerdo 8.2) |
| RF-02 | Almacenamiento local offline | Implementado | La app guarda el reporte en el teléfono si no hay conexión y lo envía a la API cuando vuelve |
| RF-03 | Mapa interactivo | Implementado | `GET /reportes` alimenta el mapa de la app |
| RF-04 | Filtrado del mapa | Implementado | La API filtra por estado, sector y categoría. La app agrega riesgo, fechas y orden |
| RF-05 | Índice ponderado | Parcial | El índice usa categoría, volumen, distancia a viviendas, apoyos, antigüedad y el clima real de Open-Meteo. Se calcula en la app y la API lo valida (0 a 100) y lo guarda. Falta recalcularlo en la API cuando llegan apoyos |
| RF-06 | Uso del índice para priorizar | Implementado | `GET /revisiones/cola` ordena por índice de mayor a menor |
| RF-07 | Gestión municipal | Implementado | Revisar, asignar cuadrilla y fecha, cambiar estado y registrar el control con fotos |
| RF-08 | Notificación y trazabilidad | Implementado | Cada cambio de estado guarda una fila en `log` y una notificación para el autor. La app muestra la línea de tiempo |
| RF-09 | Estadísticas mensuales | Implementado | `GET /estadisticas`: totales, resueltos, promedio por sector, evolución mensual y CSV |
| RF-10 | Identificador único | Implementado | `idreporte` es `SERIAL` en la base |
| RF-11 | Ocultar reportes controlados | Parcial | Se ocultan del mapa después de un mes. Falta que los funcionarios los sigan viendo y que el mes se cuente desde el control, no desde la creación |
| RF-12 | Opciones del funcionario | Implementado | Aprobar, rechazar, modificar el desglose y registrar el control |
| RF-13 | Modificación offline | Implementado | Los reportes guardados sin conexión se pueden editar antes de enviarlos |
| RF-14 | Votos a favor | Implementado | `POST` y `DELETE /reportes/:id/votos`. Solo vecinos (acuerdo 8.1) |
| RF-15 | Vista de detalles | Implementado | `GET /reportes/:id` con fotos, clima, riesgo, apoyos y gestión |
| RF-16 | Límite del reporte de control | Implementado | El middleware [cuadrilla.js](../backend/src/middlewares/cuadrilla.js) revisa la tabla `puede_pertenecer` |
| RF-17 | Asignación de reporte | Implementado | Al aprobar se elige cuadrilla, fecha de atención y detalle opcional |
| RF-18 | Motivo de rechazo | Implementado | Sin motivo, la API responde 400 |

## 6. Reglas que sigue el código

### 6.1 Cómo responder

Siempre con el mismo formato, así la app sabe qué esperar:

```json
{ "ok": true, "data": { ... } }        cuando sale bien
{ "ok": false, "error": "mensaje" }     cuando sale mal
```

Además, cada respuesta lleva un código que indica cómo salió:

| Código | Cuándo |
|---|---|
| 200 | Salió bien |
| 201 | Se creó algo nuevo |
| 400 | Faltan datos, vienen mal o el JSON está mal escrito |
| 401 | No inició sesión o el token venció |
| 403 | Inició sesión, pero no tiene permiso (por ejemplo, un vecino queriendo rechazar un reporte) |
| 404 | No existe lo que busca |
| 409 | Ya existe (correo repetido, voto repetido, reporte duplicado, reporte ya revisado) |
| 500 | Falló algo del servidor. El mensaje no muestra detalles internos |
| 503 | Un servicio externo no responde (Open-Meteo) |

### 6.2 Cómo se consulta la base

Nunca se pega directo lo que escribe el usuario dentro del SQL, porque alguien podría escribir código malicioso. Por eso las consultas se hacen con **Prisma**, que manda los valores aparte:

```js
// Bien: Prisma separa el valor de la consulta
prisma.reporte.findUnique({ where: { idReporte: id } });

// Mal: el valor queda pegado dentro del SQL
pool.query(`SELECT * FROM reporte WHERE idreporte = ${id}`);
```

### 6.3 Cómo se avisa un error

Desde el servicio se avisa así, y [manejoErrores.js](../backend/src/middlewares/manejoErrores.js) lo traduce al formato de la sección 6.1:

```js
const error = new Error('Reporte no encontrado');
error.estado = 404;
throw error;
```

### 6.4 Nombres

Todo en español: `crearReporte`, `votosService.js`, `obtenerPerfil`.

## 7. Seguridad y JWT: estado y correcciones

### 7.1 Estado actual

| Tema | Estado | Cómo está hecho |
|---|---|---|
| Contraseñas (RNF-04) | Cumple | bcrypt con 10 rondas. La API nunca devuelve el hash |
| Token JWT (RNF-05) | Parcial | Dura 15 minutos y guarda solo el id y el rol. Se firma con una clave secreta del `.env` (algoritmo simétrico HS256) y no tiene rotación |
| Token vencido en la app | Cumple | Si la API responde 401, la app cierra la sesión, avisa y lleva al login |
| Rutas protegidas | Cumple | `verificarToken`, `permitirRoles` y `perteneceACuadrilla` en las rutas. La app también protege sus pantallas por rol |
| CORS (RNF-06) | Cumple | Solo acepta pedidos de la URL del frontend (`FRONTEND_URL`) |
| Anonimato (RNF-07) | Cumple | El mapa y el detalle público no muestran el nombre ni el correo del vecino |
| Inyección SQL | Cumple | Todas las consultas pasan por Prisma |
| Validación de entradas | Cumple | Campos obligatorios, formato de correo, contraseña segura, largos máximos, números en rango. Responde 400 con un mensaje claro |
| Errores | Cumple | Los errores internos responden "Error interno del servidor", sin mostrar detalles |
| Fotos | Cumple | Solo JPG, PNG o WEBP, máximo 5 fotos de 5 MB cada una |
| Recuperación de contraseña | Solo para desarrollo | El código se guarda hasheado, vence en 10 minutos y permite 5 intentos, pero se muestra en la consola en vez de enviarse por correo |
| Secretos | Cumple | El `.env` no se sube al repositorio. Solo se sube `.env.example` |

### 7.2 Correcciones necesarias (Entrega Final)

1. **Rotación del token (RNF-05):** agregar un token de renovación y firmar con un par de claves (algoritmo asimétrico), como pide el requerimiento.
2. **Clave por defecto en Docker:** `docker-compose.yml` usa `cambia_esta_clave` si no se define `JWT_SECRETO`. En un despliegue real hay que obligar a definirla.
3. **Envío real del código de recuperación:** mandarlo por correo en vez de mostrarlo en la consola.
4. **Límite de intentos de inicio de sesión:** hoy no hay un tope de intentos por correo o por IP.
5. **Dónde se guarda el token en la app:** hoy va en `localStorage`. Si algún día la app tuviera un problema de XSS, se podría leer. Una cookie `httpOnly` lo evitaría.

## 8. Decisiones y acuerdos implementados

1. **La revisión de un reporte puede quedar vacía.** `idrevision` en `reporte` es `NULL` hasta que el funcionario aprueba, rechaza o deja en atención el reporte.
2. **Solo los vecinos crean reportes y votan (RF-01 y RF-14).** El funcionario gestiona los reportes, no los crea. Por eso `votos` solo guarda `idvecino`.
3. **Un voto por vecino y por reporte.** Lo asegura `UNIQUE (idreporte, idvecino)` en la tabla `votos`.
4. **Los funcionarios no se registran desde la app.** Los entrega la municipalidad (vienen en los datos de prueba) y la API rechaza registros con correo `@focalware.cl`.
5. **Los reportes enviados no se editan desde la app.** Solo se editan los borradores guardados sin conexión. La corrección del desglose la hace el funcionario con su propia ruta (`PATCH /reportes/:id/desglose`).
6. **Las notificaciones son solo para el vecino (RF-08).** La tabla `notificacion` solo guarda `idvecino`. Las notificaciones para funcionarios quedan para la Entrega Final.
7. **Notificación y log van ligados a la revisión, no al reporte.** Funciona bien: para mostrar el título del reporte, la consulta va de la notificación a la revisión y de ahí al reporte.
8. **Una notificación ajena responde 404 y no 403**, para no revelar que existe.
9. **El clima lo consulta el backend, por zonas.** Valparaíso se divide en 3 zonas y el clima de cada una se guarda hasta que Open-Meteo publica el siguiente dato (cada 15 minutos). Si llegan varios reportes a la vez, comparten una sola consulta.
10. **Revisión, historial y notificación se guardan juntos.** Van en una transacción: o se guarda todo o no se guarda nada.

## 9. Problemas frecuentes

| Problema | Por qué pasa | Cómo se arregla |
|---|---|---|
| `GET /api/salud` responde error o Postman falla casi completo con `ECONNREFUSED` | Docker Desktop está apagado y la base no responde | Abrir Docker Desktop, esperar "Engine running" y correr `docker compose up -d db` |
| `Cannot find module '../../dist/db/index.js'` | Falta compilar el cliente de Prisma | Dentro de `backend`, correr `npm run build` (o `npm start`, que lo hace solo) |
| La API no conecta a la base | El puerto o la clave de `DATABASE_URL` no coinciden con Docker | Revisar que `backend/.env` use el puerto `5434`, igual que `.env.example` |
| La app muestra "Tu sesión expiró" seguido | El token dura 15 minutos | Volver a iniciar sesión. Para una demostración, iniciar sesión justo antes |
| Después de cambiar entre la API local y la de Docker, todo responde 401 | Cada una puede tener otro `JWT_SECRETO`, así que el token viejo no sirve | Cerrar sesión e iniciarla de nuevo |
| En el Runner de Postman algunas peticiones salen "could not be sent" a la mitad | La API se reinició sola porque se levantó con `npm run dev` | Levantar la API con `npm start` para correr las pruebas |
| La prueba "Registrar control" falla en Postman | Postman no encuentra `foto-prueba.png` | En Postman, App settings > General > Working directory: elegir la carpeta `backend/postman` |
| No llega el código de recuperación de contraseña | No se envía por correo, se muestra en la consola | Mirarlo en la terminal de la API, o con `docker compose logs -f api` si corre en Docker |
| Las pruebas del clima fallan | No hay internet y Open-Meteo no responde | Revisar la conexión. El resto de la API funciona igual |
| `npx eslint` dice que falta `@eslint/js` | Faltan dependencias en `frontend/node_modules` | Dentro de `frontend`, correr `npm install` |
| Git muestra "LF will be replaced by CRLF" | Windows usa otro salto de línea | Es solo un aviso. No hay que hacer nada |

## 10. Referencias

| Herramienta | Para qué la usamos | Documentación |
|---|---|---|
| Node.js | Ejecutar el backend en JavaScript | https://nodejs.org/docs/latest/api/ |
| Express | Crear la API: rutas, middlewares y respuestas | https://expressjs.com/es/ |
| PostgreSQL | Base de datos relacional | https://www.postgresql.org/docs/16/ |
| Prisma | ORM: esquema, migraciones y consultas | https://www.prisma.io/docs |
| JSON Web Token | Formato del token de sesión (RFC 7519) | https://jwt.io/introduction |
| jsonwebtoken | Librería para firmar y verificar el token | https://github.com/auth0/node-jsonwebtoken |
| bcryptjs | Hash de contraseñas | https://github.com/dcodeIO/bcrypt.js |
| multer | Recibir fotos en formularios `multipart/form-data` | https://github.com/expressjs/multer |
| cors | Limitar qué dominios pueden usar la API | https://github.com/expressjs/cors |
| dotenv | Leer las variables del archivo `.env` | https://github.com/motdotla/dotenv |
| Open-Meteo | Clima actual por coordenadas | https://open-meteo.com/en/docs |
| Docker y Docker Compose | Levantar la base y la API en contenedores | https://docs.docker.com/compose/ |
| Postman | Probar la API con la colección del proyecto | https://learning.postman.com/docs/ |
| Newman | Correr la colección de Postman por consola | https://github.com/postmanlabs/newman |
| Ionic con React | Frontend que consume la API | https://ionicframework.com/docs/react |
| MDN: códigos HTTP | Significado de cada código de respuesta | https://developer.mozilla.org/es/docs/Web/HTTP/Status |
