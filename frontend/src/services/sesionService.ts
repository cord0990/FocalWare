// Sesión del usuario guardada en el navegador. En la Entrega 2 aquí se guardará el token (JWT)
// que entregue el backend al iniciar sesión.

export type Rol = 'vecino' | 'funcionario';

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  telefono?: string;
  rol: Rol;
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

export const guardarSesion = (usuario: Usuario) => {
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
