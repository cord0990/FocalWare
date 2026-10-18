# EP 1.1 - Diseño y Estructura Inicial

**FocalWare** · Priorización de limpieza por riesgo de incendio en las quebradas de Valparaíso

[← Volver al README](../README.md)
[← Volver a EP 1.2](EP1.2-usuarios-y-protopersonas.md)

---

## 1.1 Requerimientos del Sistema

El presente apartado detalla la especificación formal de requisitos del sistema FocalWare, estableciendo tanto las capacidades funcionales esperadas por los diferentes perfiles de usuario como las directrices de rendimiento, seguridad y accesibilidad que sustentan su despliegue.

**Convención de redacción.** Cada requerimiento se enuncia con la estructura *producto + verbo + necesidad* ("FocalWare registra un reporte georreferenciado") y expresa una sola función. Los datos, límites y condiciones que permiten verificar el requerimiento no van en el enunciado, sino en la columna **Criterio de verificación**, de modo que cada requerimiento se pueda estimar y probar por separado. La columna **Usuario** indica quién ejecuta o se beneficia de la función.

> **1.1.1 Requerimientos Funcionales**

| ID | Nombre | Requerimiento | Criterio de verificación | Tipo | Dependencias con otro Requerimiento | Usuario |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **RF-01** | Registro de reporte georreferenciado | FocalWare registra un reporte georreferenciado. | El reporte guarda la ubicación GPS, hasta 5 fotografías, la categoría de residuo, el volumen estimado, la distancia a hogares y la descripción. | Transacciones / Niveles de autorización | RF-10 | Vecino |
| **RF-02** | Almacenamiento local offline | FocalWare guarda localmente los reportes creados sin conexión a internet. | Un reporte creado sin conexión queda almacenado en el dispositivo. | Transacciones | RNF-03 | Vecino |
| **RF-03** | Visualización en mapa interactivo | FocalWare muestra un mapa interactivo con la ubicación de los reportes existentes. | Cada reporte existente aparece en el mapa en su ubicación. | Interfaces externas | Ninguna | Vecino / Funcionario |
| **RF-04** | Filtrado del mapa interactivo | FocalWare filtra los reportes del mapa interactivo. | El mapa se puede filtrar por estado, categoría, riesgo, sector y fecha. | Requisito de búsqueda y reportes | RF-03 | Vecino / Funcionario |
| **RF-05** | Cálculo de índice ponderado | FocalWare calcula el índice de riesgo ponderado de cada reporte. | El índice considera categoría, volumen, reportes cercanos, antigüedad y condiciones meteorológicas externas. | Algoritmos | Ninguna | Sistema |
| **RF-06** | Aplicación del índice ponderado | FocalWare ordena la cola de atención municipal según el índice de riesgo ponderado. | Los reportes con mayor índice aparecen primero en la cola de atención. | Regla de negocio | RF-05 | Sistema |
| **RF-07** | Cola de atención priorizada | FocalWare muestra la cola de atención priorizada al funcionario. | La cola presenta los reportes pendientes ordenados por riesgo y solo es accesible para el rol Funcionario. | Niveles de autorización | RF-06 | Funcionario |
| **RF-08** | Notificación de cambios de estado | FocalWare notifica al vecino los cambios de estado de sus reportes. | Cada cambio de estado de un reporte genera una notificación para su autor. | Auditoría | RF-20 | Vecino |
| **RF-09** | Estadísticas mensuales | FocalWare muestra al funcionario un resumen mensual de estadísticas. | El resumen incluye el total de reportes, los reportes resueltos, el tiempo promedio de resolución y la evolución mensual. | Niveles de autorización | Ninguna | Funcionario |
| **RF-10** | Identificador único de reportes | FocalWare asigna un identificador único a cada reporte creado. | Dos reportes nunca comparten identificador y la asignación no requiere intervención del usuario. | Regla de negocio | RF-01 | Sistema |
| **RF-11** | Ocultamiento automático de reportes controlados | FocalWare oculta del mapa los reportes controlados después de un mes. | Un reporte en estado "Controlado" deja de mostrarse en el mapa tras un mes y se mantiene visible para los usuarios con rol Funcionario. | Niveles de autorización | RF-03, RF-23 | Vecino / Funcionario |
| **RF-12** | Aceptación de reportes | FocalWare registra la aceptación de un reporte pendiente. | El funcionario puede aceptar un reporte pendiente, que queda disponible para asignarle cuadrilla y fecha de atención. | Niveles de autorización | RF-01, RNF-09 | Funcionario |
| **RF-13** | Modificación offline | FocalWare modifica los reportes guardados localmente que aún no han sido enviados. | Un reporte almacenado en el dispositivo y no enviado se puede editar sin conexión. | Transacciones | RF-01, RF-02 | Vecino / Funcionario |
| **RF-14** | Votos a favor de reportes | FocalWare registra el voto a favor de un usuario en un reporte. | Cada voto a favor aumenta la relevancia del reporte y un usuario vota una sola vez por reporte. | Reglas de negocio / Transacciones | RF-01, RF-03 | Vecino / Funcionario |
| **RF-15** | Vista de detalles | FocalWare muestra el detalle de un reporte. | El detalle presenta ubicación, sector, ID, fotografías (hasta 5), categoría de residuo, volumen estimado, votos a favor, descripción, riesgo ponderado y condiciones meteorológicas del día de creación. | Reglas de negocio | RF-01, RF-14 | Vecino / Funcionario |
| **RF-16** | Limitación de reporte controlado | FocalWare restringe la creación de reportes de control a los funcionarios de la cuadrilla asignada. | Un funcionario que no pertenece a la cuadrilla asignada no puede crear el reporte de control. | Niveles de autorización | RF-01, RF-23 | Funcionario |
| **RF-17** | Asignación de cuadrilla | FocalWare asigna una cuadrilla a un reporte aprobado. | La asignación puede incluir una descripción opcional. | Niveles de autorización / Transacciones | RF-01, RF-12 | Funcionario |
| **RF-18** | Motivos de rechazo | FocalWare exige el motivo de rechazo de un reporte. | El rechazo no se confirma sin una descripción obligatoria del motivo. | Niveles de autorización / Transacciones | RF-01, RF-21 | Funcionario |
| **RF-19** | Historial de transiciones | FocalWare muestra el historial de transiciones de estado de un reporte. | El historial lista todos los cambios de estado del reporte. | Auditoría | RF-20 | Vecino |
| **RF-20** | Cambio de estado | FocalWare cambia el estado de un reporte. | El funcionario actualiza el estado del reporte y el cambio queda registrado en su historial. | Niveles de autorización / Transacciones | RF-01, RF-12 | Funcionario |
| **RF-21** | Rechazo de reportes | FocalWare registra el rechazo de un reporte pendiente. | El funcionario puede rechazar un reporte pendiente. | Niveles de autorización | RF-01 | Funcionario |
| **RF-22** | Modificación de reportes por el funcionario | FocalWare modifica los datos de un reporte existente. | El funcionario puede editar los datos de un reporte ya enviado. | Niveles de autorización | RF-01 | Funcionario |
| **RF-23** | Generación de reporte de control | FocalWare genera un reporte de control para un reporte atendido. | El reporte de control incluye fotografías de evidencia del cierre. | Niveles de autorización | RF-01, RF-12 | Funcionario |
| **RF-24** | Programación de atención | FocalWare programa la fecha de atención de un reporte aprobado. | El funcionario define la fecha de acción del reporte aprobado. | Niveles de autorización / Transacciones | RF-01, RF-12 | Funcionario |

---

> **1.1.2 Requerimientos No Funcionales**

| ID | Nombre | Requerimiento | Criterio de verificación | Tipo | Dependencias | Usuario |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **RNF-01** | Límite de pasos de reporte | FocalWare permite crear un reporte en un máximo de 2 pasos. | El flujo de creación de un reporte se completa en 2 pasos o menos. | Usabilidad | RF-01 | Vecino |
| **RNF-02** | Dimensiones mínimas y accesibilidad | FocalWare cumple las pautas WCAG 2.1 Nivel AA en sus controles y textos. | Los controles miden al menos 44x44 px y el texto base es de 16 px. | Accesibilidad | Ninguna | Vecino / Funcionario |
| **RNF-03** | Descarga de reportes sin conexión | FocalWare opera sin conexión a internet para los reportes de los vecinos. | Sin conexión, el vecino puede crear y guardar reportes en su dispositivo. | Disponibilidad / Integridad de los datos | RF-02, RF-05 | Sistema |
| **RNF-04** | Cifrado de credenciales | FocalWare almacena las contraseñas con hash bcrypt. | El hash se genera con un mínimo de 10 rondas y ninguna contraseña se guarda en texto plano. | Seguridad | Ninguna | Sistema |
| **RNF-05** | Expiración y rotación de tokens | FocalWare protege las sesiones con tokens JWT de corta duración. | El token expira a los 15 minutos, se firma con un algoritmo asimétrico y cuenta con un mecanismo de rotación. | Seguridad | Ninguna | Sistema |
| **RNF-06** | Restricción CORS | FocalWare restringe el acceso de origen cruzado (CORS) a una lista blanca de dominios autorizados. | La lista blanca es explícita, sin comodines (*) en endpoints autenticados, y limita los métodos y cabeceras HTTP a los estrictamente necesarios. | Seguridad | Ninguna | Sistema |
| **RNF-07** | Disociación y anonimización | FocalWare disocia la identidad de los autores en los reportes de acceso público. | Los reportes públicos no permiten reidentificar al autor de forma directa ni indirecta, en conformidad con la Ley N° 19.628, el Decreto Supremo N° 779 (2000) del Ministerio de Justicia y la norma técnica del Decreto Supremo N° 1 (2015) del Ministerio Secretaría General de la Presidencia. | Privacidad | RF-01, RF-03 | Vecino |
| **RNF-08** | Validación de duplicados | FocalWare valida que un reporte nuevo no exista previamente en la base de datos. | Si el reporte ya existe, el sistema muestra al usuario el mensaje "Ya existe un antecedente previo de este reporte". | Integridad de los datos | RF-01, RF-02, RF-14, RNF-03 | Vecino |
| **RNF-09** | Compatibilidad móvil | FocalWare es compatible con Android 9 o superior e iOS 14 o superior. | La aplicación se instala y ejecuta en dispositivos con esas versiones mínimas. | Portabilidad | Ninguna | Vecino |
| **RNF-10** | Compatibilidad web | FocalWare es compatible con los navegadores Google Chrome, Mozilla Firefox, Microsoft Edge y Safari. | La aplicación funciona en sus versiones actuales y anteriores (N-2). | Portabilidad | Ninguna | Funcionario |
| **RNF-11** | Contenerización y despliegue | FocalWare se despliega mediante Docker y Docker Compose. | El despliegue completo requiere únicamente Docker y Docker Compose, y la configuración se define con variables de entorno, no en el código fuente. | Arquitectónico | Ninguna | Sistema |
| **RNF-12** | Exportación de datos | FocalWare exporta reportes a formato CSV. | El funcionario descarga los reportes en un archivo CSV. | Interoperabilidad | RF-09 | Funcionario |
