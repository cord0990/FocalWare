import { useLocation, useNavigate } from 'react-router-dom';
import { RUTAS } from '../routes/rutas';

// Lleva al login recordando la página actual, para volver a ella al iniciar sesión
// (por ejemplo, al intentar votar desde el mapa sin sesión).
export const useIrAlLogin = () => {
  const navegar = useNavigate();
  const { pathname, search } = useLocation();

  return (desde = pathname + search) => navegar(RUTAS.login, { state: { desde } });
};
