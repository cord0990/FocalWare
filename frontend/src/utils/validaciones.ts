export const esCorreoValido = (correo: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo.trim());

export const REGLAS_CONTRASENA = [
  { texto: 'Mínimo 8 caracteres', cumple: (c: string) => c.length >= 8 },
  { texto: 'Al menos una mayúscula', cumple: (c: string) => /[A-Z]/.test(c) },
  { texto: 'Al menos una minúscula', cumple: (c: string) => /[a-z]/.test(c) },
  { texto: 'Al menos un número', cumple: (c: string) => /\d/.test(c) },
];

export const esContrasenaSegura = (contrasena: string): boolean =>
  REGLAS_CONTRASENA.every((regla) => regla.cumple(contrasena));