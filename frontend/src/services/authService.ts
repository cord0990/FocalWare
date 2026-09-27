// Por ahora las respuestas son simuladas. En la Entrega 2 estas funciones
// llamarán a la API REST del backend, que validará la contraseña y entregará un token.
import type { Usuario } from './sesionService';

export interface DatosLogin {
  correo: string;
  contrasena: string;
}

export interface DatosRegistro {
  nombre: string;
  correo: string;
  telefono?: string;
  contrasena: string;
}

export interface DatosNuevaContrasena {
  correo: string;
  codigo: string;
  contrasena: string;
}

const simularRespuesta = (): Promise<void> =>
  new Promise((resolver) => setTimeout(resolver, 800));

// Cuentas creadas en este navegador. No se guarda la contraseña: en esta etapa no se valida.
const CLAVE_CUENTAS = 'focalware-cuentas';

const leerCuentas = (): Usuario[] => {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_CUENTAS) ?? '[]');
  } catch {
    return [];
  }
};

const guardarCuentas = (cuentas: Usuario[]) => {
  try {
    localStorage.setItem(CLAVE_CUENTAS, JSON.stringify(cuentas));
  } catch {
    // Sin almacenamiento la cuenta solo dura esta sesión.
  }
};

const normalizarCorreo = (correo: string) => correo.trim().toLowerCase();

// "valentina.rojas@correo.cl" -> "Valentina Rojas", para cuentas que no pasaron por el registro.
const nombreDesdeCorreo = (correo: string) =>
  correo
    .split('@')[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(' ');

const nuevoId = () => `U-${Date.now().toString(36)}`;

// Devuelve el usuario con el que se inicia la sesión.
export const iniciarSesion = async (datos: DatosLogin): Promise<Usuario> => {
  await simularRespuesta();
  const correo = normalizarCorreo(datos.correo);
  const cuenta = leerCuentas().find((existente) => existente.correo === correo);
  return cuenta ?? { id: nuevoId(), nombre: nombreDesdeCorreo(correo), correo, rol: 'vecino' };
};

// Crea la cuenta y devuelve el usuario, que queda con la sesión iniciada.
export const registrarUsuario = async (datos: DatosRegistro): Promise<Usuario> => {
  await simularRespuesta();
  const correo = normalizarCorreo(datos.correo);
  const usuario: Usuario = {
    id: nuevoId(),
    nombre: datos.nombre.trim(),
    correo,
    telefono: datos.telefono || undefined,
    rol: 'vecino',
  };
  guardarCuentas([...leerCuentas().filter((cuenta) => cuenta.correo !== correo), usuario]);
  return usuario;
};

export const enviarCodigoRecuperacion = (correo: string) => {
  void correo;
  return simularRespuesta();
};

export const verificarCodigoRecuperacion = (correo: string, codigo: string) => {
  void correo;
  void codigo;
  return simularRespuesta();
};

export const cambiarContrasena = (datos: DatosNuevaContrasena) => {
  void datos;
  return simularRespuesta();
};