import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import AjustarTamanoMapa from './AjustarTamanoMapa';
import { CENTRO_VALPARAISO, ESTILOS_MAPA, ZOOM_MINIMO } from './capasMapa';
import './SelectorUbicacion.css';

export interface Ubicacion {
  latitud: number;
  longitud: number;
}

interface SelectorUbicacionProps {
  ubicacion: Ubicacion | null;
  confirmada?: boolean;
  enfocar?: Ubicacion | null;
  onCambiar: (ubicacion: Ubicacion) => void;
}

const ICONO_NUEVO = L.divIcon({
  className: 'pin-ubicacion-destacado',
  html: `
    <span class="pin-ubicacion-halo" aria-hidden="true"></span>
    <svg width="46" height="58" viewBox="0 0 46 58" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M23 2C11.954 2 3 10.954 3 22C3 36.2 23 55 23 55C23 55 43 36.2 43 22C43 10.954 34.046 2 23 2Z" fill="#e0283a" stroke="#ffffff" stroke-width="3.5"/>
      <circle cx="23" cy="21" r="8" fill="#ffffff"/>
    </svg>
  `,
  iconSize: [46, 58],
  iconAnchor: [23, 55],
});

const EscucharClics: React.FC<{ onCambiar: (ubicacion: Ubicacion) => void }> = ({ onCambiar }) => {
  useMapEvents({
    click: (evento) => onCambiar({ latitud: evento.latlng.lat, longitud: evento.latlng.lng }),
  });
  return null;
};

const Centrar: React.FC<{ punto?: Ubicacion | null }> = ({ punto }) => {
  const mapa = useMap();
  useEffect(() => {
    if (punto) mapa.flyTo([punto.latitud, punto.longitud], Math.max(mapa.getZoom(), 16));
  }, [punto, mapa]);
  return null;
};

const SelectorUbicacion: React.FC<SelectorUbicacionProps> = ({
  ubicacion,
  confirmada = false,
  enfocar,
  onCambiar,
}) => (
  <div className={confirmada ? 'selector-ubicacion confirmada' : 'selector-ubicacion'}>
    <MapContainer
      center={CENTRO_VALPARAISO}
      zoom={13}
      minZoom={ZOOM_MINIMO}
      className="selector-ubicacion-mapa"
    >
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
    {!ubicacion ? (
      <p className="selector-ubicacion-ayuda">Toca el mapa para marcar dónde está el problema</p>
    ) : (
      <p className="selector-ubicacion-ayuda confirmada">
        Punto marcado · Puedes arrastrar el pin para ajustarlo
      </p>
    )}
  </div>
);

export default SelectorUbicacion;