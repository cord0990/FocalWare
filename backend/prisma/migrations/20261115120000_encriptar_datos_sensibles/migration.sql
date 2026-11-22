-- Los datos de contacto se cifran desde la aplicación con AES-256-GCM.
-- TEXT permite guardar el valor cifrado completo sin límites de longitud.
ALTER TABLE "vecino" ALTER COLUMN "telefono" TYPE TEXT;
ALTER TABLE "funcionario" ALTER COLUMN "telefono" TYPE TEXT;
ALTER TABLE "reporte" ALTER COLUMN "direccion" TYPE TEXT;
