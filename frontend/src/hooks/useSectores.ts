import { useCallback, useEffect, useState } from 'react';
import {
  obtenerCatalogoSectores,
  type CatalogoSectores,
} from '../services/sectoresService';

// Carga el catálogo de sectores una vez por pantalla. El servicio mantiene el
// caché, así que varias pantallas no repiten la consulta.
export const useSectores = () => {
  const [catalogo, setCatalogo] = useState<CatalogoSectores | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async (forzar = false) => {
    setCargando(true);
    setError('');
    try {
      setCatalogo(await obtenerCatalogoSectores(forzar));
    } catch {
      setError('No se pudieron cargar los sectores.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return {
    catalogo,
    sectores: catalogo?.sectores ?? [],
    caja: catalogo?.caja ?? null,
    cargando,
    error,
    recargar: () => cargar(true),
  };
};
