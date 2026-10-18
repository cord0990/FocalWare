import { useEffect, useState } from 'react';
import { EVENTO_REPORTES } from '../services/reportesService';
import { obtenerMiActividad, type ActividadUsuario } from '../services/usuarioService';
import { useSesion } from './useSesion';

const SIN_ACTIVIDAD: ActividadUsuario = { reportesCreados: 0, votosDados: 0, apoyosRecibidos: 0 };

// Cifras de "Tu aporte" en el menú de cuenta. Solo para vecinos.
// Se vuelven a pedir cuando el vecino crea, borra o apoya un reporte.
export const useMiActividad = () => {
  const { usuario } = useSesion();
  const esVecino = usuario?.rol === 'vecino';
  const [actividad, setActividad] = useState<ActividadUsuario>(SIN_ACTIVIDAD);

  useEffect(() => {
    if (!esVecino) {
      setActividad(SIN_ACTIVIDAD);
      return;
    }

    const actualizar = () => {
      obtenerMiActividad()
        .then(setActividad)
        .catch(() => setActividad(SIN_ACTIVIDAD));
    };

    actualizar();
    window.addEventListener(EVENTO_REPORTES, actualizar);
    return () => window.removeEventListener(EVENTO_REPORTES, actualizar);
  }, [esVecino, usuario?.id]);

  return actividad;
};
