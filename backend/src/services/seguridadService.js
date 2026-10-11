const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Cantidad de rondas de bcrypt, mínimo 10 (RNF-04)
const RONDAS = 10;

// Transforma la contraseña en un texto que no se puede leer, para guardarlo en Password_Hash
const encriptarPassword = async (password) => {
  return bcrypt.hash(password, RONDAS);
};

// Revisa si la contraseña que escribió el usuario coincide con la guardada
const compararPassword = async (password, passwordHash) => {
  return bcrypt.compare(password, passwordHash);
};

// Crea el token que recibe el usuario al iniciar sesión.
// Solo guarda el id y el rol, nunca datos personales.
const generarToken = (id, rol) => {
  return jwt.sign({ id, rol }, process.env.JWT_SECRETO, {
    expiresIn: process.env.JWT_EXPIRACION || '15m',
  });
};

module.exports = { encriptarPassword, compararPassword, generarToken };
