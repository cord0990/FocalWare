CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "vecino" (
    "idvecino" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "telefono" VARCHAR(20),

    CONSTRAINT "vecino_pkey" PRIMARY KEY ("idvecino")
);

-- CreateTable
CREATE TABLE "funcionario" (
    "idfuncionario" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "telefono" VARCHAR(20),

    CONSTRAINT "funcionario_pkey" PRIMARY KEY ("idfuncionario")
);

-- CreateTable
CREATE TABLE "cuadrilla" (
    "idcuadrilla" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "sector_trabajo" VARCHAR(100),

    CONSTRAINT "cuadrilla_pkey" PRIMARY KEY ("idcuadrilla")
);

-- CreateTable
CREATE TABLE "puede_pertenecer" (
    "idfuncionario" INTEGER NOT NULL,
    "idcuadrilla" INTEGER NOT NULL,

    CONSTRAINT "puede_pertenecer_pkey" PRIMARY KEY ("idfuncionario","idcuadrilla")
);

-- CreateTable
CREATE TABLE "revision" (
    "idrevision" SERIAL NOT NULL,
    "fecha_atencion" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "estado" VARCHAR(30) NOT NULL,
    "descripcion" TEXT,
    "idfuncionario" INTEGER NOT NULL,
    "idcuadrilla" INTEGER,

    CONSTRAINT "revision_pkey" PRIMARY KEY ("idrevision")
);

-- CreateTable
CREATE TABLE "reporte" (
    "idreporte" SERIAL NOT NULL,
    "titulo" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "categoria" VARCHAR(50) NOT NULL,
    "tamano" VARCHAR(30) NOT NULL,
    "sector" VARCHAR(100) NOT NULL,
    "direccion" VARCHAR(200),
    "latitud" DECIMAL(9,6) NOT NULL,
    "longitud" DECIMAL(9,6) NOT NULL,
    "distancia_a_casas" DECIMAL(8,2),
    "indice_riesgo" DECIMAL(5,2),
    "fecha_calculo_riesgo" TIMESTAMP(3),
    "fecha_creacion" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "clima_temperatura" DECIMAL(4,1),
    "clima_condicion" VARCHAR(100),
    "clima_humedad" DECIMAL(5,2),
    "clima_viento" DECIMAL(5,2),
    "idvecino" INTEGER NOT NULL,
    "idrevision" INTEGER,

    CONSTRAINT "reporte_pkey" PRIMARY KEY ("idreporte")
);

-- CreateTable
CREATE TABLE "imagen_reporte" (
    "idimg_reporte" SERIAL NOT NULL,
    "ruta_directorio" VARCHAR(255) NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 1,
    "idreporte" INTEGER NOT NULL,

    CONSTRAINT "imagen_reporte_pkey" PRIMARY KEY ("idimg_reporte")
);

-- CreateTable
CREATE TABLE "votos" (
    "idvoto" SERIAL NOT NULL,
    "idreporte" INTEGER NOT NULL,
    "idvecino" INTEGER NOT NULL,

    CONSTRAINT "votos_pkey" PRIMARY KEY ("idvoto")
);

-- CreateTable
CREATE TABLE "log" (
    "idhistorial" SERIAL NOT NULL,
    "fecha_hora" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "estado_log" VARCHAR(50) NOT NULL,
    "comentario" TEXT,
    "idfuncionario" INTEGER NOT NULL,
    "idrevision" INTEGER NOT NULL,

    CONSTRAINT "log_pkey" PRIMARY KEY ("idhistorial")
);

-- CreateTable
CREATE TABLE "notificacion" (
    "idnotificacion" SERIAL NOT NULL,
    "mensaje" TEXT NOT NULL,
    "tipo" VARCHAR(50),
    "fecha" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "idvecino" INTEGER NOT NULL,
    "idrevision" INTEGER NOT NULL,

    CONSTRAINT "notificacion_pkey" PRIMARY KEY ("idnotificacion")
);

-- CreateTable
CREATE TABLE "reporte_control" (
    "idreportecontrol" SERIAL NOT NULL,
    "descripcion" TEXT,
    "fecha_control" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "idfuncionario" INTEGER NOT NULL,
    "idrevision" INTEGER,

    CONSTRAINT "reporte_control_pkey" PRIMARY KEY ("idreportecontrol")
);

-- CreateTable
CREATE TABLE "imagen_control" (
    "idimg_control" SERIAL NOT NULL,
    "ruta_directorio" VARCHAR(255) NOT NULL,
    "idreportecontrol" INTEGER NOT NULL,

    CONSTRAINT "imagen_control_pkey" PRIMARY KEY ("idimg_control")
);

-- CreateIndex
CREATE UNIQUE INDEX "vecino_email_key" ON "vecino"("email");

-- CreateIndex
CREATE UNIQUE INDEX "funcionario_email_key" ON "funcionario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cuadrilla_nombre_key" ON "cuadrilla"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "votos_idreporte_idvecino_key" ON "votos"("idreporte", "idvecino");

-- AddForeignKey
ALTER TABLE "puede_pertenecer" ADD CONSTRAINT "puede_pertenecer_idfuncionario_fkey" FOREIGN KEY ("idfuncionario") REFERENCES "funcionario"("idfuncionario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puede_pertenecer" ADD CONSTRAINT "puede_pertenecer_idcuadrilla_fkey" FOREIGN KEY ("idcuadrilla") REFERENCES "cuadrilla"("idcuadrilla") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revision" ADD CONSTRAINT "revision_idfuncionario_fkey" FOREIGN KEY ("idfuncionario") REFERENCES "funcionario"("idfuncionario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revision" ADD CONSTRAINT "revision_idcuadrilla_fkey" FOREIGN KEY ("idcuadrilla") REFERENCES "cuadrilla"("idcuadrilla") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reporte" ADD CONSTRAINT "reporte_idvecino_fkey" FOREIGN KEY ("idvecino") REFERENCES "vecino"("idvecino") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reporte" ADD CONSTRAINT "reporte_idrevision_fkey" FOREIGN KEY ("idrevision") REFERENCES "revision"("idrevision") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagen_reporte" ADD CONSTRAINT "imagen_reporte_idreporte_fkey" FOREIGN KEY ("idreporte") REFERENCES "reporte"("idreporte") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votos" ADD CONSTRAINT "votos_idreporte_fkey" FOREIGN KEY ("idreporte") REFERENCES "reporte"("idreporte") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votos" ADD CONSTRAINT "votos_idvecino_fkey" FOREIGN KEY ("idvecino") REFERENCES "vecino"("idvecino") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log" ADD CONSTRAINT "log_idfuncionario_fkey" FOREIGN KEY ("idfuncionario") REFERENCES "funcionario"("idfuncionario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log" ADD CONSTRAINT "log_idrevision_fkey" FOREIGN KEY ("idrevision") REFERENCES "revision"("idrevision") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacion" ADD CONSTRAINT "notificacion_idvecino_fkey" FOREIGN KEY ("idvecino") REFERENCES "vecino"("idvecino") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacion" ADD CONSTRAINT "notificacion_idrevision_fkey" FOREIGN KEY ("idrevision") REFERENCES "revision"("idrevision") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reporte_control" ADD CONSTRAINT "reporte_control_idfuncionario_fkey" FOREIGN KEY ("idfuncionario") REFERENCES "funcionario"("idfuncionario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reporte_control" ADD CONSTRAINT "reporte_control_idrevision_fkey" FOREIGN KEY ("idrevision") REFERENCES "revision"("idrevision") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagen_control" ADD CONSTRAINT "imagen_control_idreportecontrol_fkey" FOREIGN KEY ("idreportecontrol") REFERENCES "reporte_control"("idreportecontrol") ON DELETE CASCADE ON UPDATE CASCADE;

