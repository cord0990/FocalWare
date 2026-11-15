# Estado de Requerimientos 

### Requerimientos Funcionales (RF)

| ID | Estado | Evidencia / Comentario |
| :--- | :--- | :--- |
| **RF-01** | Cumple | `CrearReporte.tsx` + backend `reportesController.crear`: guarda GPS, hasta 5 fotos, categoría, volumen, distancia, descripción. |
| **RF-02** | Cumple | `pendientesService` guarda reportes sin conexión y se envían después. |
| **RF-03** | Cumple | `Mapa.tsx` + `MapaReportes.tsx` muestran reportes en el mapa. |
| **RF-04** | Cumple | `filtrosReportes.ts` filtra por estado, categoría, riesgo, sector y fecha. |
| **RF-05** | Cumple | `opcionesReporte.ts` (`calcularIndice`) considera categoría, volumen, reportes cercanos, antigüedad y clima. |
| **RF-06** | Cumple | Backend ordena la cola por riesgo (listar/cola). |
| **RF-07** | Cumple | `revisionesRoutes` + cola de atención para funcionarios. |
| **RF-08** | Cumple | `notificacionesService` genera notificaciones por cambios de estado. |
| **RF-09** | Cumple | `Estadisticas.tsx` muestra resumen mensual. |
| **RF-10** | Cumple | Backend asigna `idReporte` único. |
| **RF-11** | Cumple | Backend oculta reportes “Controlado” tras 1 mes para no funcionarios. |
| **RF-12** | Cumple | Funcionario puede aceptar reporte pendiente. |
| **RF-13** | Cumple | Borradores locales editables sin conexión. |
| **RF-14** | Cumple | `apoyarReporte` / `quitarApoyo` + `miVoto` (un voto por usuario). |
| **RF-15** | Cumple | `DetalleReporte.tsx` muestra ubicación, sector, ID, fotos, categoría, volumen, votos, descripción, riesgo y clima. |
| **RF-16** | Cumple | Restricción por cuadrilla asignada (backend). |
| **RF-17** | Cumple | Asignación de cuadrilla y fecha de atención. |
| **RF-18** | Cumple | Rechazo exige descripción obligatoria. |
| **RF-19** | Cumple | `SeguimientoReporte` muestra historial de transiciones. |
| **RF-20** | Cumple | Cambio de estado registrado en historial. |
| **RF-21** | Cumple | Funcionario puede rechazar reporte pendiente. |
| **RF-22** | Parcial | Funcionario edita desglose (categoría/volumen/distancia) vía `corregirDesglose`; no edita todos los campos como el vecino dueño. (REVISAR) |
| **RF-23** | Cumple | Reporte de control con fotos de evidencia. |
| **RF-24** | Cumple | Programación de fecha de atención. |

### Requerimientos No Funcionales (RNF)

| ID | Estado | Evidencia / Comentario |
| :--- | :--- | :--- |
| **RNF-01** | Cumple | Creación de reporte en una sola pantalla (≤ 2 pasos). |
| **RNF-02** | No verificado | No se midieron controles 44x44 px ni texto 16 px en esta revisión. (VERIFICAR)|
| **RNF-03** | Cumple | Reportes se guardan localmente sin conexión. |
| **RNF-04** | Cumple | `bcryptjs` con 10 rondas. |
| **RNF-05** | Parcial | JWT expira a 15 min, pero se firma con secreto simétrico (HS256), no asimétrico. (CORREGIR) |
| **RNF-06** | Cumple | CORS con origen único desde `FRONTEND_URL`. |
| **RNF-07** | Cumple | Reportes públicos no incluyen nombre/email del autor. |
| **RNF-08** | Cumple | Validación de duplicados por cercanía (mensaje “Ya existe un antecedente…”). |
| **RNF-09** | No verificado | No se probó en dispositivos Android/iOS.  (VERIFICAR CON ESCENARIO)|
| **RNF-10** | No verificado | No se probó en Chrome/Firefox/Edge/Safari (N-2). (VERIFICAR CON ESCENARIO)|
| **RNF-11** | Cumple | Despliegue con Docker y Docker Compose + variables de entorno. |
| **RNF-12** | Cumple | Exportación a CSV en `Estadisticas.tsx`. |

# Escenarios de Verificación (Paso a Paso)
Se detallaran para cada requerimiento un escenario especifico para verificar que este se cumple en la pagina.

### Requerimientos Funcionales

| ID | Escenario de verificación |
| :--- | :--- |
| **RF-01** | Crear un reporte con ubicación en el mapa, 3 fotos, categoría “Basura”, volumen “Mediano”, distancia “Entre 10 y 50 m” y descripción; verificar que se guarde con todos los datos. |
| **RF-02** | Desactivar internet, crear un reporte y verificar que quede guardado en el dispositivo (pendiente). |
| **RF-03** | Abrir el mapa y comprobar que cada reporte existente aparece en su ubicación. |
| **RF-04** | En el mapa, filtrar por estado “Pendiente”, categoría “Neumáticos”, riesgo alto, sector “Cerro Alegre” y fecha; verificar que solo se muestren los que cumplen. |
| **RF-05** | Crear reportes con distintas categorías/volúmenes y verificar que el índice de riesgo cambie según los factores. |
| **RF-06** | Verificar que en la cola municipal los reportes con mayor riesgo aparezcan primero. |
| **RF-07** | Iniciar sesión como funcionario y comprobar que la cola solo es visible para ese rol. |
| **RF-08** | Cambiar el estado de un reporte y verificar que el vecino reciba una notificación. |
| **RF-09** | Como funcionario, abrir Estadísticas y comprobar total, resueltos, tiempo promedio y evolución mensual. |
| **RF-10** | Crear dos reportes y verificar que tengan IDs distintos y asignados automáticamente. |
| **RF-11** | Marcar un reporte como “Controlado”, simular +1 mes y verificar que desaparece del mapa para vecinos pero sigue visible para funcionarios. |
| **RF-12** | Como funcionario, aceptar un reporte pendiente y verificar que queda disponible para asignar cuadrilla. |
| **RF-13** | Guardar un reporte sin conexión, editarlo y verificar que los cambios se mantienen localmente. |
| **RF-14** | Votar a favor de un reporte y verificar que el contador aumente; intentar votar de nuevo y comprobar que no se duplica. |
| **RF-15** | Abrir el detalle de un reporte y verificar ubicación, sector, ID, fotos, categoría, volumen, votos, descripción, riesgo y clima. |
| **RF-16** | Como funcionario de otra cuadrilla, intentar crear un reporte de control y verificar que se rechace. |
| **RF-17** | Asignar cuadrilla y fecha a un reporte aprobado y verificar que se guarden. |
| **RF-18** | Intentar rechazar un reporte sin motivo y verificar que el sistema exija la descripción. |
| **RF-19** | Ver el historial de un reporte y verificar que liste todos los cambios de estado. |
| **RF-20** | Cambiar el estado de un reporte y verificar que quede registrado en el historial. |
| **RF-21** | Como funcionario, rechazar un reporte pendiente y verificar que quede en estado “Rechazado”. |
| **RF-22** | Como funcionario, editar el desglose (categoría/volumen/distancia) de un reporte y verificar que se guarde. |
| **RF-23** | Como funcionario de la cuadrilla, generar un reporte de control con fotos de evidencia y verificar que se registre. |
| **RF-24** | Programar fecha de atención de un reporte aprobado y verificar que se guarde. |

### Requerimientos No Funcionales

| ID | Escenario de verificación |
| :--- | :--- |
| **RNF-01** | Crear un reporte y contar los pasos: debe completarse en 2 o menos. |
| **RNF-02** | Inspeccionar controles (botones, inputs) y verificar mínimo 44x44 px y texto base 16 px (DevTools). |
| **RNF-03** | Desactivar internet, crear un reporte y verificar que se guarde en el dispositivo. |
| **RNF-04** | Revisar la base de datos: la contraseña debe estar hasheada con `bcrypt` (10 rondas) y no en texto plano. |
| **RNF-05** | Iniciar sesión, esperar 15 min y verificar que el token expire; revisar el algoritmo de firma (HS256 actualmente). |
| **RNF-06** | Hacer una petición desde un origen no autorizado y verificar que CORS la bloquee; revisar que no haya `*`. |
| **RNF-07** | Consultar un reporte público y verificar que no incluya nombre ni email del autor. |
| **RNF-08** | Intentar crear un reporte duplicado (misma ubicación/categoría) y verificar el mensaje “Ya existe un antecedente previo…”. |
| **RNF-09** | Instalar la app en Android 9+ / iOS 14+ y verificar que ejecuta. |
| **RNF-10** | Abrir la app en Chrome, Firefox, Edge y Safari (versiones actuales y N-2) y verificar funcionamiento. |
| **RNF-11** | Levantar con `docker compose up -d --build` y verificar que todo funciona solo con Docker + variables de entorno. |
| **RNF-12** | Como funcionario, exportar reportes a CSV y verificar que el archivo se descargue correctamente. |

# Prueba de los Escenarios

Aca se deben realizar los escenarios, adjuntar las imagenes de las pruebas para cada requerimiento y una descripcion de lo que se realizo.

