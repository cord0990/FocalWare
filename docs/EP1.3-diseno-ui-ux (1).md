# **EP1.3 --- Bocetos de UI/UX y prototipo en Figma**

# **Prototipo**

El diseño fue elaborado manualmente por el equipo en Figma, usando
formas, marcos, componentes y Auto Layout, según lo exigido por la pauta
del curso.

## **Paleta de color (Propuesta 6)**

  ------------------------------------------------------------------------
  **Color**           **Hex**         **Uso**
  ------------------- --------------- ------------------------------------
  Blanco              #FFFFFF         Fondo base

  Durazno claro       #FFE8C9         Fondo secundario / superficies

  Rosa claro          #FFE9E7         Fondo secundario alternativo

  Naranja             #FCB860         Acento cálido / riesgo medio

  Coral               #F45648         Acento primario / enlaces

  Rojo                #E72441         Botón principal / riesgo alto

  Mauve gris          #C6ACAA         Bordes / texto secundario

  Gris oscuro         #423C3D         Texto primario
  ------------------------------------------------------------------------

## **Pantallas y su relación con los requerimientos funcionales**

  -----------------------------------------------------------------------
  **Pantalla**                 **Requerimiento     **Versión**
                               funcional**         
  ---------------------------- ------------------- ----------------------
  Inicio de sesión             Transversal (no es  Mobile y web
                               RF)                 

  Crear cuenta                 Transversal (no es  Mobile y web
                               RF)                 

  Crear reporte --- paso 1     RF-01, RF-02        Mobile
  (foto y ubicación)                               

  Crear reporte --- paso 2     RF-01               Mobile
  (categoría, volumen,                             
  distancia)                                       

  Modal de reporte duplicado   RF-05               Mobile

  Mapa de reportes             RF-03, RF-09        Mobile y web

  Mis reportes                 RF-07               Mobile

  Pantalla de inicio con menú  Navegación general  Web
  lateral                                          
  -----------------------------------------------------------------------

RF-04 (cálculo del índice de riesgo) no tiene una pantalla propia: se
refleja como los badges de color (alto/medio/bajo) que aparecen en el
mapa y en Mis reportes. RF-06 y RF-08 corresponden al rol Funcionario y
quedan fuera del alcance mínimo de EP1.3, centrado en el rol Vecino/a.

## 

## 

## **Adaptación móvil / web**

-   Móvil: navegación con barra inferior fija (Mapa, Reportar, Mis
    reportes, Perfil).

-   Web: navegación con menú lateral fijo con los mismos destinos,
    aprovechando el ancho adicional para mostrar contenido
    complementario (por ejemplo, mapa + lista de reportes lado a lado en
    vez de una sola vista a pantalla completa).

## **Formulario de registro**

  ------------------------------------------------------------------------------
  **Campo**           **Obligatorio**   **Justificación**
  ------------------- ----------------- ----------------------------------------
  Nombre para mostrar Sí                Identifica al vecino/a dentro de la
                                        comunidad sin exponer su nombre legal
                                        completo.

  Correo electrónico  Sí                Identificador único de la cuenta y canal
                                        de recuperación de contraseña.

  Contraseña /        Sí                Seguridad de la cuenta; se solicita
  Confirmar                             confirmación para evitar errores de
  contraseña                            tipeo.

  Cerro o unidad      Sí                Permite ubicar contextualmente los
  vecinal                               reportes del usuario sin pedir una
                                        dirección exacta.

  Teléfono            No                Opcional, solo para notificaciones
                                        alternativas si el usuario lo prefiere.

  Aceptación de       Sí                Requisito legal antes de habilitar la
  términos y política                   cuenta.
  de privacidad                         
  ------------------------------------------------------------------------------

No se solicitan RUT ni dirección exacta: ninguno de los dos es necesario
para que la aplicación funcione, y evitarlos reduce el riesgo de exponer
datos personales sensibles (ver RNF-04).

El formulario representa visualmente: campos obligatorios marcados con
asterisco vs. opcionales con borde punteado, mensajes de error
específicos por campo (ej. \"correo o contraseña incorrectos\"), un
indicador de fuerza de contraseña, y el botón de envío deshabilitado
hasta aceptar los términos.

## **Formulario de inicio de sesión**

Campos: correo y contraseña. Muestra un mensaje de error genérico (sin
indicar cuál de los dos campos falló, por seguridad) y un estado de
carga en el botón mientras se valida la sesión.
