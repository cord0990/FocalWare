-- Datos de prueba de FocalWare.
--
-- Se cargan solos al final de focalware.sql. Si la base se creó con Docker
-- (migraciones de Prisma), se cargan aparte con:
--   docker exec -i focalware-db psql -U postgres -d focalware < backend/database/datos_prueba.sql
--
-- La contraseña de todos los usuarios de prueba es: Clave123
-- Los funcionarios usan correo @focalware.cl, igual que en el frontend.
--
-- Los reportes son los mismos que muestra el frontend como ejemplo.
-- No se cargan fotos porque los archivos no se suben al repositorio.

-- Vecinos (id 1 a 3)
INSERT INTO vecino (nombre, email, password_hash, telefono) VALUES
('Valentina Rojas', 'valentina.rojas@correo.cl', '$2b$10$h5WbHdV.D/6elupJH1ZkWeYeOsCjYDTZuCdrYWBccPj4sYEgblVYG', '+56912345678'),
('Matías Fuentes',  'matias.fuentes@correo.cl',  '$2b$10$m3yDu7wiw1DoQfKQEeQ5.OpWxiF4hHO3Uhc/Fmcypb.9Tx9Qfznym', NULL),
('Camila Soto',     'camila.soto@correo.cl',     '$2b$10$.AVojrg3CLf4bNaJ2E0hk.Xr9dHtrS.U9nhVTneD8o5IPNTCVSqVe', '+56987654321');

-- Funcionarios (id 1 y 2)
INSERT INTO funcionario (nombre, email, password_hash, telefono) VALUES
('Javiera Muñoz', 'javiera.munoz@focalware.cl', '$2b$10$e/yHY6G/erBPgguSgfSBre1uLyL8Tasw.04ySoSnwW8L5Ng3YpePC', '+56322220001'),
('Andrés Pérez',  'andres.perez@focalware.cl',  '$2b$10$FkKq2Q2k44Cv9x.mSFf0yuabU8WkzZ/O.4E5Nsp8iaoAZqKxJB8Pm', '+56322220002');

-- Cuadrillas (id 1 a 3)
INSERT INTO cuadrilla (nombre, sector_trabajo) VALUES
('Cuadrilla Cerros (DIMAO)',      'Cerros centrales'),
('Cuadrilla Quebradas (OMZ)',     'Quebradas'),
('Cuadrilla Norte (Operaciones)', 'Sector norte');

-- Qué funcionario pertenece a qué cuadrilla
INSERT INTO puede_pertenecer (idfuncionario, idcuadrilla) VALUES
(1, 1),
(1, 2),
(2, 3);

-- Revisiones (id 1 a 5). Se crean cuando el funcionario acepta o rechaza un reporte.
INSERT INTO revision (fecha_atencion, estado, descripcion, idfuncionario, idcuadrilla) VALUES
('2026-09-10 09:00', 'En atención', 'Retiro de basura y corte del pasto seco alrededor.', 1, 1),
('2026-09-30 10:00', 'Aprobado',    'Poda de ramas bajo el tendido eléctrico.',          1, 2),
('2026-10-02 09:30', 'Aprobado',    'Retiro de neumáticos con camión.',                  1, 1),
('2026-08-20 08:30', 'Controlado',  'Retiro de escombros de la ladera.',                 2, 3),
(NULL,               'Rechazado',   'El lugar es un terreno privado, se deriva al dueño.', 2, NULL);

-- Reportes (id 1 a 7). Los que siguen Pendientes no tienen revisión.
INSERT INTO reporte (titulo, descripcion, categoria, tamano, sector, direccion, latitud, longitud,
                     distancia_a_casas, indice_riesgo, fecha_calculo_riesgo, fecha_creacion,
                     clima_temperatura, clima_condicion, clima_humedad, clima_viento, idvecino, idrevision) VALUES
('Acumulación de basura en quebrada',
 'Bolsas de basura domiciliaria y restos de muebles acumulados en el fondo de la quebrada, junto a la escalera que baja desde la calle principal. Hay pasto seco alrededor.',
 'Microbasural', 'Muy grande (un camión)', 'Cerro Cordillera', NULL, -33.041800, -71.633500,
 8, 86, '2026-09-02 12:00', '2026-09-02 11:30', 24.5, 'Despejado', 28, 32, 1, 1),

('Ramas secas bajo tendido eléctrico',
 'Ramas y hojas secas acumuladas justo debajo de los cables eléctricos. Con el viento de la tarde se mueven y rozan los cables.',
 'Vegetación seca', 'Grande (una camioneta)', 'Las Cañas', NULL, -33.056200, -71.611800,
 8, 91, '2026-09-20 16:00', '2026-09-20 15:40', 27.0, 'Despejado', 25, 35, 2, 2),

('Pastizal seco junto a viviendas',
 'Sitio eriazo con pastizal alto y seco que llega hasta las rejas de las casas del pasaje. Los vecinos botan basura en la esquina.',
 'Vegetación seca', 'Grande (una camioneta)', 'Playa Ancha', NULL, -33.030500, -71.640200,
 30, 72, '2026-09-24 10:00', '2026-09-24 09:50', 21.0, 'Parcialmente nublado', 45, 20, 3, NULL),

('Neumáticos abandonados en ladera',
 'Alrededor de treinta neumáticos botados en la ladera, justo detrás de las casas de la cancha. Algunos están parcialmente quemados.',
 'Neumáticos', 'Grande (una camioneta)', 'Rodelillo', NULL, -33.051800, -71.579500,
 8, 64, '2026-08-28 13:00', '2026-08-28 12:45', 18.5, 'Nublado', 60, 15, 1, 3),

('Microbasural en Quebrada Verde',
 'Microbasural que se forma cada semana a un costado del camino. Hay plásticos, cartones y restos de construcción.',
 'Microbasural', 'Mediano (un auto)', 'Playa Ancha', NULL, -33.056100, -71.645200,
 30, 57, '2026-09-15 11:00', '2026-09-15 10:30', 19.0, 'Nublado', 55, 18, 2, NULL),

('Escombros en ladera',
 'Restos de una demolición (ladrillos, maderas y latas) dejados en la ladera.',
 'Escombros', 'Grande (una camioneta)', 'Cerro Alegre', NULL, -33.043300, -71.626800,
 30, 45, '2026-08-10 17:00', '2026-08-10 16:20', 16.0, 'Lluvia ligera', 80, 10, 3, 4),

('Colchones y muebles en quebrada',
 'Dos colchones y un sillón botados al borde de la quebrada, dentro de un sitio con reja.',
 'Residuos voluminosos', 'Mediano (un auto)', 'Cerro Barón', NULL, -33.039000, -71.611000,
 75, 38, '2026-09-28 14:00', '2026-09-28 13:30', 20.0, 'Despejado', 40, 22, 1, 5);

-- Votos (un vecino vota una sola vez por reporte)
INSERT INTO votos (idreporte, idvecino) VALUES
(1, 2), (1, 3),
(2, 1), (2, 3),
(3, 1), (3, 2),
(4, 2),
(5, 1), (5, 3),
(6, 1);

-- Historial de cambios de estado de cada revisión
INSERT INTO log (fecha_hora, estado_log, comentario, idfuncionario, idrevision) VALUES
('2026-09-04 10:15', 'Aprobado',    'Se asigna a la Cuadrilla Cerros.',            1, 1),
('2026-09-10 09:00', 'En atención', 'La cuadrilla llegó al lugar.',                1, 1),
('2026-09-22 09:40', 'Aprobado',    'Se asigna a la Cuadrilla Quebradas.',         1, 2),
('2026-09-01 12:00', 'Aprobado',    'Se asigna a la Cuadrilla Cerros.',            1, 3),
('2026-08-12 08:30', 'Aprobado',    'Se asigna a la Cuadrilla Norte.',             2, 4),
('2026-08-20 16:45', 'Controlado',  'Escombros retirados, se adjunta evidencia.',  2, 4),
('2026-09-29 11:00', 'Rechazado',   'El lugar es un terreno privado.',             2, 5);

-- Notificaciones para el autor de cada reporte
INSERT INTO notificacion (mensaje, tipo, fecha, leida, idvecino, idrevision) VALUES
('Tu reporte "Acumulación de basura en quebrada" fue aprobado.',  'Aprobado',    '2026-09-04 10:15', TRUE,  1, 1),
('Tu reporte "Acumulación de basura en quebrada" está en atención.', 'En atención', '2026-09-10 09:00', FALSE, 1, 1),
('Tu reporte "Ramas secas bajo tendido eléctrico" fue aprobado.', 'Aprobado',    '2026-09-22 09:40', FALSE, 2, 2),
('Tu reporte "Neumáticos abandonados en ladera" fue aprobado.',   'Aprobado',    '2026-09-01 12:00', TRUE,  1, 3),
('Tu reporte "Escombros en ladera" fue controlado.',              'Controlado',  '2026-08-20 16:45', TRUE,  3, 4),
('Tu reporte "Colchones y muebles en quebrada" fue rechazado.',   'Rechazado',   '2026-09-29 11:00', FALSE, 1, 5);

-- Reporte de control (evidencia de que se limpió)
INSERT INTO reporte_control (descripcion, fecha_control, idfuncionario, idrevision) VALUES
('Se retiraron todos los escombros. La ladera quedó despejada.', '2026-08-20 16:45', 2, 4);
