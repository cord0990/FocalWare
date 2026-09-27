import { useEffect } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import AjustarTamanoMapa from './AjustarTamanoMapa';
import { CENTRO_VALPARAISO, ESTILOS_MAPA } from './capasMapa';
import { crearIconoPin } from './iconosMapa';
import './SelectorUbicacion.css';

export interface Ubicacion {
  latitud: number;
  longitud: number;
}

interface SelectorUbicacionProps {
  ubicacion: Ubicacion | null;
  // Punto al que se mueve el mapa (por ejemplo, la ubicación obtenida con el GPS).
  enfocar?: Ubicacion | null;
  onCambiar: (ubicacion: Ubicacion) => void;
}

const ICONO_NUEVO = crearIconoPin('#e0283a');

// Marca el punto donde el usuario toca el mapa.
const EscucharClics: React.FC<{ onCambiar: (ubicacion: Ubicacion) => void }> = ({ onCambiar }) => {
  useMapEvents({
    click: (evento) => onCambiar({ latitud: evento.latlng.lat, longitud: evento.latlng.lng }),
  });
  return null;
};

// Mueve el mapa cuando se pide enfocar un punto (por ejemplo, con "Usar mi ubicación").
const Centrar: React.FC<{ punto?: Ubicacion | null }> = ({ punto }) => {
  const mapa = useMap();
  useEffect(() => {
    if (punto) mapa.flyTo([punto.latitud, punto.longitud], Math.max(mapa.getZoom(), 16));
  }, [punto, mapa]);
  return null;
};

// Mapa para elegir dónde está el problema: se toca el mapa o se arrastra el pin.
const SelectorUbicacion: React.FC<SelectorUbicacionProps> = ({ ubicacion, enfocar, onCambiar }) => (
  <div className="selector-ubicacion">
    <MapContainer center={CENTRO_VALPARAISO} zoom={13} className="selector-ubicacion-mapa">
      <TileLayer attribution={ESTILOS_MAPA.simple.atribucion} url={ESTILOS_MAPA.simple.url} />
      <AjustarTamanoMapa />
      <EscucharClics onCambiar={onCambiar} />
      <Centrar punto={enfocar} />
      {ubicacion && (
        <Marker
          position={[ubicacion.latitud, ubicacion.longitud]}
          icon={ICONO_NUEVO}
          draggable
          eventHandlers={{
            dragend: (evento) => {
              const posicion = evento.target.getLatLng();
              onCambiar({ latitud: posicion.lat, longitud: posicion.lng });
            },
          }}
        />
      )}
    </MapContainer>
    {!ubicacion && <p className="selector-ubicacion-ayuda">Toca el mapa para marcar dónde está el problema</p>}
  </div>
);

export default SelectorUbicacion;
