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
}

// Mapa pequeño y fijo que muestra dónde está un reporte.
const MiniMapa: React.FC<MiniMapaProps> = ({ latitud, longitud, nivel }) => (
  <div className="mini-mapa">
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
    <span className="mini-mapa-etiqueta" style={{ background: nivel.color, color: nivel.texto }}>
      Riesgo {nivel.etiqueta.toLowerCase()}
    </span>
  </div>
);

export default MiniMapa;
