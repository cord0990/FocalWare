<div align="center">

<img src="docs/img/header.svg" alt="FocalWare: priorización de limpieza por riesgo de incendio en las quebradas de Valparaíso" width="100%">

[![Prototipo en Figma](https://img.shields.io/badge/Prototipo-Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white)](https://www.figma.com/design/NMUudu0YPxumGuZedsLVDS/FocalWare?node-id=52-15&t=YzxsRCsrL1DTuLju-1)
[![Requerimientos](https://img.shields.io/badge/Requerimientos-1F2937?style=for-the-badge)](#requerimientos-funcionales)
[![Instalación](https://img.shields.io/badge/Instalación-1F2937?style=for-the-badge)](#instalación)

<br>

![Ionic](https://img.shields.io/badge/Ionic-9-3880FF?style=flat-square&logo=ionic&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)

</div>

## Capturas

**Mapa de reportes:** pantalla de entrada de la aplicación. Muestra los reportes de Valparaíso marcados según su nivel de riesgo y la lista ordenada a la derecha.

![Mapa de Valparaíso con los reportes marcados con colores según su nivel de riesgo (crítico, alto, medio y bajo) y la lista de reportes ordenada por riesgo al costado derecho](./docs/img/mapa.png)

**Inicio de sesión:** un solo formulario para vecinos y funcionarios, con campos obligatorios marcados y el formato esperado del correo.

![Pantalla de inicio de sesión de FocalWare con los campos de correo y contraseña marcados como obligatorios, el botón Iniciar sesión y los enlaces para recuperar la contraseña y crear una cuenta](./docs/img/login.png)

**Crear reporte (Vecino):** formulario con el desglose del riesgo, el clima actual, el mapa para marcar la ubicación y las fotos del reporte.

![Formulario para crear un reporte con el riesgo estimado, el desglose de categoría, volumen y distancia a viviendas, el clima actual, un mapa para marcar la ubicación y el espacio para agregar hasta 5 fotos](./docs/img/reporte.png)

**Estadísticas (Funcionario):** cifras del mes, tiempo promedio de resolución por sector y evolución mensual.

![Panel de estadísticas del funcionario con los reportes totales y resueltos del mes, el tiempo promedio de resolución por sector en un gráfico de barras y la evolución mensual de reportes recibidos y resueltos](./docs/img/estadisticas.png)

## Tabla de contenidos
- [Capturas](#capturas)
- [Prototipo](#prototipo)
- [Descripción general](#descripción-general)
- [Problema que aborda](#problema-que-aborda)
- [Objetivos](#objetivos)
- [Equipo](#equipo)
- [Roles del sistema](#roles-del-sistema)
- [Requerimientos funcionales](#requerimientos-funcionales)
- [Requerimientos no funcionales](#requerimientos-no-funcionales)
- [Tecnologías](#tecnologías)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Base de datos](#base-de-datos)
- [Ejecución](#ejecución)
- [Usuarios de prueba](#usuarios-de-prueba)
- [Estado del proyecto](#estado-del-proyecto)
- [Documentación](#documentación)

## Prototipo

El diseño de las pantallas fue elaborado manualmente en Figma, considerando versión móvil y versión web.

[Ver prototipo en Figma](https://www.figma.com/design/NMUudu0YPxumGuZedsLVDS/FocalWare?node-id=52-15&t=YzxsRCsrL1DTuLju-1)

La documentación del diseño, con paleta, correspondencia entre pantallas y requerimientos, y justificación de los formularios, está en [docs/EP1.3-diseno-ui-ux.md](docs/EP1.3-diseno-ui-ux.md).

## Descripción general

FocalWare permite a los habitantes de los cerros de Valparaíso reportar de forma georreferenciada la acumulación de residuos y material combustible en quebradas y sitios eriazos.

El municipio recibe una cola de atención ordenada por riesgo y no por fecha de ingreso. Ese orden se calcula a partir del tipo de residuo, la proximidad a viviendas, la concentración de reportes en el sector, la antigüedad sin resolución y las condiciones meteorológicas vigentes obtenidas en tiempo real.

El sistema también detecta **puntos críticos recurrentes**, que permiten distinguir los lugares que necesitan limpieza de los que necesitan infraestructura.

## Problema que aborda

Las quebradas de Valparaíso son corredores por los que el fuego asciende con rapidez y, a la vez, los lugares donde se acumula el vertido informal de residuos. La basura acumulada es material combustible almacenado a metros de viviendas. El incendio de marzo de 2015, que obligó a evacuar a unas 7.000 personas, se originó en un vertedero clandestino.

Hoy las cuadrillas municipales son limitadas y la atención sigue el orden de llegada de los reclamos, no la magnitud del riesgo. Los vecinos conocen los puntos críticos de su sector, pero esa información se canaliza por vías no estructuradas donde no se registra, no se georreferencia y no se puede analizar en el tiempo.

Desafíos CTD Litoral abordados: **#11** (capacidad para manejo de residuos) y **#30** (coordinación para la gestión de riesgos de desastres).

## Objetivos

**Objetivo general.** Desarrollar una plataforma web y móvil que capture reportes ciudadanos georreferenciados de acumulación de residuos y priorice automáticamente su atención según un índice de riesgo de incendio.

**Objetivos específicos**
1. Implementar el reporte georreferenciado con fotografía, operativo con conectividad intermitente.
2. Desarrollar un motor de priorización que combine atributos del reporte con datos meteorológicos en tiempo real.
3. Construir un panel de gestión municipal con triage, asignación y seguimiento de estados.
4. Detectar automáticamente puntos críticos recurrentes a partir del historial.
5. Desplegar la solución completa mediante Docker.

## Equipo

| Integrante | Responsabilidades |
|---|---|
| Diego Cordova | Desarrollo web y Diseño UI/UX en Figma |
| Macarena Catalan | Diseño UI/UX en Figma y Documentación |
| Agustín Guzmán | Desarrollo web y Diseño UI/UX en Figma |
| Daniel Castro | Diseño UI/UX en Figma y Documentación |

## Roles del sistema

| Rol | Permisos |
|---|---|
| **Vecino/a** | Crear y apoyar reportes, consultar el mapa, ver el historial de sus reportes, recibir notificaciones |
| **Funcionario municipal** | Acceder a la cola priorizada, asignar cuadrillas, cambiar estados, cerrar con evidencia, ver indicadores y exportar datos |

La caracterización de los usuarios objetivo y las proto-personas están documentadas en [docs/EP1.2-usuarios-y-protopersonas.md](docs/EP1.2-usuarios-y-protopersonas.md).

## Requerimientos funcionales

Inicio de sesión y registro no se contabilizan como requerimientos funcionales, ya que son funcionalidades transversales de soporte.

La especificación completa, con tipo y dependencias de cada requerimiento, está en [docs/EP1.1. Requerimientos del sistema.md](docs/EP1.1.%20Requerimientos%20del%20sistema.md).

| ID | Nombre | Descripción | Usuario |
|---|---|---|---|
| **RF-01** | Registro de reporte georreferenciado | Permitir crear un reporte con ubicación GPS, fotografías, categoría de residuo, volumen estimado y descripción. | Vecino / Funcionario |
| **RF-02** | Almacenamiento local offline | Guardar localmente los reportes creados sin conexión a internet. | Vecino |
| **RF-03** | Visualización en mapa interactivo | Desplegar un mapa interactivo con las localizaciones asociadas a los reportes existentes. | Vecino / Funcionario |
| **RF-04** | Filtrado del mapa interactivo | Filtrar el mapa por estado, categoría, riesgo, sector y fecha. | Vecino / Funcionario |
| **RF-05** | Cálculo de índice ponderado | Calcular un índice ponderado según categoría, volumen, reportes cercanos, antigüedad y condiciones meteorológicas externas. | Sistema |
| **RF-06** | Aplicación del índice ponderado | Utilizar el índice ponderado para priorizar la cola de atención municipal. | Sistema |
| **RF-07** | Gestión municipal de incidentes | Ver la cola priorizada, asignar cuadrilla, programar atención, cambiar estado y adjuntar evidencia de cierre. | Funcionario |
| **RF-08** | Notificación y trazabilidad de reportes | Notificar al autor los cambios de estado y exponer el historial completo de transiciones. | Vecino |
| **RF-09** | Estadísticas mensuales | Acceder a un resumen mensual con el total de reportes, los reportes resueltos, el tiempo promedio de resolución y la evolución mensual. | Funcionario |
| **RF-10** | Identificador único de reportes | Generar y asignar automáticamente un identificador único para cada reporte creado. | Sistema |
| **RF-11** | Ocultamiento automático de reportes controlados | Ocultar del mapa los reportes en estado "Controlado" después de un mes, manteniendo su visualización de forma exclusiva para funcionarios. | Vecino / Funcionario |
| **RF-12** | Opciones de Funcionario en reportes | Acceder a un menú para cada reporte que incluya: aceptar, rechazar, modificar o generar un reporte de control. | Funcionario |
| **RF-13** | Modificación Offline | Permitir modificar los reportes guardados en el almacenamiento local que aún no han sido enviados. | Vecino / Funcionario |
| **RF-14** | Votos a favor de reportes | Permitir a los usuarios aumentar la relevancia de un reporte mediante un sistema de votos a favor (upvotes). | Vecino / Funcionario |
| **RF-15** | Vista de Detalles | Mostrar ubicación, sector, ID, fotografías (hasta 5), categoría de residuo, volumen estimado, votos a favor, descripción, riesgo y clima. | Vecino / Funcionario |
| **RF-16** | Limitación de reporte controlado | Permitir a un funcionario crear un reporte controlado únicamente si cuenta con la autorización para la cuadrilla asignada. | Funcionario |
| **RF-17** | Asignación de reporte | Permitir a los funcionarios asignar a un reporte aprobado una cuadrilla, una fecha de acción y una descripción opcional. | Funcionario |
| **RF-18** | Motivos de Rechazo | Exige a los funcionarios asignar a un reporte rechazado una descripción obligatoria que indique el motivo del rechazo. | Funcionario |

## Requerimientos no funcionales

| ID | Nombre | Criterio | Tipo |
|---|---|---|---|
| **RNF-01** | Límite de pasos de reporte | Crear un reporte en máximo 2 pasos. | Usabilidad |
| **RNF-02** | Dimensiones mínimas y accesibilidad | Controles de al menos 44x44 px y texto base de 16 px, según WCAG 2.1 Nivel AA. | Accesibilidad |
| **RNF-03** | Descarga de reportes sin conexión | Operar sin conexión a internet para los reportes de los vecinos. | Disponibilidad / Integridad |
| **RNF-04** | Cifrado de credenciales | bcrypt con mínimo 10 rondas. | Seguridad |
| **RNF-05** | Expiración y rotación de tokens | JWT con expiración de 15 minutos, algoritmo asimétrico y mecanismo de rotación. | Seguridad |
| **RNF-06** | Restricción CORS | Lista blanca explícita de dominios, sin comodines en endpoints autenticados. | Seguridad |
| **RNF-07** | Disociación y anonimización | Disociación total de la identidad de los autores en reportes públicos, conforme a la Ley N° 19.628. | Privacidad |
| **RNF-08** | Validación de duplicados y orden de prioridad | Validar que el reporte no exista previamente | Integridad de los datos |
| **RNF-09** | Compatibilidad móvil | Android 9 o superior, iOS 14 o superior. | Portabilidad |
| **RNF-10** | Compatibilidad web | Chrome, Firefox, Edge y Safari en sus versiones actuales y anteriores (N-2). | Portabilidad |
| **RNF-11** | Contenerización y despliegue | Despliegue completo con Docker y Docker Compose, configuración en variables de entorno. | Arquitectónico |
| **RNF-12** | Exportación de datos | Exportar reportes a formato CSV. | Interoperabilidad |

## Tecnologías

| Capa | Herramientas |
|---|---|
| Frontend | Ionic 9, React 19, TypeScript, Vite |
| Navegación | React Router |
| Mapas | [Leaflet](https://leafletjs.com/) con React Leaflet. Mapa base de [Esri World Street Map](https://www.arcgis.com/home/item.html?id=3b93337983e9436f8db950e38a8629af) (vista simple) y [OpenStreetMap](https://www.openstreetmap.org/) (vista detallada), con mapa de calor mediante `leaflet.heat` |
| Backend | Node.js (20.19+), Express |
| Base de datos | PostgreSQL 16, Prisma 7 (ORM) |
| Seguridad | JWT (`jsonwebtoken`), bcrypt (`bcryptjs`) |
| Archivos | `multer` (fotos JPG/PNG/WEBP, hasta 5 por envío) |
| Contenerización | Docker y Docker Compose |
| Pruebas de API | Postman (colección en `backend/postman/`) |
| Servicio externo | [Open-Meteo](https://open-meteo.com/) (temperatura, humedad y viento) |
| Herramientas | Git, GitHub, Figma |

## Estructura del repositorio

| Rama | Contenido |
|---|---|
| `main` | Documentación general del proyecto y entregas (EP1/EP2) |
| `frontend` | Interfaz Ionic/React, componentes, servicios y pruebas end-to-end (Cypress) |
| `backend` | API REST, Prisma, migraciones, scripts SQL, Postman y uploads |

**Rama `frontend`**

```
frontend/src/
├── pages/
│   ├── publico/        # Mapa, detalle, login, registro y ayuda (sin sesión)
│   ├── compartido/     # Crear reporte, mis reportes y perfil (con sesión)
│   └── municipal/      # Estadísticas (solo funcionario)
├── components/         # Componentes reutilizables
├── routes/             # Rutas y protección por rol
├── services/           # Datos y consumo de la API
├── hooks/              # Lógica reutilizable
├── context/            # Estado compartido (sesión y menú)
└── utils/              # Cálculo del riesgo, validaciones y filtros
```

La arquitectura de navegación, con las rutas, el acceso por rol y los flujos de tareas, está en [docs/EP1.4-arquitectura-navegacion.md](docs/EP1.4-arquitectura-navegacion.md).

**Rama `backend`**

```
backend/
├── src/
│   ├── routes/         # Definición de endpoints
│   ├── controllers/    # Lógica de cada endpoint
│   ├── services/       # Lógica de negocio y acceso a datos
│   ├── middlewares/    # Sesión, roles, validaciones y subida de fotos
│   └── db/             # Prisma: cliente, tipos y repositorios
├── prisma/
│   ├── schema.prisma   # Esquema (fuente de verdad)
│   └── migrations/     # Migraciones aplicadas por Docker
├── database/
│   ├── focalware.sql   # Esquema + datos para montar a mano
│   └── datos_prueba.sql
├── postman/            # Colección de pruebas de la API
└── uploads/
    ├── reportes/       # Fotos de los vecinos
    └── controles/     # Fotos de evidencia de los funcionarios
```

El detalle de la estructura del backend está en [docs/EP2.1-estructura-backend.md](docs/EP2.1-estructura-backend.md).

## Instalación

Requisitos previos: Node.js **20.19 o superior** (Prisma 7 lo exige), npm 9 o superior, Git y, para la opción con Docker, Docker y Docker Compose.

Hay dos formas de levantar el proyecto: **con Docker** (recomendada) y **sin Docker**. En ambos casos el frontend se levanta al final con `npm run dev`.

> Para la Opción A, asegúrate de tener **Docker Desktop abierto y activo** antes de ejecutar los comandos.

### Opción A: con Docker (recomendada)

Levanta la base de datos y la API. El contenedor de la API aplica las migraciones de Prisma al arrancar.

1. Clonar el repositorio:

```bash
git clone https://github.com/cord0990/FocalWare.git
cd FocalWare
```

2. Crear el archivo de entorno del backend copiando el ejemplo. Los valores por defecto ya funcionan con Docker; solo hay que ajustarlos si se cambia la contraseña o el puerto:

```bash
cp backend/.env.example backend/.env
```

3. Levantar base de datos + API:

```bash
docker compose up -d --build
```

4. Cargar los datos de prueba (opcional, recomendado):

```bash
docker exec -i focalware-db psql -U postgres -d focalware < backend/database/datos_prueba.sql
```

5. Frontend:

```bash
cd frontend
npm install
# opcional: crear frontend/.env con VITE_API_URL (ver sección de variables)
npm run dev
```

### Opción B: sin Docker

Usa un PostgreSQL instalado en el equipo. El script `backend/database/focalware.sql` crea la base, las tablas y carga los datos de prueba.

1. Clonar el repositorio (si no se hizo):

```bash
git clone https://github.com/cord0990/FocalWare.git
cd FocalWare
```

2. Crear la base de datos a partir del script:

```bash
psql -U postgres -h localhost -f backend/database/focalware.sql
```

> Si `psql` no se reconoce, usa la ruta completa (por ejemplo `C:\Program Files\PostgreSQL\18\bin\psql.exe`) o agrega esa carpeta al `PATH`.

3. Backend (API):

```bash
cd backend
npm install
cp .env.example .env   # los valores por defecto apuntan a localhost:5434; ajustar si tu PostgreSQL usa otro puerto/contraseña
npm start              # compila (prestart) y levanta la API en http://localhost:3000
```

4. Frontend:

```bash
cd ../frontend
npm install
# opcional: crear frontend/.env con VITE_API_URL (ver sección de variables)
npm run dev
```

En ambos casos la aplicación queda disponible en `http://localhost:5173` y la API en `http://localhost:3000`.
## Variables de entorno

Los archivos `.env` no se versionan (están en `.gitignore`).

### Backend (`backend/.env`, copiado de `backend/.env.example`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto donde corre la API | `3000` |
| `DB_HOST` | Host de PostgreSQL | `localhost` |
| `DB_PORT` | Puerto de PostgreSQL | `5434` |
| `DB_NAME` | Nombre de la base | `focalware` |
| `DB_USER` | Usuario de PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | `postgres` |
| `DATABASE_URL` | URL que usa Prisma | `postgresql://postgres:postgres@localhost:5434/focalware` |
| `FRONTEND_URL` | Origen permitido por CORS | `http://localhost:5173` |
| `JWT_SECRETO` | Clave para firmar los tokens | valor propio (largo y privado) |
| `JWT_EXPIRACION` | Duración de la sesión | `15m` |

### Frontend (`frontend/.env`, opcional)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:3000/api` |

Si no se define `VITE_API_URL`, el frontend usa por defecto `http://localhost:3000/api`.

## Base de datos

La base es PostgreSQL 16 y el acceso se hace con **Prisma 7**. El esquema, las tablas, las relaciones, las reglas y los datos de prueba están documentados en [docs/base-de-datos.md](docs/base-de-datos.md).

Scripts reproducibles:

- `backend/prisma/schema.prisma` y `backend/prisma/migrations/` (fuente de verdad, aplicadas por Docker al arrancar la API).
- `backend/database/focalware.sql` (crea la base, las tablas y carga los datos; útil para montar a mano sin Docker).
- `backend/database/datos_prueba.sql` (3 vecinos, 2 funcionarios, 3 cuadrillas y 7 reportes).

Con Docker:

```bash
docker compose up -d db
cd backend
npm run db:deploy
docker exec -i focalware-db psql -U postgres -d focalware < database/datos_prueba.sql
```

Sin Docker:

```bash
psql -U postgres -h localhost -f backend/database/focalware.sql
```

El cliente de Prisma se genera con `npm run build` o `npm run db:generate`.

## Ejecución

```bash
cd frontend
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

**Acceso según rol de usuario:**
- **Vecino:** inicia sesión con un correo general (ej. `@gmail.com` o `@correo.cl`). También puede registrarse.
- **Funcionario:** inicia sesión con correo institucional `@focalware.cl` (las cuentas las entrega la municipalidad).

## Pruebas de la API (Postman)

La API debe estar corriendo en `http://localhost:3000` (ver Instalación).

1. Abrir Postman, importar la colección `backend/postman/FocalWare.postman_collection.json`.
2. Para la prueba que sube una foto, configurar en Postman el directorio de trabajo en `backend/postman` (ahí está `foto-prueba.png`).
3. Ejecutar la colección en orden: los logins guardan los tokens y los reportes creados se usan en las carpetas siguientes.
4. (Opcional) Por consola, con Newman: `npx newman run FocalWare.postman_collection.json --working-dir .` desde `backend/postman`.

Las pruebas cubren casos exitosos y de error (`401`, `403`, `400`, `404`, `409`). El detalle de cada endpoint, parámetros, respuestas y evidencia de la corrida está en [docs/EP2.7-endpoints-y-pruebas.md](docs/EP2.7-endpoints-y-pruebas.md).

**Resumen de endpoints** (prefijo `http://localhost:3000/api`):

| Método | Ruta | Acceso |
|---|---|---|
| `GET` | `/salud` | Público |
| `POST` | `/auth/registro` | Público |
| `POST` | `/auth/login` | Público |
| `GET` | `/auth/perfil` | Con sesión |
| `PUT` | `/auth/perfil` | Con sesión |
| `PUT` | `/auth/password` | Con sesión |
| `POST` | `/auth/recuperacion/solicitar` | Público |
| `POST` | `/auth/recuperacion/verificar` | Público |
| `POST` | `/auth/recuperacion/restablecer` | Público |
| `GET` | `/reportes` | Público |
| `GET` | `/reportes/:id` | Público |
| `GET` | `/reportes/mios` | Vecino |
| `POST` | `/reportes` | Vecino |
| `PUT` | `/reportes/:id` | Vecino dueño |
| `DELETE` | `/reportes/:id` | Vecino dueño |
| `POST` | `/reportes/:id/votos` | Vecino |
| `DELETE` | `/reportes/:id/votos` | Vecino |
| `GET` | `/revisiones/cola` | Funcionario |
| `POST` | `/reportes/:id/revision` | Funcionario |
| `PUT` | `/revisiones/:id` | Funcionario de la cuadrilla |
| `GET` | `/revisiones/:id/controles` | Funcionario de la cuadrilla |
| `GET` | `/notificaciones` | Vecino |
| `PUT` | `/notificaciones/:id/leida` | Vecino |
| `GET` | `/estadisticas` | Funcionario |
| `GET` | `/estadisticas/mi-actividad` | Vecino |
| `GET` | `/clima` | Público |

La recuperación de contraseña no envía correos reales: el código de 6 dígitos aparece en la consola del backend. Está pensado así para poder probar el flujo en el proyecto universitario.

## Usuarios de prueba

Todos los usuarios de prueba tienen la contraseña `Clave123`.

| Rol | Nombre | Correo | Cuadrilla |
|---|---|---|---|
| Vecino | Valentina Rojas | `valentina.rojas@correo.cl` | — |
| Vecino | Matías Fuentes | `matias.fuentes@correo.cl` | — |
| Vecino | Camila Soto | `camila.soto@correo.cl` | — |
| Funcionario | Javiera Muñoz | `javiera.munoz@focalware.cl` | Cerros y Quebradas |
| Funcionario | Andrés Pérez | `andres.perez@focalware.cl` | Norte |

Los datos vienen en `backend/database/datos_prueba.sql`. Si la base se creó con Docker, se cargan desde la raíz con:

```bash
docker exec -i focalware-db psql -U postgres -d focalware < backend/database/datos_prueba.sql
```

## Estado del proyecto

| Entrega | Contenido | Estado |
|---|---|---|
| **EP1** | Requerimientos, proto-personas, Figma, estructura Ionic con React | Completado |
| **EP2** | Backend, base de datos, API REST, autenticación JWT | En revisión |
| **EF** | Funcionalidades completas, seguridad, Docker | Pendiente |

## Documentación

| Documento | Descripción |
|---|---|
| [docs/EP1.1. Requerimientos del sistema.md](docs/EP1.1.%20Requerimientos%20del%20sistema.md) | Requerimientos funcionales y no funcionales |
| [docs/EP1.2-usuarios-y-protopersonas.md](docs/EP1.2-usuarios-y-protopersonas.md) | Usuarios objetivo y proto-personas |
| [docs/EP1.3-diseno-ui-ux.md](docs/EP1.3-diseno-ui-ux.md) | Diseño UI/UX |
| [docs/EP1.4-arquitectura-navegacion.md](docs/EP1.4-arquitectura-navegacion.md) | Arquitectura de navegación |
| [docs/EP1.6-Comparacion-Figma-y-implementacion.md](docs/EP1.6-Comparacion-Figma-y-implementacion.md) | Comparación Figma vs. implementación |
| [docs/EP2.1-estructura-backend.md](docs/EP2.1-estructura-backend.md) | Estructura del backend |
| [docs/EP2.7-endpoints-y-pruebas.md](docs/EP2.7-endpoints-y-pruebas.md) | Endpoints y pruebas de la API |
| [docs/base-de-datos.md](docs/base-de-datos.md) | Base de datos: tablas, relaciones y datos de prueba |

---

## Declaración de uso de Inteligencia Artificial

Durante el desarrollo de este proyecto se utilizaron herramientas de Inteligencia Artificial Generativa como apoyo complementario para la revisión de código, redacción de documentación y optimización de flujos de trabajo. Todo el análisis conceptual, diseño de arquitectura, lógica de negocio e implementación final fueron realizados y validados de forma autónoma por el equipo.

---

<div align="center">

Proyecto final de Ingeniería Web y Móvil
Escuela de Ingeniería Informática, Pontificia Universidad Católica de Valparaíso

</div>
