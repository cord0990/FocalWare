<div align="center">

<img src="docs/img/header.svg" alt="FocalWare — Priorización de limpieza por riesgo de incendio en las quebradas de Valparaíso" width="100%">

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

## Capturas Prototipo

El diseño de las pantallas fue elaborado manualmente en Figma, considerando versión móvil y versión web.

[Ver prototipo en Figma](https://www.figma.com/proto/NMUudu0YPxumGuZedsLVDS/FocalWare?node-id=0-1&t=nKgN063FMb7m3uT6-1)

## Descripción general

FocalWare permite a los habitantes de los cerros de Valparaíso reportar de forma georreferenciada la acumulación de residuos y material combustible en quebradas y sitios eriazos.

A diferencia de un sistema de reclamos tradicional, no entrega al municipio una lista ordenada por fecha de ingreso, sino una **cola de atención priorizada por riesgo**, calculada a partir del tipo de residuo, la proximidad a viviendas, la concentración de reportes en el sector, la antigüedad sin resolución y las condiciones meteorológicas vigentes obtenidas en tiempo real.

Además detecta **puntos críticos recurrentes**, distinguiendo los lugares que necesitan limpieza de los que necesitan infraestructura.

## Problema que aborda

Las quebradas de Valparaíso son corredores por los que el fuego asciende con rapidez y, a la vez, los lugares donde se acumula el vertido informal de residuos. La basura acumulada es material combustible almacenado a metros de viviendas: el incendio de marzo de 2015, que obligó a evacuar a unas 7.000 personas, se originó en un vertedero clandestino.

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
| Diego Cordova  | Desarrollo web y Diseño UI/UX en Figma  |
| Macarena Catalan | Diseño UI/UX en Figma y Documentacion   |
| Agustín Guzmán | Desarrollo web y Diseño UI/UX en Figma  |
| Daniel Castro | Diseño UI/UX en Figma y Documentacion   |

## Roles del sistema

| Rol | Permisos |
|---|---|
| **Vecino/a** | Crear y apoyar reportes, consultar el mapa, ver el historial de sus reportes, recibir notificaciones |
| **Funcionario municipal** | Acceder a la cola priorizada, asignar cuadrillas, cambiar estados, cerrar con evidencia, ver indicadores y exportar datos |

La caracterización de los usuarios objetivo y las proto-personas están documentadas en [docs/EP1.2-usuarios-y-protopersonas.md](docs/EP1.2-usuarios-y-protopersonas.md).

## Requerimientos funcionales

Inicio de sesión y registro no se contabilizan como requerimientos funcionales, ya que son funcionalidades transversales de soporte.

| ID | Nombre | Descripción | Rol |
|---|---|---|---|
| **RF-01** | Registro de reporte georreferenciado | Crear un reporte con ubicación GPS, fotografías, categoría del residuo, volumen estimado y descripción. | Vecino/a |
| **RF-02** | Sincronización sin conexión | Guardar localmente los reportes creados sin red y enviarlos automáticamente al reconectarse, sin duplicados. | Sistema |
| **RF-03** | Mapa interactivo de reportes | Desplegar los reportes con agrupación de marcadores y filtros por estado, categoría, riesgo, sector y fecha. | Ambos |
| **RF-04** | Cálculo del índice de riesgo | Calcular un índice ponderado según categoría, volumen, reportes cercanos, antigüedad y condiciones meteorológicas externas. | Sistema |
| **RF-05** | Apoyo y control de duplicados | Detectar reportes activos cercanos antes de crear uno nuevo y permitir apoyar el existente, incidiendo en la prioridad. | Vecino/a |
| **RF-06** | Gestión municipal y triage | Ver la cola priorizada, asignar cuadrilla, programar atención, cambiar estado y adjuntar evidencia de cierre. | Funcionario |
| **RF-07** | Notificación y trazabilidad | Notificar al autor cada cambio de estado y exponer el historial completo de transiciones. | Vecino/a |
| **RF-08** | Panel de indicadores | Mostrar reportes por estado y categoría, tiempo promedio de resolución por sector y evolución mensual, con exportación CSV. | Funcionario |
| **RF-09** | Puntos críticos recurrentes | Marcar las ubicaciones con un número configurable de reportes cerrados dentro de una ventana temporal. | Funcionario |

## Requerimientos no funcionales

| ID | Categoría | Criterio verificable |
|---|---|---|
| **RNF-01** | Usabilidad | Reporte creado en máximo 3 pasos y menos de 60 segundos; controles de al menos 44x44 px y texto base de 16 px. |
| **RNF-02** | Rendimiento | Respuestas bajo 500 ms en percentil 95; mapa con 1.000 marcadores en menos de 2 segundos; listados paginados de 20. |
| **RNF-03** | Seguridad | bcrypt con mínimo 10 rondas, JWT con expiración de 60 minutos, consultas parametrizadas, CORS restringido. |
| **RNF-04** | Privacidad | Reportes públicos sin exponer identidad del autor; solo el rol funcionario accede a datos personales. |
| **RNF-05** | Compatibilidad | Android 9 o superior, iOS 14 o superior y navegadores actuales; pestañas inferiores en móvil y menú lateral en escritorio. |
| **RNF-06** | Tolerancia a fallos de red | Cola local de reportes sin pérdida de datos; imágenes comprimidas a máximo 300 KB antes del envío. |
| **RNF-07** | Portabilidad | El sistema completo se levanta con `docker compose up` y configuración en variables de entorno. |

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
