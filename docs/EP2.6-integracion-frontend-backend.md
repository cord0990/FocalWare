# EP 2.6 · Integración de la app con la API

**FocalWare** · Priorización de limpieza por riesgo de incendio en las quebradas de Valparaíso

[← Volver al README](../README.md)

---

Este documento explica cómo la app (Ionic con React) se conecta con la API REST: qué servicios usa, cómo manda el token, cómo maneja los errores, cómo protege las pantallas según el rol y cómo se cierra la sesión. Cada parte enlaza al código donde está hecha.

La app ya no usa datos inventados: todas las pantallas leen y guardan en la base de datos a través de la API.

## 1. Cómo se conecta la app con la API

Todas las llamadas pasan por una sola función, `pedir`, en [frontend/src/services/api.ts](../frontend/src/services/api.ts#L75). Usa `fetch` y se encarga de:

1. Armar la URL con `VITE_API_URL` (por defecto `http://localhost:3000/api`).
2. Mandar el cuerpo como JSON, o como formulario cuando van fotos.
3. Agregar el token cuando la petición lo necesita (sección 3).
4. Revisar la respuesta y convertir cualquier error en un `ErrorApi` con su código HTTP (sección 4).

```ts
// Ejemplo: así pide el detalle de un reporte el servicio de reportes
const datos = await pedir<{ reporte: ReporteApi }>(`/reportes/${id}`);
```

Gracias a esto, ninguna pantalla llama a `fetch` directamente: usan los servicios de la sección 2.

## 2. Servicios por módulo

Cada servicio agrupa las llamadas de un tema y transforma la respuesta de la API al formato que usan las pantallas.

| Servicio | Endpoints que usa | Pantallas |
|---|---|---|
| [authService.ts](../frontend/src/services/authService.ts) | `/auth/login`, `/auth/registro`, `/auth/perfil`, `/auth/password`, `/auth/recuperacion/...` | Iniciar sesión, registro, recuperar contraseña, configuración del perfil |
| [reportesService.ts](../frontend/src/services/reportesService.ts) | `/reportes`, `/reportes/:id`, `/reportes/mios`, `/reportes/:id/votos`, `/reportes/:id/desglose`, `/reportes/:id/revision`, `/revisiones/:id` | Mapa, detalle, crear reporte, mis reportes, opciones del funcionario |
| [pendientesService.ts](../frontend/src/services/pendientesService.ts) | `POST /reportes` (al recuperar la conexión) | Mis reportes: envío de los reportes guardados sin conexión |
| [notificacionesService.ts](../frontend/src/services/notificacionesService.ts) | `/notificaciones`, `/notificaciones/:id/leida` | Notificaciones del perfil y contador del menú |
| [estadisticasService.ts](../frontend/src/services/estadisticasService.ts) | `/estadisticas` | Estadísticas del funcionario y exportación CSV |
| [usuarioService.ts](../frontend/src/services/usuarioService.ts) | `/estadisticas/mi-actividad` | "Tu aporte" en el menú del vecino |
| [climaService.ts](../frontend/src/services/climaService.ts) | `/clima` | Panel "Clima ahora" al crear un reporte |

## 3. Envío controlado del token (JWT)

- **Al iniciar sesión**, la app guarda el token que entrega `/auth/login` ([sesionService.ts](../frontend/src/services/sesionService.ts) y `guardarToken` en [api.ts](../frontend/src/services/api.ts)).
- **En cada petición privada**, `pedir` agrega la cabecera `Authorization: Bearer <token>` ([api.ts, línea 86](../frontend/src/services/api.ts#L86)).
- **Las peticiones públicas no mandan el token**: login, registro, recuperación de contraseña y clima usan `autenticado: false`.
- **Si no hay token**, no se manda la cabecera, y la API responde 401 en las rutas privadas.
- **El token nunca se muestra en pantalla** ni se guarda dentro de los datos del usuario.

## 4. Gestión de errores

`pedir` convierte cualquier problema en un `ErrorApi` con el código HTTP ([api.ts, línea 58](../frontend/src/services/api.ts#L58)). Cada pantalla decide qué mostrar según ese código:

| Situación | Código | Qué hace la app |
|---|---|---|
| La API no responde (sin internet o servidor apagado) | `0` | Muestra "No se pudo conectar con el servidor". Al crear un reporte sin conexión, lo guarda en el teléfono para enviarlo después |
| El token venció o no es válido | `401` | Cierra la sesión una sola vez, muestra "Tu sesión expiró, vuelve a iniciar sesión" y lleva al login ([api.ts, línea 116](../frontend/src/services/api.ts#L116) y [SesionProvider.tsx](../frontend/src/context/SesionProvider.tsx#L28)) |
| No tiene permiso | `403` | Muestra el mensaje de la API. Por ejemplo, "No perteneces a la cuadrilla de esta revisión" al registrar un control |
| Datos inválidos o repetidos | `400` y `409` | Muestra el motivo que manda la API. Por ejemplo, "Ya existe un antecedente previo de este reporte" o "Ya apoyaste este reporte" |
| No existe | `404` | Muestra "No encontramos este reporte" o vuelve al listado |
| Error interno | `500` | Muestra un mensaje genérico, sin detalles técnicos |

Además, las listas muestran estados de carga y de error. Por ejemplo, Notificaciones muestra "Cargando notificaciones..." y, si falla, "No se pudieron cargar las notificaciones. Intenta de nuevo más tarde."

## 5. Protección de rutas según el rol

Las pantallas privadas están envueltas en `RutaProtegida` ([RutaProtegida.tsx](../frontend/src/routes/RutaProtegida.tsx)):

- **Sin sesión**, manda al login y recuerda a qué pantalla se quería entrar.
- **Con el rol equivocado**, manda al mapa.

| Pantalla | Ruta | Quién entra |
|---|---|---|
| Mapa y detalle de un reporte | `/mapa`, `/mapa/:id` | Todos, sin sesión |
| Crear reporte | `/reportar` | Vecino |
| Mis reportes y su detalle | `/mis-reportes`, `/mis-reportes/:id` | Vecino |
| Editar un reporte guardado sin conexión | `/mis-reportes/en-local/:id`, `/mis-reportes/:id/editar` | Vecino |
| Perfil y configuración | `/mi-perfil`, `/mi-perfil/configuracion` | Vecino y funcionario |
| Gestión de un reporte | `/municipal/reporte/:id` | Funcionario |
| Estadísticas | `/municipal/estadisticas` | Funcionario |

Las reglas están en [App.tsx](../frontend/src/App.tsx#L116). La protección en la app es para la navegación: la seguridad real la pone la API, que revisa el token y el rol en cada petición (ver [EP2.1, sección 7](EP2.1-estructura-backend.md#7-seguridad-y-jwt-estado-y-correcciones)).

## 6. Cierre de sesión

- **Manual:** el botón "Cerrar sesión" del menú de cuenta ([MenuCuenta.tsx](../frontend/src/components/layout/MenuCuenta.tsx#L78)) llama a `cerrarSesion`, que borra el usuario y el token del teléfono ([sesionService.ts](../frontend/src/services/sesionService.ts#L43)) y lleva al login.
- **Automático:** cuando la API responde 401 a una petición con token, la app hace lo mismo y avisa que la sesión expiró (sección 4).
- **Al abrir la app**, se revisa el token guardado con `GET /auth/perfil` ([SesionProvider.tsx](../frontend/src/context/SesionProvider.tsx)). Si venció, la sesión se cierra igual que arriba. Si sigue válido, se actualizan los datos del usuario (por ejemplo, las cuadrillas del funcionario). Si no hay conexión, la sesión se mantiene y se revisa en la próxima petición.

## 7. Flujos conectados a datos reales

| Flujo | Qué pasa | Endpoints |
|---|---|---|
| Ver el mapa | Lista los reportes de la base, con su riesgo y apoyos | `GET /reportes` |
| Registrarse e iniciar sesión | Crea la cuenta y guarda el token | `POST /auth/registro`, `POST /auth/login` |
| Crear un reporte | Muestra el clima real de la zona y guarda el reporte con fotos | `GET /clima`, `POST /reportes` |
| Crear un reporte sin conexión | Lo guarda en el teléfono y lo envía al volver la conexión | `POST /reportes` |
| Apoyar un reporte | Suma o quita el apoyo y actualiza el contador | `POST` y `DELETE /reportes/:id/votos` |
| Gestionar un reporte (funcionario) | Aprobar, rechazar, corregir el desglose y registrar el control con fotos | `/reportes/:id/revision`, `/reportes/:id/desglose`, `/revisiones/:id` |
| Recibir notificaciones | El vecino ve los cambios de estado de sus reportes y el contador baja al leerlas | `GET /notificaciones`, `PUT /notificaciones/:id/leida` |
| Ver estadísticas | Cifras del mes, gráficos y CSV con los reportes reales | `GET /estadisticas` |
| Cambiar o recuperar la contraseña | Cambia la contraseña con la actual, o con el código de recuperación | `/auth/password`, `/auth/recuperacion/...` |

## 8. Capturas

**Mapa con los reportes de la base.** Cada tarjeta muestra el riesgo y los apoyos que entrega `GET /reportes`.

![Mapa de Valparaíso con los reportes de la base marcados por nivel de riesgo y la lista de reportes al costado](img/Vistas%20Implementacion/Vecino%20-%20Pantalla%20principal.png)

**Crear un reporte.** El panel "Clima ahora" viene de `GET /clima` y el reporte se envía a `POST /reportes`.

![Formulario para crear un reporte con el clima actual, el desglose del riesgo, el mapa para marcar la ubicación y las fotos](img/Vistas%20Implementacion/Vecino%20-%20Crear%20Reporte.png)

**Aprobar un reporte (funcionario).** La revisión se guarda con `POST /reportes/:id/revision`.

![Mensaje de éxito después de aprobar un reporte con su cuadrilla asignada](img/Vistas%20Implementacion/Funcionario%20-%20Opciones%20funcionarios%20-%20Aceptar%20-%20Con%20exito.png)

**Error de permiso manejado en la app.** Andrés intenta registrar el control de un reporte de la Cuadrilla Cerros. La API responde 403 y la app muestra el motivo: "No perteneces a la cuadrilla de esta revisión".

![Formulario de reporte controlado con el mensaje de error No perteneces a la cuadrilla de esta revisión](img/Vistas%20Implementacion/Funcionario%20-%20Opciones%20funcionarios%20-%20Reporte%20Control%20-%20No%20perteneces%20a%20la%20cuadrilla.png)

**Estadísticas del funcionario** calculadas con los reportes de `GET /estadisticas`.

![Panel de estadísticas con las cifras del mes, el tiempo promedio por sector y la evolución mensual](img/Vistas%20Implementacion/Funcionario%20-%20Estadisticas.png)
