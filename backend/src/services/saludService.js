// Usa Prisma (src/db). Requiere que se haya ejecutado: `npm run build`.
// para que exista dist/.
const { verificarConexion } = require('../../dist/db/index.js');

// Consulta simple para validar la existencia de la BD
const revisarBaseDeDatos = async () => {
  return verificarConexion();
};

module.exports = { revisarBaseDeDatos };
