// Cliente HTTP de la API. Envuelve fetch para tener el mismo manejo de errores
// en toda la app y mandar el token en cada llamada.

const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/+$/, '');

const ORIGEN = BASE_URL.replace(/\/api$/, '');

export const urlDeImagen = (ruta: string): string => {
  if (!ruta) return '';
  if (ruta.startsWith('data:')) return ruta;
  if (ruta.startsWith('http://') || ruta.startsWith('https://')) return ruta;
  return `${ORIGEN}/uploads/${ruta.replace(/^\/+/, '')}`;
};

const CLAVE_TOKEN = 'focalware-token';

// Mensaje que ve la persona cuando el token venció o dejó de ser válido.
export const MENSAJE_SESION_EXPIRADA = 'Tu sesión expiró, vuelve a iniciar sesión';

// Función que la app registra para reaccionar cuando la sesión expira
// (limpiar el usuario, volver al login y mostrar el aviso).
let manejadorSesionExpirada: (() => void) | null = null;

// Evita avisar varias veces cuando varias pantallas piden datos a la vez y todas reciben 401.
let sesionExpiradaNotificada = false;

export const alExpirarSesion = (manejador: (() => void) | null) => {
  manejadorSesionExpirada = manejador;
};

export const guardarToken = (token: string) => {
  // Con una sesión nueva se vuelve a permitir el aviso de expiración.
  sesionExpiradaNotificada = false;
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
  metodo?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  cuerpo?: unknown;
  autenticado?: boolean; // si es false, no se manda el token
  esFormulario?: boolean;
};

export const pedir = async <T>(ruta: string, opciones: Opciones = {}): Promise<T> => {
  const { metodo = 'GET', cuerpo, autenticado = true, esFormulario = false } = opciones;

  const cabeceras: Record<string, string> = {};
  if (!esFormulario) cabeceras['Content-Type'] = 'application/json';

  // Se guarda si realmente se mandó un token: un 401 sin token no es una sesión expirada.
  let tokenEnviado = false;
  if (autenticado) {
    const token = leerToken();
    if (token) {
      cabeceras.Authorization = `Bearer ${token}`;
      tokenEnviado = true;
    }
  }

  let respuesta: Response;
  try {
    respuesta = await fetch(`${BASE_URL}${ruta}`, {
      method: metodo,
      headers: cabeceras,
      body:
        cuerpo === undefined
          ? undefined
          : esFormulario
            ? (cuerpo as FormData)
            : JSON.stringify(cuerpo),
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

  // 401 con token enviado: venció o es inválido. Se cierra la sesión una sola vez
  // y se avisa. Las llamadas sin token (como el login con clave incorrecta) no entran acá.
  if (respuesta.status === 401 && tokenEnviado) {
    borrarToken();
    if (!sesionExpiradaNotificada) {
      sesionExpiradaNotificada = true;
      manejadorSesionExpirada?.();
    }
    throw new ErrorApi(MENSAJE_SESION_EXPIRADA, 401);
  }

  if (!respuesta.ok) {
    throw new ErrorApi(datos?.error ?? 'Ocurrió un error inesperado', respuesta.status);
  }

  return (datos?.data ?? (datos as unknown)) as T;
};