// Cliente HTTP de la API. Envuelve fetch para tener el mismo manejo de errores
// en toda la app y mandar el token en cada llamada.

const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/+$/, '');

const CLAVE_TOKEN = 'focalware-token';

export const guardarToken = (token: string) => {
  try {
    localStorage.setItem(CLAVE_TOKEN, token);
  } catch {
    // Sin almacenamiento la sesión dura mientras la app esté abierta.
  }
};

export const leerToken = (): string | null => {
  try {
    return localStorage.getItem(CLAVE_TOKEN);
  } catch {
    return null;
  }
};

export const borrarToken = () => {
  try {
    localStorage.removeItem(CLAVE_TOKEN);
  } catch {
    // Nada que borrar si el navegador no permite guardar datos.
  }
};

// Trae el código de estado para que cada pantalla sepa qué hacer.
export class ErrorApi extends Error {
  readonly estado: number;

  constructor(mensaje: string, estado: number) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.estado = estado;
  }
}

type Opciones = {
  metodo?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  cuerpo?: unknown;
  autenticado?: boolean; // si es false, no se manda el token
};

export const pedir = async <T>(ruta: string, opciones: Opciones = {}): Promise<T> => {
  const { metodo = 'GET', cuerpo, autenticado = true } = opciones;

  const cabeceras: Record<string, string> = { 'Content-Type': 'application/json' };

  if (autenticado) {
    const token = leerToken();
    if (token) cabeceras.Authorization = `Bearer ${token}`;
  }

  let respuesta: Response;
  try {
    respuesta = await fetch(`${BASE_URL}${ruta}`, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
  } catch {
    throw new ErrorApi('No se pudo conectar con el servidor', 0);
  }

  let datos: { ok?: boolean; data?: T; error?: string } | null = null;
  try {
    datos = await respuesta.json();
  } catch {
    // Respuesta sin JSON (por ejemplo, un 502 del proxy).
  }

  if (!respuesta.ok) {
    throw new ErrorApi(datos?.error ?? 'Ocurrió un error inesperado', respuesta.status);
  }

  return (datos?.data ?? (datos as unknown)) as T;
};
