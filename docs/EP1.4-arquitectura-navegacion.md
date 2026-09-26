# EP 1.4 · Arquitectura de Navegación y Experiencia de Usuario

**FocalWare** · Priorización de limpieza por riesgo de incendio en las quebradas de Valparaíso

[← Volver al README](../README.md)
[← Volver a EP 1.3](EP1.3-diseno-ui-ux.md)

---

## 1. Estructura de rutas

La aplicación organiza sus rutas en cuatro grupos según el nivel de acceso requerido.

### 1.1 Rutas públicas

Accesibles sin sesión iniciada.

| Ruta | Vista | Descripción |
|---|---|---|
| `/` | Inicio | Presentación del proyecto. Si existe sesión activa, redirige según el rol |
| `/mapa` | Mapa de reportes | Visualización de reportes y su nivel de riesgo (RF-03, RF-04, RF-10, RF-11, RF-15) |
| `/mapa/:id` | Detalle de un reporte | Visualización de un reporte en especifico seleccionado desde la vista de mapa (RF-03, RF-04, RF-15) |
| `/login` | Inicio de sesión | Autenticación única para ambos roles |
| `/registro` | Crear cuenta | Registro disponible solo para el rol Vecino |
| `/recuperar` | Recuperar contraseña | Solicitud de código por correo |
| `/recuperar/codigo` | Validación de código | Ingreso del código recibido |
| `/recuperar/nueva` | Nueva contraseña | Definición de la nueva credencial |

La ruta `/mapa` es pública en todos los casos. Lo que cambia según el estado de sesión no es el acceso a la vista, sino las acciones disponibles dentro de ella: sin sesión solo se consulta, con sesión de Vecino se habilita apoyar y reportar, y con sesión de Funcionario se habilitan los filtros de gestión.

### 1.2 Rutas Compartidas (Incluye rutas de rol vecino)
Requieren una sesión activa con rol `vecino` o `funcionario`.

| Ruta | Vista | Requerimiento |
|---|---|---|
| `/reportar` | Crear Reporte | RF-01, RF-02, RF-10, RNF-08|
| `/mis-reportes` | Listado propio y cola de sincronización | RF-02, RF-04, RF-10 |
| `/mis-reportes/:id` | Detalle de un reporte | RF-15 | 
| `/mis-reportes/en-local/:id` | Modificar un reporte guardado localmente (offline)| RF-13, RF-15|
| `/mi-perfil` | Opciones de perfil de usuario, por defecto aparecen las notificaciones del usuario|  RF-08|
| `/mi-perfil/terminos` | Términos y condiciones | Ninguno |
| `/mi-perfil/configuracion` | Configuración de la cuenta | Ninguno|

Se especifican de esta forma ya que tanto `vecino` como `funcionario` comparten las pantallas, pero dependiendo el rol estas van cambiando

### 1.3 Rutas protegidas del rol Funcionario

Requieren sesión activa con rol `funcionario`.

| Ruta | Vista | Requerimiento |
|---|---|---|
| `/municipal/reporte/:id` | Detalle de un reporte, opciones de gestión y reportes de control | RF-05, RF-12, RF-15, RF-16, RF-17, RF-18|
| `/municipal/estadisticas` | Panel de métricas y puntos críticos | RF-09 |

El prefijo `/municipal` agrupa las rutas del rol Funcionario bajo un mismo espacio de nombres, lo que permite aplicar la verificación de rol a nivel de rama completa en lugar de ruta por ruta.

## 2. Jerarquía de vistas

```
Raíz
│
├── Zona pública
│   ├── Inicio
│   ├── Mapa de reportes
│   │   └── Detalle de reporte (superpuesto)
│   └── Autenticación
│       ├── Inicio de sesión
│       ├── Crear cuenta
│       └── Recuperar contraseña
│           ├── Solicitud de código
│           ├── Validación de código
│           └── Nueva contraseña
│
├── Zona compartida (Vecino y Funcionario)
│   ├── Crear reporte
│   │   ├── Paso 1: Foto y ubicación
│   │   └── Paso 2: Categoría, volumen y descripción
│   │       └── Modal de advertencia de duplicados (superpuesto)
│   ├── Mis reportes
│   │   ├── Detalle de reporte propio
│   │   └── Modificar reporte offline (guardado en local)
│   └── Mi perfil
│       ├── Notificaciones
│       ├── Configuración de la cuenta
│       └── Términos y condiciones
│
└── Zona Funcionario (Municipal)
    ├── Panel de estadísticas (Métricas y puntos críticos)
    └── Gestión de reportes
        └── Detalle administrativo
            ├── Aceptar / Rechazar reporte
            ├── Modificar reporte en nube (Reutiliza vista compartida)
            └── Generar reporte de control
```

La recuperación de contraseña es una secuencia lineal de tres niveles porque cada paso depende de la validación del anterior. La creación de reporte es una secuencia de dos pasos, decisión que responde a RNF-01, que limita el flujo a un máximo de tres pasos.

## 3. Diferenciación de acceso según roles

### 3.1 Autenticación unificada

Existe un único formulario de inicio de sesión para ambos roles. No se presenta al usuario una elección previa de perfil.

La decisión responde a dos criterios. El primero es de seguridad. Un selector de rol previo revelaría a un atacante qué tipos de cuenta existen en el sistema, y un mensaje de error diferenciado permitiría enumerar cuentas válidas. El segundo es de usabilidad. Elimina un paso de decisión innecesario, dado que el usuario ya sabe qué perfil tiene y el sistema puede determinarlo a partir de sus credenciales.

Tras validar las credenciales, el backend devuelve el rol dentro del token y el frontend redirige según corresponda.

| Rol | Destino tras autenticar |
|---|---|
| `vecino` | `/mapa` |
| `funcionario` | `/mapa` |

### 3.2 Creación de cuentas

El registro público está disponible únicamente para el rol Vecino. Las cuentas del rol Funcionario son creadas internamente por un administrador.

La justificación es de verificación de identidad. El sistema no dispone de un mecanismo automatizado confiable para comprobar que quien declara ser funcionario municipal efectivamente lo es. Permitir el auto-registro con un rol elevado habilitaría que cualquier persona accediera a datos sensibles y modificara el estado de los incidentes. La creación administrada traslada esa verificación a un proceso jerárquico externo al sistema.

### 3.3 Acceso público parcial

El mapa interactivo, la ubicación de los pines y el nivel de riesgo de los reportes son visibles sin sesión. Sin embargo, crear un reporte o apoyar uno existente (UpVote) requiere autenticación obligatoria.

Esta división responde al propósito del proyecto y al perfil de usuarios. La transparencia hacia la comunidad forma parte del valor de la plataforma, y exigir registro solo para consultar información elevaría la barrera de entrada en un público con alfabetización digital heterogénea. La autenticación se exige únicamente en las acciones transaccionales que escriben datos o que inciden directamente en la priorización municipal (cálculo del índice ponderado).

### 3.4 Matriz de acceso por vista

| Vista / Funcionalidad | Sin sesión | Vecino | Funcionario |
|---|---|---|---|
| **Inicio (`/`)** | Accede a presentación | Redirige a `/mapa` | Redirige a `/mapa` (Con filtros activos por defecto de mayor a menor riesgo y sin estado) |
| **Mapa de reportes** | Visualización y filtros públicos | Visualización, filtros y apoya (UpVote) | Filtros de gestión y vista de puntos críticos |
| **Detalle de reporte** | Solo lectura de información | Lectura y apoya (UpVote) | Vista completa (Aceptar, Rechazar, Modificar, Asignar) |
| **Crear reporte** | No | Sí | Sí |
| **Mis reportes / Offline** | No | Sí (Solo propios) | Sí (Solo propios) |
| **Generar Reporte de Control** | No | No | Sí |
| **Panel de estadísticas** | No | No | Sí |
| **Perfil y Notificaciones**| No | Sí | Sí |

**Justificación de permisos cruzados y restricciones:**
A diferencia de modelos tradicionales, el rol Funcionario sí tiene permisos para crear reportes y acceder a su propio listado de incidencias. Esto permite aprovechar a los trabajadores municipales como agentes activos en terreno para el levantamiento de incidencias ambientales. 

Para evitar conflictos de interés y proteger la integridad administrativa, la separación de responsabilidades se aplica en el cierre del flujo: aunque un funcionario puede originar un reporte, la capacidad de generar un **Reporte de Control** (evidencia de resolución) está estrictamente restringida por sistema a aquellos funcionarios que formen parte de la cuadrilla asignada a ese reporte específico.

## 4. Flujos de tareas principales (Task Flows)

### 4.1 Crear un reporte (Vecino y Funcionario)

```
Mapa → Botón de acción "Crear Reporte"
     → Paso 1: Captura de fotografía(s) y confirmación de ubicación GPS
     → Paso 2: Selección de categoría, volumen estimado y descripción (opcional)
     → Verificación automática de duplicados (RNF-08)
        ├── Existe antecedente cercano → Se despliega modal de alerta
        │      ├── Apoyar el existente (UpVote) → Retorno al Mapa
        │      └── Continuar creación → Avanza al envío
        └── No existe → Avanza al envío
     → Decisión del sistema (Estado de red)
        ├── Con conexión → Envío exitoso → Mensaje de confirmación y desvío a Mis reportes
        └── Sin conexión → Guardado local offline (RF-02) → Estado "Pendiente de envío"
El flujo cumple RNF-01 con dos pasos de captura más la confirmación, dentro del límite de dos.
```

### 4.2 Gestionar y controlar un reporte (Funcionario)

```
Mapa interactivo (Vista de Funcionario)
     → Carga inicial: Ordenamiento por defecto (Reportes no resueltos y de alto riesgo priorizados)
     → Acción opcional: Aplicar filtros avanzados (Búsqueda por ID, nivel de riesgo, sector, fecha)
     → Seleccionar reporte (desde un pin en el mapa o la lista lateral)
     → Vista de Detalle (RF-15) → Desplegar "Opciones de Funcionario" (RF-12)
     → Acción de Gestión:
        ├── Aceptar (RF-17)
        │      └── Asignar cuadrilla, programar fecha y descripción → Estado 'Aprobado'
        ├── Rechazar (RF-18)
        │      └── Ingresar motivo obligatorio → Estado 'Rechazado'
        ├── Modificar (RF-12)
        │      └── Reutilizar vista de formulario para corregir datos (categoría, volumen estimado y distancia de hogares) y guardar
        └── Reporte de Control (RF-16)
               ├── El sistema valida si el funcionario pertenece a la Cuadrilla Asignada
               │      ├── Sí → Permite adjuntar evidencia de cierre → Estado 'Controlado'
               │      └── No → Alerta de permisos insuficientes
     → Dispara notificación automática al autor del reporte (RF-08)
```

### 4.3 Consultar el mapa sin sesión

```
Inicio → Mapa público
     → Seleccionar marcador → resumen con nivel de riesgo
     → Intentar apoyar o reportar
        → Redirección a Inicio de sesión
        → Tras autenticar, retorno a la acción pendiente
```

## 5. Puntos críticos de interacción

Se identifican los momentos del flujo donde una falla de diseño produce abandono o pérdida de datos.

| Punto crítico | Riesgo | Tratamiento |
|---|---|---|
| Captura de ubicación GPS | Señal imprecisa o ausente en quebradas | Permitir ajuste manual del pin y mostrar la precisión estimada |
| Envío sin conectividad | Pérdida del reporte y del esfuerzo del usuario | Guardado local automático y cola de sincronización visible (RF-02) |
| Detección de duplicado | El usuario crea un reporte redundante, ensuciando la base de datos, o abandona la app. | Modal automático que explica la consecuencia de cada opción y redirige a apoyar el reporte existente (RNF-08). |
| Acción restringida sin sesión | Abandono al encontrarse con un muro de registro | Redirección al login conservando la acción pendiente, y retorno automático |
| Interacción de UpVotes | Toques accidentales que alteren artificialmente la prioridad en la cola de atención municipal (RF-06). | Feedback visual inmediato (cambio de color/animación) y capacidad de revertir la acción pulsando nuevamente. |
| Rechazo de un reporte | El vecino no entiende por qué se descartó | Motivo obligatorio para el funcionario, visible en el historial (RF-18) |
| Generación de Reporte de Control | Cierre de incidencias sin respaldo real o por personal externo a la tarea. | Validación estricta de pertenencia a la Cuadrilla asignada (RF-16) y exigencia de evidencia fotográfica para transicionar al estado "Controlado". |
| Sesión expirada durante la gestión | Pérdida de datos ingresados en el formulario (RNF-05) | Aviso previo a la expiración y conservación del formulario tras reautenticar |

## 6. Coherencia de experiencia entre dispositivos

Ambas plataformas exponen las mismas cuatro secciones principales, con componentes de navegación distintos según las convenciones de cada entorno.

| Aspecto | Móvil | Web |
|---|---|---|
| Componente de navegación | Barra inferior fija (`IonTabs`) | Menú lateral fijo (`IonMenu`) |
| Secciones | Mapa, Reportar, Mis reportes, Perfil | Las mismas cuatro |
| Densidad de información | Una vista a la vez, contenido secuencial | Vistas simultáneas, por ejemplo mapa junto al listado |
| Bandeja de triage | Tarjetas apiladas con datos esenciales | Tarjetas apiladas con datos esenciales |
| Creación de reporte | Flujo por pasos con indicador de progreso | Formulario en vista unica |
| Detección de duplicado | Modal a pantalla completa | Diálogo centrado sobre la vista |

Las rutas son idénticas en ambas plataformas. La presentación varía según el dispositivo; la estructura de navegación se mantiene. De este modo, un enlace compartido conduce a la misma vista en cualquier dispositivo.

La bandeja de triage se diseña primero en la versión web, dado que el contexto de uso del rol Funcionario es de escritorio en oficina, según la caracterización de EP 1.2.

## 7. Justificación técnica de las decisiones

### 7.1 Usabilidad

El flujo de creación de reporte se divide en pasos porque el contexto de uso es en terreno, de pie y con una sola mano disponible. Presentar todos los campos en una vista única exigiría desplazamiento vertical y aumentaría la tasa de abandono. El límite de dos pasos de RNF-01 responde a esa misma restricción.

La barra inferior en móvil sitúa los destinos principales dentro del área alcanzable con el pulgar, criterio relevante dado que una parte del público objetivo utiliza el teléfono al aire libre y en movimiento.

### 7.2 Eficiencia de interacción

La bandeja de triage ordena por índice de riesgo en lugar de por fecha de ingreso, lo que reduce el trabajo de decisión del funcionario. La información relevante para priorizar ya está calculada y ordenada al abrir la vista.

La detección de duplicados se ejecuta antes de confirmar el envío y no después, evitando que el usuario complete el flujo para luego descubrir que su aporte era redundante.

### 7.3 Claridad estructural

La separación de rutas mediante el prefijo `/municipal` permite que la verificación de rol se aplique a una rama completa del árbol de rutas, en lugar de repetirse en cada ruta individual. Esto reduce la posibilidad de que una vista quede desprotegida por omisión.

La correspondencia entre las cuatro secciones de navegación y las cuatro tareas principales del usuario mantiene un modelo mental estable, donde cada sección cumple una función distinta y no se superpone con las demás.

### 7.4 Escalabilidad de la arquitectura frontend

La estructura modular en `pages`, `components`, `routes` y `services` permite incorporar nuevas vistas sin modificar la configuración de rutas existente.

La organización de `pages` en subcarpetas por rol permite incorporar nuevas secciones dentro de un rol existente, o un rol adicional, sin reestructurar los ya implementados.

La lógica de verificación de rol se concentra en un componente de ruta protegida reutilizable, de modo que el criterio de acceso se define en un solo lugar y se aplica por composición.
