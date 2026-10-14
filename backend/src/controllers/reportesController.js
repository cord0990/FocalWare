const reportesService = require('../services/reportesService');

const numero = (valor) => (valor === undefined || valor === null || valor === '' ? null : Number(valor));

// Tope de las columnas en la base.
const MAXIMO_TITULO = 150;
const MAXIMO_SECTOR = 100;

const DISTANCIAS_VALIDAS = [
  'Menos de 10 m',
  'Entre 10 y 50 m',
  'Entre 50 y 100 m',
  'Más de 100 m',
];

// Revisa que el reporte tenga sentido antes de guardarlo.
const problemaDelReporte = (datos) => {
  const { nombre, categoria, volumen, sector, latitud, longitud, distanciaViviendas, riesgo } = datos;

  const texto = (valor) => String(valor ?? '').trim();

  if (!texto(nombre)) return 'El reporte necesita un título.';
  if (texto(nombre).length > MAXIMO_TITULO) {
    return `El título puede tener máximo ${MAXIMO_TITULO} caracteres.`;
  }
  if (!texto(categoria)) return 'Elige una categoría.';
  if (!texto(volumen)) return 'Elige el volumen estimado.';
  if (!texto(sector)) return 'Escribe el sector o la dirección aproximada.';
  if (texto(sector).length > MAXIMO_SECTOR) {
    return `El sector puede tener máximo ${MAXIMO_SECTOR} caracteres.`;
  }

  if (!Number.isFinite(latitud) || latitud < -90 || latitud > 90) {
    return 'La latitud no es válida.';
  }
  if (!Number.isFinite(longitud) || longitud < -180 || longitud > 180) {
    return 'La longitud no es válida.';
  }

  if (distanciaViviendas && !DISTANCIAS_VALIDAS.includes(distanciaViviendas)) {
    return 'La distancia a las viviendas no es válida.';
  }

  if (riesgo !== null && riesgo !== undefined && (!Number.isFinite(riesgo) || riesgo < 0 || riesgo > 100)) {
    return 'El índice de riesgo debe estar entre 0 y 100.';
  }

  return null;
};

// lista reportes para el mapa.
const listar = async (req, res, next) => {
  try {
    const { sector, categoria, estado } = req.query;

    // El id del vecino viene del token, si es que vino.
    // Se usa para responder `miVoto` en cada reporte (si ya lo apoyan),
    // sin romper el anonimato.
    const reportes = await reportesService.listar({
      sector,
      categoria,
      estado,
      idVecino: req.usuario?.rol === 'vecino' ? req.usuario.id : null,
    });

    res.json({ ok: true, data: { reportes } });
  } catch (error) {
    next(error);
  }
};

// los reportes del vecino que inició sesión.
const listarMios = async (req, res, next) => {
  try {
    const reportes = await reportesService.listarMios(req.usuario.id);

    res.json({ ok: true, data: { reportes } });
  } catch (error) {
    next(error);
  }
};

// el dueño y los funcionarios ven también quién hizo el reporte.
const obtenerDetalle = async (req, res, next) => {
  try {
    const idReporte = Number(req.params.id);

    if (!Number.isInteger(idReporte)) {
      return res.status(400).json({ ok: false, error: 'El número de reporte no es válido' });
    }

    // El id y el rol salen del token, si es que vino.
    const reporte = await reportesService.obtenerDetalle(idReporte, {
      idUsuario: req.usuario?.id ?? null,
      rol: req.usuario?.rol ?? null,
    });

    res.json({ ok: true, data: { reporte } });
  } catch (error) {
    next(error);
  }
};

// crea un reporte con hasta 5 fotos.
const crear = async (req, res, next) => {
  try {
    const {
      nombre,
      descripcion,
      categoria,
      volumen,
      sector,
      latitud,
      longitud,
      distanciaViviendas,
      riesgo,
      clima,
    } = req.body;

    // multer deja los archivos en req.files y su nombre ya es la ruta relativa.
    const fotos = (req.files ?? []).map((archivo) => ({
      ruta: `reportes/${archivo.filename}`,
    }));

    const datos = {
      nombre: String(nombre ?? '').trim(),
      descripcion: String(descripcion ?? '').trim(),
      categoria: String(categoria ?? '').trim(),
      volumen: String(volumen ?? '').trim(),
      sector: String(sector ?? '').trim(),
      latitud: Number(latitud),
      longitud: Number(longitud),
      distanciaViviendas,
      riesgo: numero(riesgo),
      clima,
    };

    const problema = problemaDelReporte(datos);

    if (problema) {
      return res.status(400).json({ ok: false, error: problema });
    }

    const reporte = await reportesService.crear({
      idVecino: req.usuario.id,
      datos,
      fotos,
    });

    res.status(201).json({ ok: true, data: { reporte } });
  } catch (error) {
    next(error);
  }
};

const modificar = async (req, res, next) => {
  try {
    const idReporte = Number(req.params.id);

    if (!Number.isInteger(idReporte)) {
      return res.status(400).json({ ok: false, error: 'El número de reporte no es válido' });
    }

    const { nombre, categoria, volumen, sector, latitud, longitud, distanciaViviendas, riesgo } =
      req.body;

    const problemas = [];

    const texto = (valor) => String(valor ?? '').trim();

    if (nombre !== undefined) {
      if (!texto(nombre)) problemas.push('El título no puede quedar vacío.');
      else if (texto(nombre).length > MAXIMO_TITULO) {
        problemas.push(`El título puede tener máximo ${MAXIMO_TITULO} caracteres.`);
      }
    }

    if (categoria !== undefined && !texto(categoria)) {
      problemas.push('La categoría no puede quedar vacía.');
    }
    if (volumen !== undefined && !texto(volumen)) {
      problemas.push('El volumen no puede quedar vacío.');
    }
    if (sector !== undefined) {
      if (!texto(sector)) problemas.push('El sector no puede quedar vacío.');
      else if (texto(sector).length > MAXIMO_SECTOR) {
        problemas.push(`El sector puede tener máximo ${MAXIMO_SECTOR} caracteres.`);
      }
    }

    if (
      latitud !== undefined &&
      (!Number.isFinite(Number(latitud)) || Number(latitud) < -90 || Number(latitud) > 90)
    ) {
      problemas.push('La latitud no es válida.');
    }
    if (
      longitud !== undefined &&
      (!Number.isFinite(Number(longitud)) || Number(longitud) < -180 || Number(longitud) > 180)
    ) {
      problemas.push('La longitud no es válida.');
    }

    if (
      distanciaViviendas !== undefined &&
      distanciaViviendas !== '' &&
      !DISTANCIAS_VALIDAS.includes(distanciaViviendas)
    ) {
      problemas.push('La distancia a las viviendas no es válida.');
    }

    if (
      riesgo !== undefined &&
      riesgo !== null &&
      riesgo !== '' &&
      (!Number.isFinite(Number(riesgo)) || Number(riesgo) < 0 || Number(riesgo) > 100)
    ) {
      problemas.push('El índice de riesgo debe estar entre 0 y 100.');
    }

    if (problemas.length > 0) {
      return res.status(400).json({ ok: false, error: problemas.join(' ') });
    }

    // Las rutas que quedan se mandan como un JSON string dentro del form.
    let rutasConservadas;
    if (req.body.imagenesActuales !== undefined) {
      try {
        rutasConservadas = JSON.parse(req.body.imagenesActuales);
      } catch {
        return res.status(400).json({ ok: false, error: 'No se entendió la lista de fotos' });
      }
      if (!Array.isArray(rutasConservadas)) {
        return res.status(400).json({ ok: false, error: 'No se entendió la lista de fotos' });
      }
    }

    const fotosNuevas = (req.files ?? []).map((archivo) => ({ ruta: `reportes/${archivo.filename}` }));

    const reporte = await reportesService.modificar({
      idReporte,
      idVecino: req.usuario.id,
      cambios: {
        ...(nombre !== undefined && { nombre: String(nombre).trim() }),
        ...(req.body.descripcion !== undefined && { descripcion: req.body.descripcion }),
        ...(categoria !== undefined && { categoria }),
        ...(volumen !== undefined && { volumen }),
        ...(sector !== undefined && { sector: String(sector).trim() }),
        ...(latitud !== undefined && { latitud: Number(latitud) }),
        ...(longitud !== undefined && { longitud: Number(longitud) }),
        ...(distanciaViviendas !== undefined && { distanciaViviendas }),
      },
      fotosNuevas,
      rutasConservadas,
    });

    res.json({ ok: true, data: { reporte } });
  } catch (error) {
    next(error);
  }
};

const eliminar = async (req, res, next) => {
  try {
    const idReporte = Number(req.params.id);

    if (!Number.isInteger(idReporte)) {
      return res.status(400).json({ ok: false, error: 'El número de reporte no es válido' });
    }

    await reportesService.eliminar({ idReporte, idVecino: req.usuario.id });

    res.json({ ok: true, data: { eliminado: true } });
  } catch (error) {
    next(error);
  }
};

module.exports = { listar, listarMios, obtenerDetalle, crear, modificar, eliminar };
