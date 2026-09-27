import { useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSesion } from '../hooks/useSesion';
import { RUTAS } from './rutas';

// Páginas que requieren sesión: sin sesión se va al login, recordando a dónde quería ir.
const RutaProtegida: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { usuario } = useSesion();
  const { pathname, search } = useLocation();
  // Ionic mantiene montadas las páginas anteriores; solo redirige la página que está a la vista.
  const rutaPropia = useRef(pathname);

  if (!usuario) {
    if (pathname !== rutaPropia.current) return null;
    return <Navigate to={RUTAS.login} replace state={{ desde: pathname + search }} />;
  }
  return <>{children}</>;
};

export default RutaProtegida;
