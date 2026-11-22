const { catalogoSectores } = require('../dominio/sectores');

// Catálogo público que usa el frontend para el filtro, el formulario y el mapa.
const listar = (req, res) => {
  res.json({ ok: true, data: catalogoSectores() });
};

module.exports = { listar };
