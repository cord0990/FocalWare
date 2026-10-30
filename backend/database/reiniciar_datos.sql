-- Deja la base vacía, sin borrar las tablas, para volver a cargar los datos de prueba.
-- Se usa antes de cada sesión de prueba con usuarios, así cada participante parte
-- con la misma app. Después de este archivo se carga datos_prueba.sql.
--
-- Desde la raíz del proyecto (en cmd o Git Bash, no en PowerShell):
--   docker exec -i focalware-db psql -U postgres -d focalware < backend/database/reiniciar_datos.sql
--   docker exec -i focalware-db psql -U postgres -d focalware < backend/database/datos_prueba.sql
--
-- RESTART IDENTITY vuelve los id a 1, porque datos_prueba.sql usa id fijos
-- (por ejemplo, los votos apuntan al vecino 1 y al reporte 2).

TRUNCATE TABLE
    imagen_control,
    reporte_control,
    notificacion,
    log,
    votos,
    imagen_reporte,
    reporte,
    revision,
    puede_pertenecer,
    cuadrilla,
    funcionario,
    vecino
RESTART IDENTITY CASCADE;
