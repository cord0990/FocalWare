// Inicio de sesión, registro, perfil y contraseña contra la API REST.
import { pedir, ErrorApi } from './api';
import type { Usuario } from './sesionService';

// Lo que se escribe en los formularios. Llevan la contraseña, que nunca se guarda en el Usuario.
export type DatosLogin = { email: string; password: string };

export type DatosRegistro = { nombre: string; email: string; telefono?: string; password: string };

export interface DatosNuevaContrasena {
  correo: string;
  codigo: string;
  contrasena: string;
}

export interface DatosCambioContrasena {
  passwordActual: string;
  passwordNueva: string;
}

export interface DatosPerfil {
  nombre: string;
  email: string;
}

interface UsuarioApi {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  rol: 'vecino' | 'funcionario';
  cuadrillas?: string[];
}

interface RespuestaAuthApi {
  token: string;
  usuario: UsuarioApi;
}

interface RespuestaAuth {
  token: string;
  usuario: Usuario;
}

export const DOMINIO_INSTITUCIONAL = 'focalware.cl';
const esCorreoInstitucional = (email: string) =>
  email.trim().toLowerCase().endsWith(`@${DOMINIO_INSTITUCIONAL}`);

export const esInstitucional = esCorreoInstitucional;

const normalizar = (email: string) => email.trim().toLowerCase();

const aUsuario = (usuario: UsuarioApi): Usuario => {
  const { email, ...resto } = usuario;
  return { ...resto, correo: email };
};

export const iniciarSesion = async (datos: DatosLogin): Promise<RespuestaAuth> => {
  const respuesta = await pedir<RespuestaAuthApi>('/auth/login', {
    metodo: 'POST',
    autenticado: false,
    cuerpo: { email: normalizar(datos.email), password: datos.password },
  });

  return { token: respuesta.token, usuario: aUsuario(respuesta.usuario) };
};

// Crea una cuenta de Vecino.
export const registrarUsuario = async (datos: DatosRegistro): Promise<RespuestaAuth> => {
  const respuesta = await pedir<RespuestaAuthApi>('/auth/registro', {
    metodo: 'POST',
    autenticado: false,
    cuerpo: {
      nombre: datos.nombre.trim(),
      email: normalizar(datos.email),
      telefono: datos.telefono ?? undefined,
      password: datos.password,
    },
  });

  return { token: respuesta.token, usuario: aUsuario(respuesta.usuario) };
};

// Revisa que el token guardado siga siendo válido.
// Si expiró, la sesión se limpia y hay que volver a iniciar sesión.
export const revisarSesion = async (): Promise<Usuario | null> => {
  try {
    const datos = await pedir<{ usuario: UsuarioApi }>('/auth/perfil');
    return aUsuario(datos.usuario);
  } catch (error) {
    if (error instanceof ErrorApi && error.estado === 401) return null;
    throw error;
  }
};

// Guarda el nombre y el correo del usuario con sesión.
export const actualizarPerfil = async (datos: DatosPerfil): Promise<Usuario> => {
  const respuesta = await pedir<{ usuario: UsuarioApi }>('/auth/perfil', {
    metodo: 'PUT',
    cuerpo: {
      nombre: datos.nombre.trim(),
      email: normalizar(datos.email),
    },
  });

  return aUsuario(respuesta.usuario);
};

// Cambia la contraseña del usuario con sesión.
export const cambiarContrasena = (datos: DatosCambioContrasena) =>
  pedir<{ mensaje: string }>('/auth/password', {
    metodo: 'PUT',
    cuerpo: datos,
  });

// Recuperación de contraseña. El código se muestra en la consola del backend.
export const enviarCodigoRecuperacion = (correo: string) =>
  pedir<{ mensaje: string }>('/auth/recuperacion/solicitar', {
    metodo: 'POST',
    autenticado: false,
    cuerpo: { email: normalizar(correo) },
  });

export const verificarCodigoRecuperacion = (correo: string, codigo: string) =>
  pedir<{ valido: boolean }>('/auth/recuperacion/verificar', {
    metodo: 'POST',
    autenticado: false,
    cuerpo: { email: normalizar(correo), codigo },
  });

export const restablecerContrasena = (datos: DatosNuevaContrasena) =>
  pedir<{ mensaje: string }>('/auth/recuperacion/restablecer', {
    metodo: 'POST',
    autenticado: false,
    cuerpo: {
      email: normalizar(datos.correo),
      codigo: datos.codigo,
      passwordNueva: datos.contrasena,
    },
  });
