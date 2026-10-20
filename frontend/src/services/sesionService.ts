// Sesión del usuario. El token JWT que entrega la API queda guardado acá y
// `api.ts` lo manda en cada petición.

import { borrarToken, guardarToken } from './api';

export type Rol = 'vecino' | 'funcionario';

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  telefono?: string;
  rol: Rol;
  // Logica: Variable que solo Aplica para funcionarios: cuadrillas a las que pertenece.
  cuadrillas?: string[];
}

export const NOMBRE_ROL: Record<Rol, string> = {
  vecino: 'Vecino',
  funcionario: 'Funcionario',
};

const CLAVE_SESION = 'focalware-sesion';

export const leerSesion = (): Usuario | null => {
  try {
    const guardada = localStorage.getItem(CLAVE_SESION);
    return guardada ? (JSON.parse(guardada) as Usuario) : null;
  } catch {
    return null;
  }
};

export const guardarSesion = (usuario: Usuario, token?: string) => {
  if (token) guardarToken(token);
  try {
    localStorage.setItem(CLAVE_SESION, JSON.stringify(usuario));
  } catch {
    // Sin almacenamiento la sesión dura mientras la app esté abierta.
  }
};

export const borrarSesion = () => {
  try {
    localStorage.removeItem(CLAVE_SESION);
  } catch {
    // Nada que borrar si el navegador no permite guardar datos.
  }
  borrarToken();
};

// "Valentina Rojas" -> "VR"; "valentina" -> "V".
export const obtenerIniciales = (nombre: string) =>
  nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join('');

export const primerNombre = (nombre: string) => nombre.trim().split(/\s+/)[0] ?? '';
