import { createContext } from 'react';
import type { Usuario } from '../services/sesionService';

interface SesionContextValor {
  // null si nadie ha iniciado sesión.
  usuario: Usuario | null;
  iniciarSesion: (usuario: Usuario) => void;
  cerrarSesion: () => void;
}

// Usuario con la sesión iniciada, compartido por todas las pantallas.
export const SesionContext = createContext<SesionContextValor>({
  usuario: null,
  iniciarSesion: () => {},
  cerrarSesion: () => {},
});
