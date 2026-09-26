// Por ahora las respuestas son simuladas. En la Entrega 2 estas funciones
// llamarán a la API REST del backend.

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

export const iniciarSesion = (datos: DatosLogin) => {
  void datos;
  return simularRespuesta();
};

export const registrarUsuario = (datos: DatosRegistro) => {
  void datos;
  return simularRespuesta();
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