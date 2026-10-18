import { useEffect, useState } from 'react';
import { EVENTO_NOTIFICACIONES, obtenerNotificaciones } from '../services/notificacionesService';
import { useSesion } from './useSesion';

// Cantidad de notificaciones sin leer del vecino, para el contador del menú.
// Se vuelve a pedir cuando el vecino abre una notificación.
export const useNotificacionesNoLeidas = () => {
  const { usuario } = useSesion();
  const esVecino = usuario?.rol === 'vecino';
  const [noLeidas, setNoLeidas] = useState(0);

  useEffect(() => {
    if (!esVecino) {
      setNoLeidas(0);
      return;
    }

    const actualizar = () => {
      obtenerNotificaciones()
        .then((datos) => setNoLeidas(datos.noLeidas))
        .catch(() => setNoLeidas(0));
    };

    actualizar();
    window.addEventListener(EVENTO_NOTIFICACIONES, actualizar);
    return () => window.removeEventListener(EVENTO_NOTIFICACIONES, actualizar);
  }, [esVecino, usuario?.id]);

  return noLeidas;
};
