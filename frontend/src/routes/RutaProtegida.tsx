import { useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSesion } from '../hooks/useSesion';
import type { Rol } from '../services/sesionService';
import { RUTAS } from './rutas';

interface RutaProtegidaProps {
  children: React.ReactNode;
  // Roles que pueden entrar. Si no se indica, basta con tener la sesión iniciada.
  roles?: Rol[];
}

// Páginas que requieren sesión: sin sesión se va al login, recordando a dónde quería ir.
// Con sesión pero sin el rol necesario, se vuelve al mapa.
const RutaProtegida: React.FC<RutaProtegidaProps> = ({ children, roles }) => {
  const { usuario } = useSesion();
  const { pathname, search } = useLocation();
  // Ionic mantiene montadas las páginas anteriores; solo redirige la página que está a la vista.
  const rutaPropia = useRef(pathname);
  const esLaPaginaActual = pathname === rutaPropia.current;

  if (!usuario) {
    if (!esLaPaginaActual) return null;
    return <Navigate to={RUTAS.login} replace state={{ desde: pathname + search }} />;
  }
  if (roles && !roles.includes(usuario.rol)) {
    if (!esLaPaginaActual) return null;
    return <Navigate to={RUTAS.mapa} replace />;
  }
  return <>{children}</>;
};

export default RutaProtegida;
