import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import './leafletGlobal';
import 'leaflet.heat';

interface PuntoCalor {
  latitud: number;
  longitud: number;
}

interface CapaCalorProps {
  puntos: PuntoCalor[];
}

// Colores de la mancha de calor: los mismos de la escala de riesgo (bajo a crítico).
const DEGRADADO = {
  0.2: '#2e9e4f',
  0.45: '#f2b705',
  0.7: '#e0283a',
  1: '#7a0b16',
};

// Mapa de calor: cada reporte suma lo mismo, así la intensidad representa cuántos
// reportes hay en una zona. El riesgo se sigue viendo en el color de cada pin.
const CapaCalor: React.FC<CapaCalorProps> = ({ puntos }) => {
  const mapa = useMap();

  useEffect(() => {
    let capa: L.HeatLayer | null = null;

    // El plugin falla si dibuja cuando el mapa mide 0 px (por ejemplo, mientras la pantalla
    // todavía se está mostrando o está oculta). Por eso la capa se agrega o quita según el tamaño.
    const actualizar = () => {
      const tamano = mapa.getSize();
      const visible = tamano.x > 0 && tamano.y > 0;
      if (visible && !capa) {
        capa = L.heatLayer(
          puntos.map((punto) => [punto.latitud, punto.longitud, 1]),
          {
            radius: 30,
            blur: 24,
            maxZoom: 16,
            minOpacity: 0.3,
            // Un reporte aislado no debe verse ya como una zona crítica: con
            // max 4 hacen falta varios reportes cercanos para llegar al rojo.
            max: 4,
            gradient: DEGRADADO,
          },
        ).addTo(mapa);
      } else if (!visible && capa) {
        mapa.removeLayer(capa);
        capa = null;
      }
    };

    actualizar();
    mapa.on('resize', actualizar);
    return () => {
      mapa.off('resize', actualizar);
      if (capa) mapa.removeLayer(capa);
    };
  }, [mapa, puntos]);

  return null;
};

export default CapaCalor;
