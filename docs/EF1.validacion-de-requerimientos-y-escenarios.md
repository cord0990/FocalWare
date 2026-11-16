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
| **RF-19** | Cumple | Backend registra cada transición en la tabla log de la base de datos. |
| **RF-20** | Cumple | `revisionService.procesarRevision` actualiza el estado del reporte y lo persiste en la base de datos. |
| **RF-21** | Cumple | Funcionario puede rechazar reporte pendiente. |
| **RF-22** | Cumple | Funcionario corrige desglose (categoría/volumen/distancia/riesgo) solo en reportes Aprobados o En atención; notifica al vecino dueño. |
| **RF-23** | Cumple | Reporte de control con fotos de evidencia. |
| **RF-24** | Cumple | Programación de fecha de atención. |

### Requerimientos No Funcionales (RNF)

| ID | Estado | Evidencia / Comentario |
| :--- | :--- | :--- |
| **RNF-01** | Cumple | Creación de reporte en una sola pantalla (≤ 2 pasos). |
| **RNF-02** | No verificado | No se midieron controles 44x44 px ni texto 16 px en esta revisión. (VERIFICAR)|
| **RNF-03** | Cumple | Reportes se guardan localmente sin conexión. |
| **RNF-04** | Cumple | `bcryptjs` con 10 rondas. |
| **RNF-05** | Cumple | JWT de 15 min con HS256, secreto ≥32 chars, validación de cuenta y payload; secreto persistente en Docker. |
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
| **RF-01** | Crear un reporte con ubicación en el mapa, 3 fotos, categoría “Neumaticos”, volumen “Mediano”, distancia “Entre 10 y 50 m” y descripción; verificar que se guarde con todos los datos. |
| **RF-02** | Desactivar internet, crear un reporte y verificar que quede guardado en el dispositivo (pendiente). |
| **RF-03** | Abrir el mapa y comprobar que cada reporte existente aparece en su ubicación. |
| **RF-04** | En el mapa, filtrar por estado “Pendiente”, categoría “Neumáticos”, riesgo alto, sector “Cerro Cordillera” y fecha; verificar que solo se muestren los que cumplen. |
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
| **RF-19** | Verificar en la tabla log de la base de datos que cada cambio de estado/revisión/control/modificación haya generado su registro. |
| **RF-20** | Como funcionario, cambiar el estado de un reporte (Aprobado/Rechazado/En atención) y verificar que el nuevo estado se guarde y se refleje. |
| **RF-21** | Como funcionario, rechazar un reporte pendiente y verificar que quede en estado “Rechazado”. |
| **RF-22** | Como funcionario, corregir el desglose de un reporte aprobado/en atención y verificar que se guarde y que el vecino reciba notificación. |
| **RF-23** | Como funcionario de la cuadrilla, generar un reporte de control con fotos de evidencia y verificar que se registre. |
| **RF-24** | Programar fecha de atención de un reporte aprobado y verificar que se guarde. |

### Requerimientos No Funcionales

| ID | Escenario de verificación |
| :--- | :--- |
| **RNF-01** | Crear un reporte y contar los pasos: debe completarse en 2 o menos. |
| **RNF-02** | Inspeccionar controles (botones, inputs) y verificar mínimo 44x44 px y texto base 16 px (DevTools). |
| **RNF-03** | Desactivar internet, crear un reporte y verificar que se guarde en el dispositivo. |
| **RNF-04** | Revisar la base de datos: la contraseña debe estar hasheada con `bcrypt` (10 rondas) y no en texto plano. |
| **RNF-05** | Iniciar sesión, esperar 15 min y verificar que el token expire; confirmar firma HS256 y secreto ≥32 chars. |
| **RNF-06** | Hacer una petición desde un origen no autorizado y verificar que CORS la bloquee; revisar que no haya `*`. |
| **RNF-07** | Consultar un reporte público y verificar que no incluya nombre ni email del autor. |
| **RNF-08** | Intentar crear un reporte duplicado (misma ubicación/categoría) y verificar el mensaje “Ya existe un antecedente previo…”. |
| **RNF-09** | Instalar la app en Android 9+ / iOS 14+ y verificar que ejecuta. |
| **RNF-10** | Abrir la app en Chrome, Firefox, Edge y Safari (versiones actuales y N-2) y verificar funcionamiento. |
| **RNF-11** | Levantar con `docker compose up -d --build` y verificar que todo funciona solo con Docker + variables de entorno. |
| **RNF-12** | Como funcionario, exportar reportes a CSV y verificar que el archivo se descargue correctamente. |

# Prueba de los Escenarios

Aca se deben realizar los escenarios, adjuntar las imagenes de las pruebas para cada requerimiento y una descripcion de lo que se realizo.

### RF-01
- **Resultado**: Cumple
- **Evidencia**: ![RF-01](./img/rf-01.png)
- **Descripción**: Se creó un reporte con ubicación, 3 fotos, categoría, volumen, distancia y descripción; se guardó correctamente.

### RF-02
- **Resultado**: Cumple
- **Evidencia**: ![RF-02](./img/rf-02.png)
- **Descripción**: Se desactivó internet, se creó un reporte y quedó guardado como pendiente.

### RF-03
- **Resultado**: Cumple
- **Evidencia**: ![RF-03](./img/rf-03.png)
- **Descripción**: Se abrió el mapa y se verificó que los reportes existentes aparecen en su ubicación.

### RF-04
- **Resultado**: Cumple
- **Evidencia**: ![RF-04](./img/rf-04.png)
- **Descripción**: Se filtró por estado, categoría, riesgo, sector y fecha; solo se mostraron los que cumplen.

### RF-05
- **Resultado**: Cumple
- **Evidencia**: ![RF-05](./img/rf-05.png)
- **Descripción**: Se crearon reportes con distintas categorías/volúmenes y el índice de riesgo cambió según los factores.

### RF-06
- **Resultado**: Cumple
- **Evidencia**: ![RF-06](./img/rf-06.png)
- **Descripción**: En la cola municipal los reportes con mayor riesgo aparecieron primero.

### RF-07
- **Resultado**: Cumple
- **Evidencia**: ![RF-07](./img/rf-07.png)
- **Descripción**: Se inició sesión como funcionario y la cola solo fue visible para ese rol.

### RF-08
- **Resultado**: Cumple
- **Evidencia**: ![RF-08](./img/rf-08.png)
- **Descripción**: Se cambió el estado de un reporte y el vecino recibió la notificación.

### RF-09
- **Resultado**: Cumple
- **Evidencia**: ![RF-09](./img/rf-09.png)
- **Descripción**: Como funcionario, se abrió Estadísticas y se comprobó total, resueltos, tiempo promedio y evolución mensual.

### RF-10
- **Resultado**: Cumple
- **Evidencia**: ![RF-10](./img/rf-10.png)
- **Descripción**: Se crearon dos reportes y tuvieron IDs distintos asignados automáticamente.

### RF-11
- **Resultado**: Cumple
- **Evidencia**: ![RF-11](./img/rf-11.png)
- **Descripción**: Se marcó un reporte como Controlado, se simuló +1 mes y desapareció del mapa para vecinos pero siguió visible para funcionarios.

### RF-12
- **Resultado**: Cumple
- **Evidencia**: ![RF-12](./img/rf-12.png)
- **Descripción**: Como funcionario, se aceptó un reporte pendiente y quedó disponible para asignar cuadrilla.

### RF-13
- **Resultado**: Cumple
- **Evidencia**: ![RF-13](./img/rf-13.png)
- **Descripción**: Se guardó un reporte sin conexión, se editó y los cambios se mantuvieron localmente.

### RF-14
- **Resultado**: Cumple
- **Evidencia**: ![RF-14](./img/rf-14.png)
- **Descripción**: Se votó a favor de un reporte y el contador aumentó; al intentar votar de nuevo no se duplicó.

### RF-15
- **Resultado**: Cumple
- **Evidencia**: ![RF-15](./img/rf-15.png)
- **Descripción**: Se abrió el detalle de un reporte y se verificó ubicación, sector, ID, fotos, categoría, volumen, votos, descripción, riesgo y clima.

### RF-16
- **Resultado**: Cumple
- **Evidencia**: ![RF-16](./img/rf-16.png)
- **Descripción**: Como funcionario de otra cuadrilla, se intentó crear un reporte de control y se rechazó.

### RF-17
- **Resultado**: Cumple
- **Evidencia**: ![RF-17](./img/rf-17.png)
- **Descripción**: Se asignó cuadrilla y fecha a un reporte aprobado y se verificó que se guardaran.

### RF-18
- **Resultado**: Cumple
- **Evidencia**: ![RF-18](./img/rf-18.png)
- **Descripción**: Se intentó rechazar un reporte sin motivo y el sistema exigió la descripción.

### RF-19
- **Resultado**: Cumple
- **Evidencia**: ![RF-19](./img/rf-19.png)
- **Descripción**: Se verificó en la tabla log de la base de datos que cada cambio generó su registro.

### RF-20
- **Resultado**: Cumple
- **Evidencia**: ![RF-20](./img/rf-20.png)
- **Descripción**: Como funcionario, se cambió el estado de un reporte y se verificó que se guardara y reflejara.

### RF-21
- **Resultado**: Cumple
- **Evidencia**: ![RF-21](./img/rf-21.png)
- **Descripción**: Como funcionario, se rechazó un reporte pendiente y quedó en estado Rechazado.

### RF-22
- **Resultado**: Cumple
- **Evidencia**: ![RF-22](./img/rf-22.png)
- **Descripción**: Como funcionario, se corrigió el desglose de un reporte aprobado/en atención y se verificó guardado y notificación al vecino.

### RF-23
- **Resultado**: Cumple
- **Evidencia**: ![RF-23](./img/rf-23.png)
- **Descripción**: Como funcionario de la cuadrilla, se generó un reporte de control con fotos de evidencia y se registró.

### RF-24
- **Resultado**: Cumple
- **Evidencia**: ![RF-24](./img/rf-24.png)
- **Descripción**: Se programó fecha de atención de un reporte aprobado y se verificó que se guardara.

### RNF-01
- **Resultado**: Cumple
- **Evidencia**: Sin imagen (verificación directa en la app)
- **Descripción**: El reporte se crea en una sola pantalla con ≤2 pasos.

### RNF-02
- **Resultado**: No verificado
- **Evidencia**: Sin imagen (no se consideró necesaria)
- **Descripción**: No se midieron controles 44x44 px ni texto 16 px en esta revisión.

### RNF-03
- **Resultado**: Cumple
- **Evidencia**: ![RNF-03](./img/rnf-03.png)
- **Descripción**: Se desactivó internet, se creó un reporte y se verificó que se guardara en el dispositivo.

### RNF-04
- **Resultado**: Cumple
- **Evidencia**: Sin imagen (no se consideró necesaria)
- **Descripción**: La contraseña está hasheada con bcrypt (10 rondas) y no en texto plano.

### RNF-05
- **Resultado**: Cumple
- **Evidencia**: ![RNF-05](./img/rnf-05.png)
- **Descripción**: Se inició sesión, se esperó 15 min y se verificó que el token expire; firma HS256 y secreto ≥32 chars.

### RNF-06
- **Resultado**: Cumple
- **Evidencia**: ![RNF-06](./img/rnf-06.png)
- **Descripción**: Se hizo una petición desde un origen no autorizado y CORS la bloqueó; no había `*`.

### RNF-07
- **Resultado**: Cumple
- **Evidencia**: ![RNF-07](./img/rnf-07.png)
- **Descripción**: Se consultó un reporte público y no incluyó nombre ni email del autor.

### RNF-08
- **Resultado**: Cumple
- **Evidencia**: ![RNF-08](./img/rnf-08.png)
- **Descripción**: Se intentó crear un reporte duplicado y se verificó el mensaje “Ya existe un antecedente previo…”.

### RNF-09
- **Resultado**: No verificado
- **Evidencia**: ![RNF-09](./img/rnf-09.png)
- **Descripción**: Se instaló la app en Android 9+ / iOS 14+ y se verificó que ejecuta.

### RNF-10
- **Resultado**: No verificado
- **Evidencia**: Sin imagen (no se consideró necesaria)
- **Descripción**: No se probó en Chrome/Firefox/Edge/Safari (N-2).

### RNF-11
- **Resultado**: Cumple
- **Evidencia**: Sin imagen (no se consideró necesaria)
- **Descripción**: Se levantó con `docker compose up -d --build` y todo funcionó solo con Docker + variables de entorno.

### RNF-12
- **Resultado**: Cumple
- **Evidencia**: ![RNF-12](./img/rnf-12.png)
- **Descripción**: Como funcionario, se exportaron reportes a CSV y se verificó que el archivo se descargara correctamente.

