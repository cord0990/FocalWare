import { useEffect, useState } from 'react';
import { EVENTO_PENDIENTES, obtenerPendientes } from '../services/pendientesService';

// Lista de reportes pendientes de envío, actualizada cuando se envían o eliminan.
export const usePendientes = () => {
  const [pendientes, setPendientes] = useState(obtenerPendientes);

  useEffect(() => {
    const actualizar = () => setPendientes(obtenerPendientes());
    window.addEventListener(EVENTO_PENDIENTES, actualizar);
    return () => window.removeEventListener(EVENTO_PENDIENTES, actualizar);
  }, []);

  return pendientes;
};
