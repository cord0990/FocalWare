# EP 1.1 - Diseño y Estructura Inicial

**FocalWare** · Priorización de limpieza por riesgo de incendio en las quebradas de Valparaíso

[← Volver al README](../README.md)
[← Volver a EP 1.2](EP1.2-usuarios-y-protopersonas.md)

---

## 1.1 Requerimientos del Sistema

El presente apartado detalla la especificación formal de requisitos del sistema Focalware, estableciendo tanto las capacidades funcionales esperadas por los diferentes perfiles de usuario como las directrices de rendimiento, seguridad y accesibilidad que sustentan su despliegue.

> **1.1.1 Requerimientos Funcionales **

| ID | Nombre | Requerimiento | Tipo | Dependencias con otro Requerimiento | Usuario |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RF-01** | Registro de reporte georreferenciado | El sistema debe permitir al vecino crear un reporte con Ubicación GPS, Fotografias, Categoria de residuo y volumen estimado y descripción. | Transacciones/Niveles de autorizacion | Ninguna | Vecino |
| **RF-02** | Almacenamiento local offline | El sistema debe permitir guardar localmente los reportes creados sin conexión a internet. | Transaccional | RNF-03, RF-05 | Vecino |
| **RF-03** | Visualización en mapa interactivo | El sistema debe desplegar un mapa interactivo con localizaciones asociadas a los reportes existentes en el sistema. | Interfaces externas | RF-04 | Vecino / Funcionario |
| **RF-04** | Filtrado del mapa interactivo | El sistema debe permitir filtrar el mapa interactivo por estado, categoria, riesgo, sector y fecha. | Requisito de Búsqueda y reportes | RF-03 | Vecino / Funcionario |
| **RF-05** | Cálculo de índice ponderado | El sistema debe calcular un índice ponderado según categoría, volumen, reportes cercanos, antigüedad y condiciones meteorológicas externas. | Algoritmos | RF-06 | Sistema |
| **RF-06** | Aplicación del índice ponderado | El sistema utilizara un índice ponderado para priorizar la cola de atención municipal de los reportes recibidos. | Regla de negocio | RF-05, RF-07 | Sistema |
| **RF-07** | Gestión municipal de incidentes | El sistema debe permitir a los funcionarios Ver la cola priorizada, asignar cuadrilla, programar atención, cambiar estado y adjuntar evidencia de cierre. | Niveles de autorizacion | RF-06 | Funcionario |
| **RF-08** | Notificación y trazabilidad de reportes | El sistema debe Notificar al autor de cada reporte los cambios de estado realizados y exponer el historial completo de transiciones. | Auditoria | RF-07 | Vecino |
| **RF-09** | Panel y métricas de reportes | El sistema debe mostrar reportes por estado y categoría, tiempo promedio de resolución por sector y evolución mensual. | Requisitos de Búsqueda y reporte | RNF-12 | Funcionario |
| **RF-10** | Identificación de puntos críticos recurrentes | El sistema debe marcar las ubicaciones con un número configurable de reportes cerrados dentro de una ventana temporal. | Regla de negocio | RF-01, RF-07 | Funcionario |

---

> **1.1.2 Requerimientos No Funcionales **

| ID | Nombre | Requerimiento | Tipo | Dependencias | Usuario |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RNF-01** | Límite de pasos de reporte | El usuario debera crear un reporte en maximo 3 pasos. | Usabilidad | RF-01 | Vecino |
| **RNF-02** | Dimensiones mínimas y accesibilidad | El sistema debe tener controles de al menos 44x44 px y texto base de 16px respetando las normas de WCAG 2.1 Nivel AA. | Accesibilidad | Ninguna | Vecino / Funcionario |
| **RNF-03** | Descarga de reportes sin conexión | El sistema deberá descargar los reportes sin conexión a internet de los vecinos. | Disponibilidad/Integridad de los datos | RF-02, RF-05 | Sistema |
| **RNF-04** | Cifrado de credenciales | El sistema debe realizar bcrypt con minimo 10 rondas. | Seguridad | Ninguna | Sistema |
| **RNF-05** | Expiración y rotación de tokens | El sistema debe aplicar JWT con expiracion de 15 minutos, algoritmo asimétrico y mecanismo de rotación. | Seguridad | Ninguna | Sistema |
| **RNF-06** | Restricción CORS | La API del sistema debe restringir el intercambio de recursos de origen cruzado (CORS) mediante una lista blanca (allowlist) explícita de dominios autorizados, denegando el uso de comodines (*) en endpoints autenticados y restringiendo los métodos y cabeceras HTTP a los estrictamente necesarios. | Seguridad | Ninguna | Sistema |
| **RNF-07** | Disociación y anonimización | El sistema debe asegurar que la generación y publicación de reportes de acceso público garantize la disociación total de la identidad de los autores, impidiendo su reidentificación directa o indirecta, en conformidad con la Ley N° 19.628, el Decreto Supremo N° 779 (2000) del Ministerio de Justicia y la norma técnica establecida en el Decreto Supremo N° 1 (2015) del Ministerio Secretaría General de la Presidencia. | Privacidad | RF-01, RF-03 | Vecino |
| **RNF-08** | Validación de duplicados y orden de prioridad | El sistema deberá validar que los reportes subidos por los usuarios a la plataforma no se encuentren en existencia en la base de datos, si existe mandara un mensaje de "Ya existe un antecedente previo de este reporte" al usuario, incorporando un sistema de Upvotes para que se suban por orden de prioridad. | Integridad de los datos | RF-01, RF-02, RNF-3 | Vecino |
| **RNF-09** | Compatibilidad móvil | El sistema debe ser compatible con Android 9 o superior, iOS 14 o superior. | Portabilidad | Ninguna | Vecino |
| **RNF-10** | Compatibilidad web | El sistema debe ser compatible con Navegadores web Google Chrome, Mozilla Firefox, Microsoft Edge y Safari en sus versiones actuales y anteriores (N-2). | Portabilidad | Ninguna | Funcionario |
| **RNF-11** | Contenerización y despliegue | La arquitectura del sistema debe estar completamente contenerizada, requiriendo únicamente Docker y Docker Compose para su despliegue y desacoplando la configuración del código fuente mediante variables de entorno. | Arquitectonico | Ninguna | Sistema |
| **RNF-12** | Exportación de datos | El sistema debe permitir exportar reportes a formato CSV. | Interoperabilidad | RF-09 | Funcionario |