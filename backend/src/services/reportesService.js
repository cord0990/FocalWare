// Lógica de reportes: listar, ver, crear, modificar y eliminar.
const fs = require('node:fs');
const path = require('node:path');
const { prisma } = require('../../dist/db/index.js');
const climaService = require('./climaService');

// Carpeta donde multer deja las fotos.
const CARPETA_UPLOADS = path.join(__dirname, '..', '..', 'uploads');

const borrarFotosDelDisco = (fotos) => {
  for (const foto of fotos) {
    try {
      const destino = path.join(CARPETA_UPLOADS, foto.ruta);
      if (path.resolve(destino).startsWith(path.resolve(CARPETA_UPLOADS))) {
        fs.rmSync(destino, { force: true });
      }
    } catch {
    }
  }
};

// Un reporte "Controlado" hace más de un mes ya no sale en el mapa,
// salvo para los funcionarios.
const UN_MES = 30 * 24 * 60 * 60 * 1000; // un mes en milisegundos

// El mapa y el detalle son públicos, así que se saca el nombre y el correo del vecino
// Solo el dueño y los funcionarios lo ven
const quitarDatosDelVecino = (reporte) => {
  const { nombreVecino, emailVecino, ...resto } = reporte;
  return resto;
};

const aReporteVisible = (reporte, { conVecino = false, idUsuario = null } = {}) => {
  const completo = aReporte(reporte, { conVecino, idUsuario });
  return conVecino ? completo : quitarDatosDelVecino(completo);
};

// El frontend manda la cercanía como una de estas cuatro categorías,
// pero la base guarda los metros. Se traduce al punto medio de cada rango.
const DISTANCIAS_A_METROS = {
  'Menos de 10 m': 5,
  'Entre 10 y 50 m': 30,
  'Entre 50 y 100 m': 75,
  'Más de 100 m': 150,
};

const metrosDeDistancia = (valor) => {
  if (valor === undefined || valor === null || valor === '') return null;
  if (typeof valor === 'number') return valor;
  return DISTANCIAS_A_METROS[valor] ?? null;
};

const categoriaDeDistancia = (metros) => {
  if (metros === null || metros === undefined) return '';
  const numero = Number(metros);
  if (numero < 10) return 'Menos de 10 m';
  if (numero <= 50) return 'Entre 10 y 50 m';
  if (numero <= 100) return 'Entre 50 y 100 m';
  return 'Más de 100 m';
};

// El estado no está en el reporte:
// sale de su revisión, o es Pendiente si todavía no fue revisado.
const estadoDe = (reporte) => reporte.revision?.estado ?? 'Pendiente';

// Traduce de la base a lo que entiende el frontend. El id vuelve como string
// porque el frontend lo usa como clave y en las rutas.
const esAprobada = (estado) => estado === 'Aprobado' || estado === 'En atención';

const gestionDe = (reporte) => {
  if (!reporte.revision) return undefined;

  const estado = estadoDe(reporte);
  if (estado === 'Rechazado') {
    return {
      rechazo: {
        motivo: reporte.revision.descripcion ?? '',
        funcionario: reporte.revision.funcionario?.nombre ?? '',
        fecha: reporte.revision.fechaAtencion?.toISOString() ?? '',
      },
    };
  }

  // Un reporte controlado conserva también la aprobación con la que arrancó el
  // trabajo, así que el vecino ve el recorrido completo: aprobado y luego
  // controlado.
  const control = reporte.revision?.controles?.[0];

  const gestion = {};

  if (esAprobada(estado) || estado === 'Controlado') {
    gestion.aprobacion = {
      cuadrilla: reporte.revision.cuadrilla?.nombre ?? '',
      fechaAtencion: reporte.revision.fechaAtencion?.toISOString().slice(0, 10) ?? '',
      detalle: reporte.revision.descripcion ?? '',
      funcionario: reporte.revision.funcionario?.nombre ?? '',
      fecha: reporte.revision.fechaAtencion?.toISOString() ?? '',
    };
  }

  // El control viene de la tabla reporte_control, que es aparte de la revisión:
  // se creó con PUT /api/revisiones/:id y guarda el detalle y las fotos de
  // evidencia del cierre. Las rutas llegan como "controles/archivo.png" y el
  // frontend las convierte a direcciones con urlDeImagen.
  if (estado === 'Controlado' && control) {
    gestion.control = {
      detalle: control.descripcion ?? '',
      imagenes: control.imagenes?.map((imagen) => imagen.rutaDirectorio) ?? [],
      funcionario: control.funcionario?.nombre ?? '',
      fecha: control.fechaControl?.toISOString() ?? '',
    };
  }

  return Object.keys(gestion).length > 0 ? gestion : undefined;
};

const MAXIMO_FOTOS = 5;

// Traduce de la base a lo que entiende el frontend.
const aReporte = (reporte, { conVecino = false, idUsuario = null } = {}) => ({
  id: String(reporte.idReporte),
  nombre: reporte.titulo,
  sector: reporte.sector,
  categoria: reporte.categoria,
  estado: estadoDe(reporte),
  // Id de la revisión que lleva este reporte. Solo lo reciben el dueño del
  // reporte y los funcionarios, igual que nombreVecino y emailVecino: es la
  // llave que permite a la gestión municipal cerrar el trabajo con
  // PUT /api/revisiones/:id, así que no se expone en el mapa público ni en el
  // detalle de un visitante.
  //
  // Es null mientras el reporte no fue revisado. Por eso el chequeo es !== null
  // y no un String() directo: String(null) devuelve la cadena "null", que es
  // truthy, y el frontend acabaría pidiendo /revisiones/null. Se devuelve null
  // de verdad para que el frontend pueda distinguir "sin revisión" de "con
  // revisión 7" y no intente cerrar un reporte que todavía no se revisó.
  ...(conVecino && { idRevision: reporte.idRevision !== null ? String(reporte.idRevision) : null }),
  fecha: reporte.fechaCreacion?.toISOString().slice(0, 10) ?? '',
  riesgo: reporte.indiceRiesgo !== null ? Number(reporte.indiceRiesgo) : null,
  votos: reporte._count?.votos ?? 0,
  miVoto: Boolean(reporte.votos?.length),
  esMio: idUsuario !== null && reporte.idVecino === idUsuario,
  latitud: Number(reporte.latitud),
  longitud: Number(reporte.longitud),
  descripcion: reporte.descripcion ?? '',
  volumen: reporte.tamano,
  distanciaViviendas: categoriaDeDistancia(reporte.distanciaACasas),
  imagenes: reporte.imagenes?.map((imagen) => imagen.rutaDirectorio) ?? [],
  clima:
    reporte.climaTemperatura !== null
      ? {
        temperatura: Number(reporte.climaTemperatura),
        humedad: Number(reporte.climaHumedad ?? 0),
        viento: Number(reporte.climaViento ?? 0),
        condicion: reporte.climaCondicion ?? '',
      }
      : undefined,
  gestion: gestionDe(reporte),
  ...(conVecino
    ? { nombreVecino: reporte.vecino?.nombre, emailVecino: reporte.vecino?.email }
    : {}),
});

const incluirVotosDe = (idVecino) =>
  idVecino === null || idVecino === undefined
    ? {}
    : { votos: { where: { idVecino }, select: { idVoto: true } } };

const INCLUIR_DETALLE = {
  imagenes: { orderBy: { orden: 'asc' } },
  // Los controles cuelgan de la revisión, no del reporte: en el schema el
  // ReporteControl se relaciona con Revision por idRevision. Van take:1 porque
  // solo se muestra el más reciente.
  revision: {
    include: {
      funcionario: true,
      cuadrilla: true,
      controles: {
        take: 1,
        orderBy: { fechaControl: 'desc' },
        include: { imagenes: { orderBy: { idImagenControl: 'asc' } }, funcionario: true },
      },
    },
  },
  _count: { select: { votos: true } },
};

const MAXIMO_POR_PAGINA = 300;

const listar = async ({ sector, categoria, estado, idVecino = null }) => {
  const reportes = await prisma.reporte.findMany({
    where: {
      ...(sector ? { sector } : {}),
      ...(categoria ? { categoria } : {}),
    },
    include: { ...INCLUIR_DETALLE, ...incluirVotosDe(idVecino) },
    orderBy: { fechaCreacion: 'desc' },
    take: MAXIMO_POR_PAGINA,
  });

  const conEstado = reportes.map((reporte) => ({ ...reporte, estado: estadoDe(reporte) }));

  const visibles = conEstado.filter((reporte) => {
    if (estado && reporte.estado !== estado) return false;
    if (reporte.estado === 'Rechazado') return false;
    if (reporte.estado === 'Controlado') {
      const antiguedad = Date.now() - new Date(reporte.fechaCreacion ?? 0).getTime();
      return antiguedad < UN_MES;
    }
    return true;
  });

  return visibles.map((reporte) => aReporteVisible(reporte, { idUsuario: idVecino }));
};

const obtenerDetalle = async (idReporte, { idUsuario = null, rol = null } = {}) => {
  const reporte = await prisma.reporte.findUnique({
    where: { idReporte },
    include: { ...INCLUIR_DETALLE, ...incluirVotosDe(idUsuario), vecino: true },
  });

  if (!reporte) throw noEncontrado();

  // Los datos del vecino solo se muestran a quien lo creó o a los funcionarios.
  // Para cualquiera más, el reporte es anónimo.
  const esDueño = idUsuario !== null && reporte.idVecino === idUsuario;
  const conVecino = esDueño || rol === 'funcionario';

  return aReporteVisible(reporte, { conVecino, idUsuario });
};

const obtenerPorId = async (idReporte) => {
  const reporte = await prisma.reporte.findUnique({ where: { idReporte } });
  if (!reporte) throw noEncontrado();
  return reporte;
};

const listarMios = async (idVecino) => {
  const reportes = await prisma.reporte.findMany({
    where: { idVecino },
    include: INCLUIR_DETALLE,
    orderBy: { fechaCreacion: 'desc' },
  });

  return reportes.map((reporte) => aReporte(reporte, { idUsuario: idVecino }));
};

// Antes de crear, se revisa si ya hay un reporte parecido muy cerca.
// Se usa una caja de 50 metros, que es suficiente para no tapar
// dos reportes del mismo microbasural.
const CERCANIA_METROS = 50;
const METROS_POR_GRADO = 111320;

// Un grado de longitud no mide lo mismo que uno de latitud: a 33° de latitud
// un grado de longitud son unos 93 km, contra los 111 km de un
// grado de latitud.Sin esta corrección, la caja en realidad es de unos 55 m
// en una dirección y 50 en la otra, y el filtro deja escapar duplicados.
const gradosLongitud = (latitud) =>
  CERCANIA_METROS / (METROS_POR_GRADO * Math.cos((latitud * Math.PI) / 180));

const buscarParecido = async ({ latitud, longitud, categoria }) => {
  const diferenciaLatitud = CERCANIA_METROS / METROS_POR_GRADO;
  const diferenciaLongitud = gradosLongitud(latitud);

  return prisma.reporte.findFirst({
    where: {
      categoria,
      latitud: { gte: latitud - diferenciaLatitud, lte: latitud + diferenciaLatitud },
      longitud: { gte: longitud - diferenciaLongitud, lte: longitud + diferenciaLongitud },
    },
    select: { idReporte: true, titulo: true },
  });
};

// Crea un reporte con sus fotos.
const crear = async ({ idVecino, datos, fotos }) => {
  try {
    const antecedente = await buscarParecido(datos);

    if (antecedente) {
      const error = new Error('Ya existe un antecedente previo de este reporte');
      error.estado = 409;
      error.detalle = antecedente;
      throw error;
    }

    // El clima lo consulta el backend en Open-Meteo, no se toma del formulario.
    // Si Open-Meteo falla, el reporte se guarda igual, sin clima.
    const clima = await climaService.obtenerClima(datos.latitud, datos.longitud);

    const reporte = await prisma.reporte.create({
      data: {
        titulo: datos.nombre.trim(),
        descripcion: datos.descripcion?.trim() || null,
        categoria: datos.categoria,
        tamano: datos.volumen,
        sector: datos.sector,
        latitud: datos.latitud,
        longitud: datos.longitud,
        distanciaACasas: metrosDeDistancia(datos.distanciaViviendas),
        indiceRiesgo: datos.riesgo,
        climaTemperatura: clima?.temperatura ?? null,
        climaHumedad: clima?.humedad ?? null,
        climaViento: clima?.viento ?? null,
        climaCondicion: clima?.condicion ?? null,
        idVecino,
        imagenes: {
          create: fotos.map((foto, indice) => ({
            rutaDirectorio: foto.ruta,
            orden: indice + 1,
          })),
        },
      },
      include: INCLUIR_DETALLE,
    });

    return aReporte(reporte);
  } catch (error) {
    borrarFotosDelDisco(fotos);
    throw error;
  }
};

// Modificar solo lo puede quien lo creó, y solo mientras el funcionario no lo
// haya tocado.
const modificar = async ({ idReporte, idVecino, cambios, fotosNuevas = [], rutasConservadas }) => {
  const reporte = await obtenerPorId(idReporte);

  if (reporte.idVecino !== idVecino) {
    const error = new Error('No puedes modificar un reporte que no es tuyo');
    error.estado = 403;
    throw error;
  }

  if (reporte.idRevision !== null) {
    const error = new Error('Este reporte ya fue revisado y no se puede modificar');
    error.estado = 400;
    throw error;
  }

  const imagenesActuales = await prisma.imagenReporte.findMany({
    where: { idReporte },
    orderBy: { orden: 'asc' },
  });

  const tocarImagenes =
    Array.isArray(rutasConservadas) || (fotosNuevas && fotosNuevas.length > 0);

  if (tocarImagenes) {
    const conservadas = Array.isArray(rutasConservadas) ? rutasConservadas : [];

    if (conservadas.length + fotosNuevas.length === 0) {
      const error = new Error('El reporte necesita al menos una foto de portada');
      error.estado = 400;
      throw error;
    }

    if (conservadas.length + fotosNuevas.length > MAXIMO_FOTOS) {
      const error = new Error(`Un reporte puede tener máximo ${MAXIMO_FOTOS} fotos`);
      error.estado = 400;
      throw error;
    }

    const rutasConocidas = new Set(imagenesActuales.map((imagen) => imagen.rutaDirectorio));
    const desconocidas = conservadas.filter((ruta) => !rutasConocidas.has(ruta));

    if (desconocidas.length > 0) {
      const error = new Error('La lista de fotos no corresponde a este reporte');
      error.estado = 400;
      throw error;
    }
  }

  try {
    const _actualizado = await prisma.reporte.update({
      where: { idReporte },
      data: {
        ...(cambios.nombre !== undefined && { titulo: cambios.nombre.trim() }),
        ...(cambios.descripcion !== undefined && { descripcion: cambios.descripcion || null }),
        ...(cambios.categoria !== undefined && { categoria: cambios.categoria }),
        ...(cambios.volumen !== undefined && { tamano: cambios.volumen }),
        ...(cambios.sector !== undefined && { sector: cambios.sector }),
        ...(cambios.latitud !== undefined && { latitud: cambios.latitud }),
        ...(cambios.longitud !== undefined && { longitud: cambios.longitud }),
        ...(cambios.distanciaViviendas !== undefined && {
          distanciaACasas: metrosDeDistancia(cambios.distanciaViviendas),
        }),
      },
      include: INCLUIR_DETALLE,
    });

    if (tocarImagenes) {
      await reorganizarImagenes({ idReporte, imagenesActuales, rutasConservadas, fotosNuevas });
    }

    const conFotos = await prisma.reporte.findUnique({
      where: { idReporte },
      include: INCLUIR_DETALLE,
    });

    return aReporte(conFotos);
  } catch (error) {
    borrarFotosDelDisco(fotosNuevas); // si algo falla, se borran las fotos procesadas
    throw error;
  }
};

// Organiza las fotos siguiendo el orden del frontend
const reorganizarImagenes = async ({ idReporte, imagenesActuales, rutasConservadas, fotosNuevas }) => {
  const porRuta = new Map(imagenesActuales.map((imagen) => [imagen.rutaDirectorio, imagen]));
  const conservadas = (rutasConservadas ?? []).map((ruta) => porRuta.get(ruta)).filter(Boolean);

  const quitadas = imagenesActuales.filter(
    (imagen) => !rutasConservadas?.includes(imagen.rutaDirectorio),
  );

  if (quitadas.length > 0) {
    await prisma.imagenReporte.deleteMany({
      where: { idReporte, idImagenReporte: { in: quitadas.map((imagen) => imagen.idImagenReporte) } },
    });
    borrarFotosDelDisco(quitadas.map((imagen) => ({ ruta: imagen.rutaDirectorio })));
  }

  const ordenFinal = [
    ...conservadas,
    ...fotosNuevas.map((foto) => ({ rutaDirectorio: foto.ruta, idImagenReporte: null })),
  ];

  await Promise.all(
    ordenFinal.map((imagen, indice) =>
      prisma.imagenReporte.upsert({
        where: { idImagenReporte: imagen.idImagenReporte ?? -1 },
        create: { idReporte, rutaDirectorio: imagen.rutaDirectorio, orden: indice + 1 },
        update: { orden: indice + 1 },
      }),
    ),
  );
};

const eliminar = async ({ idReporte, idVecino }) => {
  const reporte = await obtenerPorId(idReporte);

  if (reporte.idVecino !== idVecino) {
    const error = new Error('No puedes eliminar un reporte que no es tuyo');
    error.estado = 403;
    throw error;
  }

  if (reporte.idRevision !== null) {
    const error = new Error('Este reporte ya fue revisado y no se puede eliminar');
    error.estado = 400;
    throw error;
  }

  const imagenes = await prisma.imagenReporte.findMany({
    where: { idReporte },
    select: { rutaDirectorio: true },
  });

  await prisma.reporte.delete({ where: { idReporte } });

  borrarFotosDelDisco(imagenes.map((imagen) => ({ ruta: imagen.rutaDirectorio })));
};

const noEncontrado = () => {
  const error = new Error('El reporte no existe');
  error.estado = 404;
  return error;
};

module.exports = {
  listar,
  obtenerDetalle,
  obtenerPorId,
  listarMios,
  crear,
  modificar,
  eliminar,
};
