# EF · Retroalimentación y mejoras · Entregas 1 y 2

registro de las mejoras aplicadas sobre la Entrega 1 (EP1) y la Entrega 2 (EP2) a partir de la retroalimentación recibida, consolidadas para la Entrega Final (EF).

---

## EP1 · Mejoras aplicadas

### 1. Actualización de la redacción de los requerimientos funcionales y no funcionales
Se revisó y ajustó la redacción de los requerimientos funcionales (RF-01 a RF-18) y no funcionales (RNF-01 a RNF-12) en `docs/EP1.1. Requerimientos del sistema.md`, clarificando criterios de aceptación, dependencias y alcance de cada uno.

### 2. Una sola versión del prototipo en Figma
Se consolidó el diseño en una única versión del prototipo en Figma (móvil y web), eliminando variantes duplicadas y dejando como fuente de verdad el enlace publicado en el README y en `docs/EP1.3-diseno-ui-ux.md`.

### 3. Comparación visual entre Figma y la aplicación final (EP1.6)
Se integró en `docs/EP1.6-Comparacion-Figma-y-implementacion.md` la comparación visual entre las pantallas diseñadas en Figma y la implementación final, documentando correspondencias, diferencias y justificaciones.

### 4. Capturas y enlace a Figma en el README
Se agregaron al README capturas representativas (mapa de reportes e inicio de sesión) y el enlace al prototipo de Figma.

---

## EP2 · Mejoras aplicadas

### 5. Validación de `DATABASE_URL` y `JWT_SECRETO` al iniciar; ocultamiento de `X-Powered-By`
La API valida al arrancar que `DATABASE_URL` y `JWT_SECRETO` estén definidos y cumplan los requisitos mínimos. Express no envía la cabecera `X-Powered-By`.

### 6. CHECK / ENUM a estados y categorías
Los estados de los reportes y las categorías de residuo se restringen mediante `CHECK` (o `ENUM`) en la base de datos.

### 7. `.sql` re-ejecutable y única fuente de verdad con `schema.prisma`
El script `backend/database/focalware.sql` se hizo re-ejecutable y se mantiene sincronizado con `backend/prisma/schema.prisma` mediante `generarSql.js` y `npm run db:check`.

### 8. Cálculo del riesgo en el servidor (ignorar valor del body)
El índice de riesgo se calcula en el backend; el valor enviado en el body se ignora. Se restringen `categoría` y `volumen` a la lista cerrada.

### 9. Confirmación de existencia de la cuenta en operaciones sensibles; alineación del README (HS256 vs. RNF-05)
En operaciones sensibles se confirma que la cuenta exista y esté activa. Se alineó el README con el RNF-05 (HS256, expiración y rotación).

### 10. Validación del contenido real de la foto (magic bytes)
La subida valida el contenido real mediante `file-type`, aceptando solo JPG, PNG o WEBP reales y rechazando archivos renombrados con `400`.

### 11. Cálculo del riesgo movido del frontend al backend
Se movió el cálculo del índice de riesgo desde el frontend al backend, cumpliendo la nota de la Entrega 1.

### 12. Retiro del valor por defecto inseguro en Docker Compose
Se eliminó el valor por defecto inseguro, obligando a definir un `JWT_SECRETO` válido o a que la API lo autogenere.

### 13. Limitación de intentos de login
Los endpoints de login y recuperación limitan intentos por correo e IP, respondiendo `429 Too Many Requests` con `Retry-After`.

### 14. Reemplazo de Cypress de la plantilla y tests del cliente
Se reemplazó el Cypress heredado y se agregaron pruebas del cliente (frontend), además de las pruebas de API en Postman.

### 15. Actualización de la rama `frontend` desde `main` y corrección de textos
Se actualizó la rama `frontend` desde `main` y se corrigieron los textos que aún anunciaban el cálculo del riesgo como trabajo futuro.

### 16. Riesgo calculado en el servidor y listas cerradas de categoría y volumen
El índice de riesgo se calcula exclusivamente en el backend al crear un reporte, al editarlo, al corregir el desglose y al registrar o quitar apoyos. Si el cuerpo de la petición incluye un campo `riesgo`, se ignora: el cliente no puede imponer el valor que se guarda. La fórmula vive en `backend/src/dominio/riesgo.js` y el frontend solo la usa para previsualizar mientras se completa el formulario.

Además, `categoria` y `volumen` se validan contra las listas cerradas `CATEGORIAS_REPORTE` y `VOLUMENES_REPORTE` de `backend/src/dominio/opcionesReporte.js`. Un valor inventado, vacío o de otro tipo responde `400` al crear, editar o corregir el desglose.

---

## Resumen

| Entrega | Mejora | Estado |
|---|---|---|
| EP1 | Redacción de requerimientos | Aplicado |
| EP1 | Una sola versión en Figma | Aplicado |
| EP1 | Comparación Figma vs. app (EP1.6) | Aplicado |
| EP1 | Capturas y link a Figma en README | Aplicado |
| EP2 | Validación de env y ocultamiento de X-Powered-By | Aplicado |
| EP2 | CHECK/ENUM a estados y categorías | Aplicado |
| EP2 | .sql re-ejecutable y fuente única | Aplicado |
| EP2 | Riesgo calculado en servidor | Aplicado |
| EP2 | Confirmación de cuenta y alineación README | Aplicado |
| EP2 | Validación magic bytes de fotos | Aplicado |
| EP2 | Riesgo movido de frontend a backend | Aplicado |
| EP2 | Retiro del valor por defecto inseguro | Aplicado |
| EP2 | Limitación de intentos de login | Aplicado |
| EP2 | Reemplazo de Cypress y tests cliente | Aplicado |
| EP2 | Actualización rama `frontend` y textos | Aplicado |
| EP2 | Riesgo del cliente ignorado y listas cerradas | Aplicado |

