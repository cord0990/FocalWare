import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import AjustarTamanoMapa from './AjustarTamanoMapa';
import { ESTILOS_MAPA } from './capasMapa';
import { ICONOS_RIESGO } from './iconosMapa';
import type { NivelRiesgo } from '../../utils/riesgo';
import './MiniMapa.css';

interface MiniMapaProps {
  latitud: number;
  longitud: number;
  nivel: NivelRiesgo;
  onClick?: () => void;
}

// Mapa pequeño y fijo que muestra dónde está un reporte.
const MiniMapa: React.FC<MiniMapaProps> = ({ latitud, longitud, nivel, onClick }) => (
  <div
    className={onClick ? 'mini-mapa clicable' : 'mini-mapa'}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    aria-label={onClick ? 'Abrir ubicación del reporte en el mapa' : undefined}
    title={onClick ? 'Toca para abrir el mapa en este punto' : undefined}
    style={onClick ? { cursor: 'pointer' } : undefined}
    onClick={onClick}
    onKeyDown={
      onClick
        ? (evento) => {
            if (evento.key === 'Enter' || evento.key === ' ') {
              evento.preventDefault();
              onClick();
            }
          }
        : undefined
    }
  >
    <MapContainer
      center={[latitud, longitud]}
      zoom={16}
      className="mini-mapa-contenedor"
      zoomControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
      keyboard={false}
      attributionControl={false}
    >
      <TileLayer url={ESTILOS_MAPA.simple.url} />
      <AjustarTamanoMapa />
      <Marker position={[latitud, longitud]} icon={ICONOS_RIESGO[nivel.nivel]} interactive={false} />
    </MapContainer>
    {onClick && (
      <span
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 500,
          padding: '5px 11px',
          borderRadius: '10px',
          background: 'rgba(31, 31, 31, 0.86)',
          color: '#fff',
          fontSize: '0.8rem',
          fontWeight: 700,
          pointerEvents: 'none',
        }}
      >
        Ver en el mapa
      </span>
    )}
    <span className="mini-mapa-etiqueta" style={{ background: nivel.color, color: nivel.texto }}>
      Riesgo {nivel.etiqueta.toLowerCase()}
    </span>
  </div>
);

export default MiniMapa;
