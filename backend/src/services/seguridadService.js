const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Cantidad de rondas de bcrypt, mínimo 10 (RNF-04)
const RONDAS = 10;

// Saca el hash de la contraseña para guardarlo en Password_Hash.
// Es de un solo sentido: desde el hash no se puede volver a la contraseña.
const hashearPassword = async (password) => {
  return bcrypt.hash(password, RONDAS);
};

// Revisa si la contraseña que escribió el usuario coincide con el hash guardado
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

module.exports = { hashearPassword, compararPassword, generarToken };
