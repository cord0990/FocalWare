-- Base de datos FocalWare.
--
-- Uso:  psql -U postgres -h localhost -f backend/database/focalware.sql
--
-- Describe el mismo esquema que backend/prisma/schema.prisma. Si se cambia
-- uno hay que cambiar el otro.
--
-- Docker NO usa este archivo: el contenedor "api" aplica las migraciones de
-- Prisma al arrancar (ver backend/Dockerfile). Esta copia sirve para montar
-- la base a mano, sin Docker.

CREATE DATABASE focalware;

CREATE TABLE vecino (
    idvecino       SERIAL PRIMARY KEY,
    nombre         VARCHAR(100) NOT NULL,
    email          VARCHAR(150) NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    telefono       VARCHAR(20)
);

CREATE TABLE funcionario (
    idfuncionario  SERIAL PRIMARY KEY,
    nombre         VARCHAR(100) NOT NULL,
    email          VARCHAR(150) NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    telefono       VARCHAR(20)
);


CREATE TABLE cuadrilla (
    idcuadrilla     SERIAL PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL UNIQUE,
    sector_trabajo  VARCHAR(100)
);


CREATE TABLE puede_pertenecer (
    idfuncionario  INTEGER NOT NULL REFERENCES funcionario(idfuncionario) ON DELETE CASCADE,
    idcuadrilla    INTEGER NOT NULL REFERENCES cuadrilla(idcuadrilla)     ON DELETE CASCADE,
    PRIMARY KEY (idfuncionario, idcuadrilla)
);

CREATE TABLE revision (
    idrevision      SERIAL PRIMARY KEY,
    fecha_atencion  TIMESTAMP DEFAULT NOW(),
    estado          VARCHAR(30) NOT NULL,
    descripcion     TEXT,
    idfuncionario   INTEGER NOT NULL REFERENCES funcionario(idfuncionario),
    idcuadrilla     INTEGER REFERENCES cuadrilla(idcuadrilla) -- Puede ser NULL
);

CREATE TABLE reporte (
    idreporte             SERIAL PRIMARY KEY,
    titulo                VARCHAR(150) NOT NULL,
    descripcion           TEXT,
    categoria             VARCHAR(50)  NOT NULL,
    tamano                VARCHAR(30)  NOT NULL,
    sector                VARCHAR(100) NOT NULL,
    direccion             VARCHAR(200),
    latitud               NUMERIC(9,6) NOT NULL,
    longitud              NUMERIC(9,6) NOT NULL,
    distancia_a_casas     NUMERIC(8,2),
    indice_riesgo         NUMERIC(5,2),
    fecha_calculo_riesgo  TIMESTAMP,
    fecha_creacion        TIMESTAMP DEFAULT NOW(),
    clima_temperatura     NUMERIC(4,1),
    clima_condicion       VARCHAR(100),
    clima_humedad         NUMERIC(5,2),
    clima_viento          NUMERIC(5,2),
    idvecino              INTEGER NOT NULL REFERENCES vecino(idvecino),
    idrevision            INTEGER REFERENCES revision(idrevision)
);


CREATE TABLE imagen_reporte (
    idimg_reporte   SERIAL PRIMARY KEY,
    ruta_directorio VARCHAR(255) NOT NULL,
    orden           INTEGER NOT NULL DEFAULT 1,
    idreporte       INTEGER NOT NULL REFERENCES reporte(idreporte) ON DELETE CASCADE
);


CREATE TABLE votos (
    idvoto     SERIAL PRIMARY KEY,
    idreporte  INTEGER NOT NULL REFERENCES reporte(idreporte) ON DELETE CASCADE,
    idvecino   INTEGER NOT NULL REFERENCES vecino(idvecino)   ON DELETE CASCADE,
    UNIQUE (idreporte, idvecino)
);


CREATE TABLE log (
    idhistorial    SERIAL PRIMARY KEY,
    fecha_hora     TIMESTAMP DEFAULT NOW(),
    estado_log     VARCHAR(50) NOT NULL,
    comentario     TEXT,
    idfuncionario  INTEGER NOT NULL REFERENCES funcionario(idfuncionario),
    idrevision     INTEGER NOT NULL REFERENCES revision(idrevision) ON DELETE CASCADE
);


CREATE TABLE notificacion (
    idnotificacion  SERIAL PRIMARY KEY,
    mensaje         TEXT NOT NULL,
    tipo            VARCHAR(50),
    fecha           TIMESTAMP DEFAULT NOW(),
    leida           BOOLEAN NOT NULL DEFAULT FALSE,
    idvecino        INTEGER NOT NULL REFERENCES vecino(idvecino) ON DELETE CASCADE,
    idrevision      INTEGER NOT NULL REFERENCES revision(idrevision) ON DELETE CASCADE
);

CREATE TABLE reporte_control (
    idreportecontrol  SERIAL PRIMARY KEY,
    descripcion       TEXT,
    fecha_control     TIMESTAMP DEFAULT NOW(),
    idfuncionario     INTEGER NOT NULL REFERENCES funcionario(idfuncionario),
    idrevision        INTEGER REFERENCES revision(idrevision)
);


CREATE TABLE imagen_control (
    idimg_control     SERIAL PRIMARY KEY,
    ruta_directorio   VARCHAR(255) NOT NULL,
    idreportecontrol  INTEGER NOT NULL REFERENCES reporte_control(idreportecontrol) ON DELETE CASCADE
);
