// Recibe los votos de apoyo y se los pasa al service. Acá no se toca la base.
const votosService = require('../services/votosService');

// El id del reporte viaja en la ruta, así que se valida antes de buscar.
const idDeReporte = (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ ok: false, error: 'El número de reporte no es válido' });
    return null;
  }

  return id;
};

const apoyar = async (req, res, next) => {
  try {
    const idReporte = idDeReporte(req, res);
    if (idReporte === null) return;

    // Solo los vecinos votan
    const resultado = await votosService.registrar({
      idReporte,
      idVecino: req.usuario.id,
    });

    res.status(201).json({ ok: true, data: resultado });
  } catch (error) {
    next(error);
  }
};

const quitar = async (req, res, next) => {
  try {
    const idReporte = idDeReporte(req, res);
    if (idReporte === null) return;

    const resultado = await votosService.quitar({
      idReporte,
      idVecino: req.usuario.id,
    });

    res.json({ ok: true, data: resultado });
  } catch (error) {
    next(error);
  }
};

module.exports = { apoyar, quitar };
