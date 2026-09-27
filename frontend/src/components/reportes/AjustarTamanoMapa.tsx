import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

// Leaflet necesita recalcular su tamaño cuando cambia el contenedor
// (por ejemplo al colapsar el menú o al entrar a la pantalla).
const AjustarTamanoMapa: React.FC = () => {
  const mapa = useMap();

  useEffect(() => {
    const observador = new ResizeObserver(() => {
      // Si la pantalla está oculta el mapa mide 0 px; en ese caso no hay nada que recalcular.
      const contenedor = mapa.getContainer();
      if (contenedor.clientWidth > 0 && contenedor.clientHeight > 0) mapa.invalidateSize();
    });
    observador.observe(mapa.getContainer());
    return () => observador.disconnect();
  }, [mapa]);

  return null;
};

export default AjustarTamanoMapa;
