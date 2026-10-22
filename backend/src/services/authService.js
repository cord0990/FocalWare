// Lógica de las cuentas: registro, inicio de sesión, perfil y contraseña.
const crypto = require('crypto');
const { vecinos, funcionarios } = require('../../dist/db/index.js');
const { hashearPassword, compararPassword, generarToken } = require('./seguridadService');

// Los funcionarios los crea la plataforma con el dominio institucional.
const DOMINIO_INSTITUCIONAL = 'focalware.cl';

// Códigos de recuperación en memoria. Para este
// el código se imprime en la consola del backend.
// Si el servidor se reinicia, el código se pierde y hay que solicitar uno nuevo.
const codigosRecuperacion = new Map();
const DURACION_CODIGO_MS = 10 * 60 * 1000;
const MAX_INTENTOS_CODIGO = 5;
const MENSAJE_RECUPERACION =
  'Si el correo está registrado, enviamos un código de recuperación';

const crearError = (estado, mensaje) => {
  const error = new Error(mensaje);
  error.estado = estado;
  return error;
};

const normalizarEmail = (email) => email.trim().toLowerCase();

const esCorreoInstitucional = (email) =>
  email.trim().toLowerCase().endsWith(`@${DOMINIO_INSTITUCIONAL}`);

const datosUsuario = (persona, rol, cuadrillas = []) => ({
  id: persona.idVecino ?? persona.idFuncionario,
  nombre: persona.nombre,
  email: persona.email,
  telefono: persona.telefono ?? undefined,
  rol,
  ...(rol === 'funcionario' ? { cuadrillas } : {}),
  //Logica: Si el usuario es funcionario, se agregan las cuadrillas a las que pertenece. Si es vecino, no se agrega nada.
});

// Crea una cuenta de vecino. La contraseña se guarda hasheada.
const registrarVecino = async ({ nombre, email, password }) => {
  const correo = email.trim().toLowerCase();

  if (esCorreoInstitucional(correo)) {
    const error = new Error(
      'Las cuentas de funcionario las entrega la administración. Inicia sesión con tu cuenta.',
    );
    error.estado = 400;
    throw error;
  }

  // El UNIQUE de la base es por tabla, así que se revisa en las dos: si un
  // funcionario ya tiene ese correo, tampoco se puede crear un vecino con él.
  const [existeVecino, existeFuncionario] = await Promise.all([
    vecinos.obtenerVecinoPorEmail(correo),
    funcionarios.obtenerFuncionarioPorEmail(correo),
  ]);

  if (existeVecino || existeFuncionario) {
    const error = new Error('Ya existe una cuenta con ese correo');
    error.estado = 409;
    throw error;
  }

  const vecino = await vecinos.crearVecino({
    nombre: nombre.trim(),
    email: correo,
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
    const cuadrillas = (await vecinos.listarCuadrillasDeFuncionario(funcionario.idFuncionario))
      .map((cuadrilla) => cuadrilla.nombre);
    return {
      token: generarToken(funcionario.idFuncionario, 'funcionario'),
      usuario: datosUsuario(funcionario, 'funcionario', cuadrillas),
    };
  }

  throw credencialesIncorrectas();
};

// Devuelve los datos de quien inició sesión. El id y el rol salen del token.
const obtenerPerfil = async ({ id, rol }) => {
  if (rol === 'funcionario') {
    const funcionario = await funcionarios.obtenerFuncionarioPorId(id);
    if (!funcionario) return null;
    const cuadrillas = (await vecinos.listarCuadrillasDeFuncionario(id))
      .map((cuadrilla) => cuadrilla.nombre);
    return datosUsuario(funcionario, 'funcionario', cuadrillas);
  }

  const vecino = await vecinos.obtenerVecinoPorId(id);
  return vecino ? datosUsuario(vecino, 'vecino') : null;
};

// Cambia la contraseña de quien inició sesión.
// La contraseña actual se pide igual,
const cambiarPassword = async ({ id, rol, passwordActual, passwordNueva }) => {
  const persona =
    rol === 'funcionario'
      ? await funcionarios.obtenerFuncionarioPorId(id)
      : await vecinos.obtenerVecinoPorId(id);

  if (!persona) throw crearError(404, 'El usuario ya no existe');

  if (!(await compararPassword(passwordActual, persona.passwordHash))) {
    throw crearError(400, 'La contraseña actual no es correcta');
  }

  if (await compararPassword(passwordNueva, persona.passwordHash)) {
    throw crearError(400, 'La nueva contraseña debe ser distinta a la actual');
  }

  const passwordHash = await hashearPassword(passwordNueva);

  if (rol === 'funcionario') {
    await funcionarios.actualizarFuncionario(id, { passwordHash });
  } else {
    await vecinos.actualizarVecino(id, { passwordHash });
  }

  return { mensaje: 'Contraseña actualizada' };
};

// Actualiza nombre y correo del usuario.
// El correo es único entre vecinos y funcionarios, igual que en el registro.
const actualizarPerfil = async ({ id, rol, nombre, email }) => {
  const correo = normalizarEmail(email);

  if (rol === 'funcionario' && !esCorreoInstitucional(correo)) {
    throw crearError(400, 'Los funcionarios deben usar un correo @focalware.cl');
  }

  if (rol === 'vecino' && esCorreoInstitucional(correo)) {
    throw crearError(400, 'Los vecinos no pueden usar un correo @focalware.cl');
  }

  const [existeVecino, existeFuncionario] = await Promise.all([
    vecinos.obtenerVecinoPorEmail(correo),
    funcionarios.obtenerFuncionarioPorEmail(correo),
  ]);

  const esOtroVecino =
    existeVecino && !(rol === 'vecino' && existeVecino.idVecino === id);
  const esOtroFuncionario =
    existeFuncionario && !(rol === 'funcionario' && existeFuncionario.idFuncionario === id);

  if (esOtroVecino || esOtroFuncionario) {
    throw crearError(409, 'Ya existe una cuenta con ese correo');
  }

  const datos = { nombre: nombre.trim(), email: correo };

  if (rol === 'funcionario') {
    await funcionarios.actualizarFuncionario(id, datos);
  } else {
    await vecinos.actualizarVecino(id, datos);
  }

  return obtenerPerfil({ id, rol });
};

// Genera un código de 6 dígitos y lo imprime en la consola del backend.
// La respuesta es siempre la misma, exista o no el correo,
// para no revelar qué cuentas están registradas.
const solicitarCodigoRecuperacion = async ({ email }) => {
  const correo = normalizarEmail(email);
  const vecino = await vecinos.obtenerVecinoPorEmail(correo);
  const funcionario = vecino
    ? null
    : await funcionarios.obtenerFuncionarioPorEmail(correo);

  if (!vecino && !funcionario) {
    return { mensaje: MENSAJE_RECUPERACION };
  }

  const codigo = crypto.randomInt(0, 1000000).toString().padStart(6, '0');

  codigosRecuperacion.set(correo, {
    id: vecino ? vecino.idVecino : funcionario.idFuncionario,
    rol: vecino ? 'vecino' : 'funcionario',
    codigoHash: await hashearPassword(codigo),
    expiraEn: Date.now() + DURACION_CODIGO_MS,
    intentos: 0,
  });

  console.log(`\n[RECUPERACIÓN] Código para ${correo}: ${codigo}\n`);

  return { mensaje: MENSAJE_RECUPERACION };
};

// Revisa un código activo y suma un intento fallido.
// Devuelve la entrada guardada para que el restablecimiento pueda actualizar a la persona correcta.
const revisarCodigoRecuperacion = async (correo, codigo) => {
  const entrada = codigosRecuperacion.get(correo);

  if (!entrada) {
    throw crearError(400, 'El código no es válido o expiró');
  }

  if (entrada.expiraEn < Date.now() || entrada.intentos >= MAX_INTENTOS_CODIGO) {
    codigosRecuperacion.delete(correo);
    throw crearError(400, 'El código no es válido o expiró');
  }

  if (!(await compararPassword(codigo, entrada.codigoHash))) {
    entrada.intentos += 1;

    if (entrada.intentos >= MAX_INTENTOS_CODIGO) {
      codigosRecuperacion.delete(correo);
    }

    throw crearError(400, 'El código no es válido o expiró');
  }

  return entrada;
};

const verificarCodigoRecuperacion = async ({ email, codigo }) => {
  await revisarCodigoRecuperacion(normalizarEmail(email), codigo);
  return { valido: true };
};

const restablecerPassword = async ({ email, codigo, passwordNueva }) => {
  const correo = normalizarEmail(email);
  const entrada = await revisarCodigoRecuperacion(correo, codigo);
  const passwordHash = await hashearPassword(passwordNueva);

  if (entrada.rol === 'funcionario') {
    const funcionario = await funcionarios.obtenerFuncionarioPorId(entrada.id);
    if (!funcionario) throw crearError(404, 'El usuario ya no existe');
    await funcionarios.actualizarFuncionario(entrada.id, { passwordHash });
  } else {
    const vecino = await vecinos.obtenerVecinoPorId(entrada.id);
    if (!vecino) throw crearError(404, 'El usuario ya no existe');
    await vecinos.actualizarVecino(entrada.id, { passwordHash });
  }

  codigosRecuperacion.delete(correo);
  return { mensaje: 'Contraseña actualizada' };
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
  cambiarPassword,
  actualizarPerfil,
  solicitarCodigoRecuperacion,
  verificarCodigoRecuperacion,
  restablecerPassword,
  esCorreoInstitucional,
  DOMINIO_INSTITUCIONAL,
};
