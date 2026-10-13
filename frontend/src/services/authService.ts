// Inicio de sesión y registro contra la API REST del backend.
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

interface RespuestaAuth {
  token: string;
  usuario: Usuario;
}

export const DOMINIO_INSTITUCIONAL = 'focalware.cl';
const esCorreoInstitucional = (email: string) =>
  email.trim().toLowerCase().endsWith(`@${DOMINIO_INSTITUCIONAL}`);

export const esInstitucional = esCorreoInstitucional;

const normalizar = (email: string) => email.trim().toLowerCase();

export const iniciarSesion = async (datos: DatosLogin): Promise<RespuestaAuth> =>
  pedir<RespuestaAuth>('/auth/login', {
    metodo: 'POST',
    autenticado: false,
    cuerpo: { email: normalizar(datos.email), password: datos.password },
  });

// Crea una cuenta de Vecino.
export const registrarUsuario = async (datos: DatosRegistro): Promise<RespuestaAuth> =>
  pedir<RespuestaAuth>('/auth/registro', {
    metodo: 'POST',
    autenticado: false,
    cuerpo: {
      nombre: datos.nombre.trim(),
      email: normalizar(datos.email),
      telefono: datos.telefono ?? undefined,
      password: datos.password,
    },
  });

// Revisa que el token guardado siga siendo válido.
// Si expiró, la sesión se limpia y hay que volver a iniciar sesión.
export const revisarSesion = async (): Promise<Usuario | null> => {
  try {
    const datos = await pedir<{ usuario: Usuario }>('/auth/perfil');
    return datos.usuario;
  } catch (error) {
    if (error instanceof ErrorApi && error.estado === 401) return null;
    throw error;
  }
};

// TODO: El envío del código y el cambio de contraseña todavía no están en el backend:
// se mantienen como llamadas simuladas hasta implementar la recuperación.
export const enviarCodigoRecuperacion = (correo: string) => {
  void correo;
  return Promise.resolve();
};

export const verificarCodigoRecuperacion = (correo: string, codigo: string) => {
  void correo;
  void codigo;
  return Promise.resolve();
};

export const cambiarContrasena = (datos: DatosNuevaContrasena) => {
  void datos;
  return Promise.resolve();
};
