const pool = require('../db/conexion');

// Hace una consulta simple para saber si la base de datos responde.
const revisarBaseDeDatos = async () => {
  const resultado = await pool.query('SELECT NOW() AS hora');
  return resultado.rows[0].hora;
};

module.exports = { revisarBaseDeDatos };
