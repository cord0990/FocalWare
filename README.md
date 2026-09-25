<div align="center">

<img src="docs/img/header.svg" alt="FocalWare: priorización de limpieza por riesgo de incendio en las quebradas de Valparaíso" width="100%">

[![Prototipo en Figma](https://img.shields.io/badge/Prototipo-Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white)](https://www.figma.com/proto/NMUudu0YPxumGuZedsLVDS/FocalWare?node-id=0-1&t=nKgN063FMb7m3uT6-1)
[![Requerimientos](https://img.shields.io/badge/Requerimientos-1F2937?style=for-the-badge)](#requerimientos-funcionales)
[![Instalación](https://img.shields.io/badge/Instalación-1F2937?style=for-the-badge)](#instalación)

<br>

![Ionic](https://img.shields.io/badge/Ionic-3880FF?style=flat-square&logo=ionic&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)

</div>

---

## Prototipo

El diseño de las pantallas fue elaborado manualmente en Figma, considerando versión móvil y versión web.

[Ver prototipo en Figma](https://www.figma.com/proto/NMUudu0YPxumGuZedsLVDS/FocalWare?node-id=0-1&t=nKgN063FMb7m3uT6-1)

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

La especificación completa, con tipo y dependencias de cada requerimiento, está en [docs/EP1.1-Requerimientos-del-sistema.md](docs/EP1.1-Requerimientos-del-sistema.md).

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
| Frontend | Ionic 8, React 18, TypeScript |
| Navegación | React Router |
| Mapas | Leaflet con OpenStreetMap |
| Backend | Node.js con Express |
| Base de datos | PostgreSQL |
| Servicio externo | [Open-Meteo](https://open-meteo.com/) (temperatura, humedad y viento) |
| Herramientas | Git, GitHub, Figma |

## Estructura del repositorio

| Rama | Contenido |
|---|---|
| `main` | Documentación general del proyecto |
| `frontend` | Interfaz, componentes y documentación de requerimientos |
| `backend` | Servidor, API, base de datos y archivo `.sql` |

**Rama `frontend`**

```
src/
├── pages/          # Vistas de la aplicación
├── components/     # Componentes reutilizables
├── routes/         # Rutas y protección por rol
└── services/       # Consumo de la API
```

**Rama `backend`**

```
src/
├── routes/         # Definición de endpoints
├── controllers/    # Lógica de cada endpoint
├── models/         # Acceso a la base de datos
└── database/       # Script .sql de la base de datos
```

## Instalación

Requisitos previos: Node.js 18 o superior, npm 9 o superior.

```bash
git clone https://github.com/cord0990/FocalWare.git
cd FocalWare
git checkout frontend
npm install
cp .env.example .env
```

**Variables de entorno**

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:3000/api` |
| `DATABASE_URL` | Conexión a PostgreSQL | `postgresql://user:pass@localhost:5432/focalware` |
| `JWT_SECRET` | Clave de firma de tokens | valor propio |

El archivo `.env` no se versiona. Ya está incluido en `.gitignore`.

## Ejecución

```bash
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

## Estado del proyecto

| Entrega | Contenido | Estado |
|---|---|---|
| **EP1** | Requerimientos, proto-personas, Figma, estructura Ionic con React | En desarrollo |
| **EP2** | Backend, base de datos, API REST, autenticación JWT | Pendiente |
| **EF** | Funcionalidades completas, seguridad, Docker | Pendiente |

---

<div align="center">

Proyecto final de Ingeniería Web y Móvil
Escuela de Ingeniería Informática, Pontificia Universidad Católica de Valparaíso

</div>
