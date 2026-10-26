# Migración de Wireframes: Figma a React 

Este documento detalla las modificaciones de diseño, experiencia de usuario y cambios en las reglas del sistema que se aplicaron al pasar los diseños de Figma a la plataforma final en React.

---

## 1. Sección General y Autenticación

### Inicio de Sesión y Registro
*   **Iniciar Sesión:** Se mantiene la estructura principal. Se decidió cambiar el logo a su versión original a color y dejar las letras en negro en lugar de blanco. Además, se reorganizó ligeramente el orden del formulario.
*   **Iniciar Sesión - Fallas:** Se muestran mensajes de texto en color rojo alineados a la izquierda, justo debajo de los campos correspondientes, indicando el error específico (ej. "*Correo no existente" o "*Contraseña o correo incorrectos").
*   **Crear Cuenta:** Se incluyó el formulario con los campos de Correo y Contraseña, además de un checkbox obligatorio para aceptar los Términos y Condiciones. Cuenta con validaciones visuales que despliegan mensajes en rojo si hay fallas en el ingreso (ej. "* Correo ya existente" o "* No cumple con los requerimientos minimos").
*   **Pantalla de Inicio (Sin Login):** Cambio sustancial. En vez de mostrar una pantalla estática con información y botones para entrar, ahora se muestra directamente el mapa principal de Focalware. Se agregó un botón arriba para "Iniciar sesión", así el usuario no necesita estar registrado para ver los reportes.

### Recuperar Contraseña
*   **Paso 1 (Solicitud):** Se mantiene la estructura base, pero el formulario se mejoró visualmente para que sea más fácil de entender. Se agregó una barra para mostrar en qué paso del proceso se encuentra el usuario, se verifica que el correo tenga el formato correcto (ej. `nombre@dominio.cl`) y se sumó una opción para volver al inicio de sesión.
*   **Paso 2 (Código):** Se actualizó la barra de progreso. La forma de ingresar el código ahora solo permite 6 dígitos exactos, es más claro y permite reenviar el código o volver al paso anterior.
*   **Paso 3 (Nueva Contraseña):** Mantiene la barra de progreso. Se agregaron las reglas de seguridad necesarias para la nueva contraseña, una opción para verla u ocultarla mientras se escribe, y se marcan ambos campos como obligatorios.

---

## 2. Vistas de Usuario y Permisos

Se realizaron cambios generales en los colores de la página, en algunos elementos visuales y en los permisos de cada tipo de usuario, como se detalla a continuación:

### 2.1. Perfil: Vecino

*   **Pantalla de Inicio - Mapa:** 
    1. Los botones laterales ahora están centrados y no en la parte superior.
    2. Ahora se puede ver un mapa de calor.
    3. El color de riesgo medio y bajo fueron modificados.
    4. Se agregó una opción de Zoom en la parte superior izquierda.
    5. Sobre la lista de reportes aparecerá el total de reportes y cómo se categoriza cada riesgo en porcentaje (Bajo de 0 a 29%, Medio de 30 a 59%, Alto de 60 a 79% y Crítico de 80 a 100%).
*   **Pantalla de Inicio - Filtro:** El filtro ahora es más minimalista y pequeño. Al abrirse como una ventana emergente, oscurece un poco el fondo de la pantalla para resaltar. Se agregó un botón para cerrarlo y el botón de cancelar se cambió por "Quitar filtros".
*   **Filtro sin resultados:** Aparece un aviso superpuesto en la parte inferior derecha del mapa indicando "No se lograron encontrar concidencias", acompañado de un botón transparente para "Reiniciar Filtro".
*   **Mis Reportes:** Ahora tiene etiquetas con filtros predeterminados en la barra superior. Se agregó una barra de búsqueda, una pequeña descripción de la sección y un botón en la esquina superior derecha para "Hacer un reporte".
*   **Crear Reporte:** Por temas de base de datos y UX, se agregó un campo obligatorio para ponerle un "Título" al reporte, ubicado justo sobre la opción del sector. También cambió ligeramente la forma en que se ven las imágenes subidas.
*   **Reporte creado con éxito:** Se implementó una ventana emergente (modal) que oscurece el fondo y confirma el envío con el texto "Reporte creado con exito, Redirigiendo al menu principal..", acompañada de un botón de "Aceptar".
*   **Modificar Reporte:** Se utiliza una interfaz casi idéntica a la creación de reportes. Permite modificar el Sector, la Descripción y gestionar la galería (agregando o quitando hasta 5 imágenes), con botones inferiores fijos para "Cancelar Reporte" o "Subir Reporte".
*   **Detalles del Reporte:** Se respeta el diseño original casi por completo, solo se añadió una etiqueta visual para ver claramente en qué estado se encuentra el reporte.
*   **Mi Perfil - Configuraciones:** Vista sencilla que muestra los datos actuales del usuario (Nombre de usuario, Rol de "Vecino", y el Correo electrónico enmascarado por seguridad con asteriscos). Incluye botones para "Cambiar Contraseña", "Cerrar sesion", "Descartar Cambios" y "Aceptar Cambios".
*   **Mi Perfil - Notificaciones:** Listado que muestra notificaciones sobre el estado de los reportes (ej. ¡Tu reporte a pasado a sido aceptado!). Al seleccionar "Ver detalles...", redirige a una línea de tiempo del reporte que muestra gráficamente la "Fecha de creacion", "Fecha de aprobacion" y "Fecha de control".
*   **Términos y Condiciones:** Cambio importante en el diseño. Se ingresa desde el menú desplegable del usuario en la parte superior. Cambiaron los colores radicalmente, el contenido es mucho más detallado y se incluyó el centro de ayuda. La sección "Acerca de Focalware" se trasladó a este lugar.

---

### 2.2. Perfil: Funcionario

*   **Pantalla de Inicio - Mapa:** Se aplican los mismos cambios importantes que en el perfil Vecino (mapa de calor, botones centrados, zoom, modificación de colores y porcentajes). La principal diferencia es que, por defecto, aparecen primero los reportes con el índice de riesgo más alto.
*   **Pantalla de Inicio - Filtro:** Utiliza la misma ventana emergente minimalista que oscurece el fondo, igual que en el perfil Vecino.
*   **Filtro sin resultados:** Al igual que en la vista de vecino, despliega la alerta "No se lograron encontrar concidencias" sobre la interfaz del mapa.
*   **Modificar Reporte:** Un reporte creado por un vecino ahora puede ser editado por un funcionario.
*   **Reporte - Detalles:** Vista de lectura que desglosa toda la información clave: ID Reporte, Fecha, Categoría, Volumen Estimado, Distancia de viviendas, Apoyos vecinales, Antigüedad, Clima al reportar y la descripción. Incluye el carrusel/grilla de imágenes y la miniatura del mapa.
*   **Opciones de Funcionario:** Se integró un menú desplegable lateral oscuro exclusivo para gestión de reportes con 4 acciones:
    1. **Aprobar Reporte:** Despliega un panel lateral para "Seleccionar Cuadrilla", "Seleccionar Fecha" y un área de texto para "Escribir detalles de Apruebo...".
    2. **Rechazar Reporte:** Despliega un área de texto grande para "Escribir motivos de rechazo...".
    3. **Reporte Controlado:** Permite adjuntar imágenes de la resolución y escribir los detalles del control. *Regla del sistema:* Si el funcionario no pertenece a la planilla de la cuadrilla asignada, salta una alerta indicando "No tiene permisos de editar porque no pertenece a la planilla seleccionada para este control, Intente mas tarde." con un botón para Aceptar.
    4. **Modificar Reporte:** Permite la edición de los campos del reporte original.
*   **Mi Perfil - Configuraciones:** Comparte el mismo componente de configuraciones del perfil Vecino, pero reflejando el rol de "Funcionario" bajo el nombre de usuario.
*   **Mi Perfil - Notificaciones:** En Figma el funcionario tiene el mismo panel de avisos que el vecino, pero en esta entrega no se implementó. Las notificaciones son solo para el vecino (RF-08: avisar al autor cuando cambia el estado de su reporte) y la tabla `notificacion` solo guarda al vecino destinatario. Por eso "Mi perfil" lleva al funcionario directo a Configuraciones y su menú de cuenta no muestra la opción. *Nota técnica:* las notificaciones del funcionario (por ejemplo, cuando llega un reporte de riesgo alto o se asigna uno a su cuadrilla) quedan para la Entrega Final.
*   **Términos y Condiciones:** Comparte el mismo rediseño completo del perfil Vecino (accesible desde el menú superior del usuario).
*   **Estadísticas:** Se respeta casi por completo el diseño base que venía de Figma, consolidando cifras mensuales de reportes totales, reportes resueltos, gráficos de barras de evolución mensual y el gráfico circular de seguimiento.

#### Vistas Descartadas (Exclusivas para Vecinos):
Por decisiones de diseño y funcionamiento, ahora solo un **Vecino** puede crear reportes. Por lo tanto, las siguientes pantallas fueron eliminadas para el perfil de Funcionario:
*   ~~Mis reportes~~ *(Se eliminó también el botón del menú lateral izquierdo y la tarjeta "Ir a Mis reportes" de la página de Ayuda).*
*   ~~Crear Reporte~~.
*   ~~Reporte creado con éxito~~.