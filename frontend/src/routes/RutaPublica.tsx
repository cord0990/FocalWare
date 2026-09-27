import { useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSesion } from '../hooks/useSesion';
import { RUTAS } from './rutas';

// Login, registro y recuperar contraseña: con la sesión iniciada se va a la página que el
// usuario quería abrir (si llegó desde una ruta protegida) o al mapa.
const RutaPublica: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { usuario } = useSesion();
  const { pathname, state } = useLocation();
  // Ionic mantiene montadas las páginas anteriores; solo redirige la página que está a la vista.
  const rutaPropia = useRef(pathname);
  const destino = (state as { desde?: string } | null)?.desde ?? RUTAS.inicio;

  if (usuario) {
    if (pathname !== rutaPropia.current) return null;
    return <Navigate to={destino} replace />;
  }
  return <>{children}</>;
};

export default RutaPublica;
