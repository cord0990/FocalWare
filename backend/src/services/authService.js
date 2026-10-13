// Lógica de las cuentas: registro, inicio de sesión y perfil.
const { vecinos, funcionarios } = require('../../dist/db/index.js');
const { hashearPassword, compararPassword, generarToken } = require('./seguridadService');

// Los funcionarios los crea la plataforma con el dominio institucional.
const DOMINIO_INSTITUCIONAL = 'focalware.cl';

const esCorreoInstitucional = (email) =>
  email.trim().toLowerCase().endsWith(`@${DOMINIO_INSTITUCIONAL}`);

const datosUsuario = (persona, rol) => ({
  id: persona.idVecino ?? persona.idFuncionario,
  nombre: persona.nombre,
  email: persona.email,
  telefono: persona.telefono ?? undefined,
  rol,
});

// Crea una cuenta de vecino. La contraseña se guarda hasheada.
const registrarVecino = async ({ nombre, email, password }) => {
  const existente = await vecinos.obtenerVecinoPorEmail(email);

  if (existente) {
    const error = new Error('Ya existe una cuenta con ese correo');
    error.estado = 409;
    throw error;
  }

  if (esCorreoInstitucional(email)) {
    const error = new Error(
      'Las cuentas de funcionario las entrega la administración. Inicia sesión con tu cuenta.',
    );
    error.estado = 400;
    throw error;
  }

  const vecino = await vecinos.crearVecino({
    nombre: nombre.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: await hashearPassword(password),
  });

  return {
    token: generarToken(vecino.idVecino, 'vecino'),
    usuario: datosUsuario(vecino, 'vecino'),
  };
};

// Busca el correo primero en vecinos y después en funcionarios, para saber el rol.
// El mismo mensaje para correo inexistente y contraseña incorrecta, para no
// revelar qué correos están registrados.
const iniciarSesion = async ({ email, password }) => {
  const correo = email.trim().toLowerCase();
  const vecino = await vecinos.obtenerVecinoPorEmail(correo);

  if (vecino) {
    if (await compararPassword(password, vecino.passwordHash)) {
      return {
        token: generarToken(vecino.idVecino, 'vecino'),
        usuario: datosUsuario(vecino, 'vecino'),
      };
    }
    throw credencialesIncorrectas();
  }

  const funcionario = await funcionarios.obtenerFuncionarioPorEmail(correo);

  if (funcionario && (await compararPassword(password, funcionario.passwordHash))) {
    return {
      token: generarToken(funcionario.idFuncionario, 'funcionario'),
      usuario: datosUsuario(funcionario, 'funcionario'),
    };
  }

  throw credencialesIncorrectas();
};

// Devuelve los datos de quien inició sesión. El id y el rol salen del token.
const obtenerPerfil = async ({ id, rol }) => {
  if (rol === 'funcionario') {
    const funcionario = await funcionarios.obtenerFuncionarioPorId(id);
    return funcionario ? datosUsuario(funcionario, 'funcionario') : null;
  }

  const vecino = await vecinos.obtenerVecinoPorId(id);
  return vecino ? datosUsuario(vecino, 'vecino') : null;
};

const credencialesIncorrectas = () => {
  const error = new Error('Correo o contraseña incorrectos');
  error.estado = 401;
  return error;
};

module.exports = {
  registrarVecino,
  iniciarSesion,
  obtenerPerfil,
  esCorreoInstitucional,
  DOMINIO_INSTITUCIONAL,
};
