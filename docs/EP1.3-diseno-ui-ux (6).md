# EP1.3 — Bocetos de UI/UX y prototipo en Figma

## Prototipo

Enlace al Figma: https://www.figma.com/design/NMUudu0YPxumGuZedsLVDS/FocalWare?node-id=52-15&p=f&m=draw

El diseño fue elaborado manualmente por el equipo en Figma, usando formas, marcos y componentes, sin asistentes de IA generativa, según lo exigido por la pauta del curso. El proceso partió con bocetos de baja fidelidad (ver las páginas "Wireframes Generales", "Wireframes Vecinos" y "Wireframes Funcionarios" del archivo Figma) antes de definir la versión final de cada pantalla.

## Paleta de color (Propuesta 6)

| Color | Hex | Uso |
|---|---|---|
| Blanco | `#FFFFFF` | Fondo base |
| Durazno claro | `#FFE8C9` | Fondo secundario / superficies |
| Rosa claro | `#FFE9E7` | Fondo secundario alternativo |
| Naranja | `#FCB860` | Acento cálido / riesgo medio |
| Coral | `#F45648` | Acento primario / enlaces |
| Rojo | `#E72441` | Botón principal / riesgo alto |
| Mauve gris | `#C6ACAA` | Bordes / texto secundario |
| Gris oscuro | `#423C3D` | Texto primario |

*Nota: confirmar que estos valores calcen exactamente con los estilos de color guardados en el archivo Figma.*

## Pantallas y su relación con los requerimientos funcionales

| Pantalla | Requerimiento funcional | Versión |
|---|---|---|
| Inicio de sesión | Transversal (no es RF) | Mobile y web |
| Crear cuenta | Transversal (no es RF) | Mobile y web |
| Recuperar contraseña | Transversal (no es RF) | Web |
| Crear reporte (foto, ubicación, categoría, volumen, distancia, descripción) | RF-01, RF-02 | Mobile: 2 pasos · Web: una sola vista |
| Confirmación de reporte creado | RF-01, RF-10 | Mobile y web |
| Modal de reporte ya existente | RNF-08, RF-14 | Mobile y web |
| Mapa de reportes (pantalla de inicio, con panel de filtros y estado sin coincidencias) | RF-03, RF-04, RF-11 | Mobile y web · Vecino y Funcionario |
| Vista de detalle de reporte | RF-15 | Mobile y web |
| Notificaciones (línea de tiempo de estados de un reporte) | RF-08 | Web |
| Mis reportes (historial y pendientes de envío) | RF-08, RF-13, RF-14 | Mobile y web · Vecino y Funcionario |
| Mi Perfil (configuración de la cuenta, notificaciones, términos y condiciones) | Navegación general | Web |
| Gestión municipal / cola priorizada | RF-06, RF-07 | Web |
| Menú de opciones del Funcionario por reporte (aprobar con cuadrilla/fecha, rechazar, controlado, modificar) | RF-12, RF-16, RF-17 | Web |
| Motivo de rechazo | RF-18 | Web |
| Estadísticas mensuales | RF-09 | Web |

RF-05 (cálculo del índice ponderado) es lógica de sistema y no tiene pantalla propia: se refleja en los badges de color (alto/medio/bajo) del mapa, de Mis reportes y en el orden de la cola de Gestión municipal. Las pantallas de rol Funcionario (RF-06, RF-07, RF-09, RF-12, RF-16, RF-17, RF-18) forman parte del alcance del proyecto, en cumplimiento del requisito de roles diferenciados que exigen EP1.4 y EP1.5.

## Adaptación móvil / web

- **Móvil:** navegación con barra inferior fija (Mapa, Reportar, Mis reportes, Perfil).
- **Web:** navegación con menú lateral fijo de íconos — Mapa, Mis reportes, Crear Reporte, Mi perfil y Estadísticas (este último visible solo para el rol Funcionario, siguiendo la misma diferenciación de permisos que en mobile).
- **Crear reporte:** en móvil se divide en 2 pasos, según el máximo que exige RNF-01; en escritorio se consolida en una sola vista con todos los campos visibles a la vez, aprovechando el espacio horizontal disponible.

## Flujos principales

**Flujo Vecino/a:** inicia sesión → crea un reporte georreferenciado con foto (funciona sin conexión y queda en una cola de envío pendiente) → si el sistema detecta un reporte activo cercano, ofrece apoyarlo con un voto en vez de crear uno duplicado (RNF-08, RF-14) → consulta el mapa para ver el estado general del sector, con filtros por categoría, riesgo y fecha → revisa el detalle de cualquier reporte → recibe notificaciones cuando su reporte cambia de estado y puede revisar el historial completo, junto con sus reportes aún no enviados, en Mis reportes.

**Flujo Funcionario:** inicia sesión → accede a la cola de incidentes ya priorizada según el índice ponderado que calcula el sistema → selecciona un reporte y usa su menú de opciones para aceptarlo, rechazarlo (con motivo obligatorio) o modificarlo → si lo acepta, asigna una cuadrilla, una fecha de acción y una descripción opcional → si cuenta con autorización de cuadrilla, puede además generar un reporte de control → consulta las estadísticas mensuales y exporta los datos a CSV.

## Formulario de registro

| Campo | Obligatorio | Justificación |
|---|---|---|
| Nombre para mostrar | Sí | Identifica al vecino/a dentro de la comunidad sin exponer su nombre legal completo. |
| Correo electrónico | Sí | Identificador único de la cuenta y canal de recuperación de contraseña. |
| Contraseña / Confirmar contraseña | Sí | Seguridad de la cuenta; se solicita confirmación para evitar errores de tipeo. |
| Cerro o unidad vecinal | Sí | Permite ubicar contextualmente los reportes del usuario sin pedir una dirección exacta. |
| Teléfono | No | Opcional, solo para notificaciones alternativas si el usuario lo prefiere. |
| Aceptación de términos y política de privacidad | Sí | Requisito legal antes de habilitar la cuenta. |

No se solicitan RUT ni dirección exacta: ninguno de los dos es necesario para que la aplicación funcione, y evitarlos reduce el riesgo de exponer datos personales sensibles (ver RNF-07).

El formulario representa visualmente:

- **Campos obligatorios y opcionales:** asterisco en los obligatorios, borde punteado en los opcionales.
- **Formato esperado de los datos:** el campo de correo muestra un placeholder tipo "nombre@correo.cl"; el de contraseña indica el mínimo de caracteres requerido.
- **Validaciones de entrada:** en tiempo real, por ejemplo el campo "Confirmar contraseña" se marca en rojo si no coincide con la contraseña original.
- **Mensajes de error específicos por campo:** por ejemplo "este correo ya está registrado" o "las contraseñas no coinciden" (a diferencia del login, que usa un error genérico por seguridad).
- **Retroalimentación ante el envío:** el botón cambia a un estado de carga y luego confirma la creación de la cuenta.
- **Condiciones de seguridad de la contraseña:** indicador de fuerza (débil/media/robusta) y mínimo de 8 caracteres.
- **Experiencia coherente con los usuarios objetivo:** lenguaje simple y directo, pensado para vecinos con distintos niveles de experiencia tecnológica.

## Formulario de inicio de sesión

Campos: correo y contraseña. El campo de correo valida el formato esperado (debe contener "@" y un dominio) antes de permitir el envío. Ante un error, muestra un mensaje genérico —sin indicar cuál de los dos campos falló, por seguridad— y un estado de carga en el botón mientras se valida la sesión.
