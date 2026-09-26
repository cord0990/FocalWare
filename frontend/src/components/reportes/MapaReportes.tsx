import { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { IonIcon } from '@ionic/react';
import { layersOutline } from 'ionicons/icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Reporte } from '../../services/reportesService';
import { NIVELES_RIESGO, obtenerNivelRiesgo } from '../../utils/riesgo';
import './MapaReportes.css';

const CENTRO_VALPARAISO: [number, number] = [-33.045, -71.615];
const CLAVE_ESTILO_MAPA = 'focalware-estilo-mapa';

// Estilos de mapa disponibles. "Simple" muestra menos detalles para que resalten los reportes.
const ESTILOS_MAPA = {
  simple: {
    nombre: 'Mapa simple',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    atribucion: 'Tiles &copy; Esri · Esri, HERE, Garmin, &copy; OpenStreetMap',
  },
  detallado: {
    nombre: 'Mapa detallado',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    atribucion: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
};

type EstiloMapa = keyof typeof ESTILOS_MAPA;

const leerEstiloGuardado = (): EstiloMapa => {
  try {
    return localStorage.getItem(CLAVE_ESTILO_MAPA) === 'detallado' ? 'detallado' : 'simple';
  } catch {
    return 'simple';
  }
};

const guardarEstilo = (estilo: EstiloMapa) => {
  try {
    localStorage.setItem(CLAVE_ESTILO_MAPA, estilo);
  } catch {
    // Si el navegador no permite guardar, el mapa funciona igual.
  }
};

const crearIcono = (color: string) =>
  L.divIcon({
    className: 'marcador-reporte',
    html: `<svg viewBox="0 0 24 32" width="30" height="40"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="${color}" stroke="#fff" stroke-width="1.5"/><circle cx="12" cy="12" r="4.5" fill="#fff"/></svg>`,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -36],
  });

const ICONOS = Object.fromEntries(NIVELES_RIESGO.map((n) => [n.nivel, crearIcono(n.color)]));

// Leaflet necesita recalcular su tamaño cuando cambia el contenedor
// (por ejemplo al colapsar el menú o al entrar a la pantalla).
const AjustarTamano: React.FC = () => {
  const mapa = useMap();

  useEffect(() => {
    const observador = new ResizeObserver(() => mapa.invalidateSize());
    observador.observe(mapa.getContainer());
    return () => observador.disconnect();
  }, [mapa]);

  return null;
};

const EnfocarReporte: React.FC<{ reporte?: Reporte; marcadores: Map<string, L.Marker> }> = ({
  reporte,
  marcadores,
}) => {
  const mapa = useMap();

  useEffect(() => {
    if (!reporte) return;
    mapa.flyTo([reporte.latitud, reporte.longitud], Math.max(mapa.getZoom(), 15));
    marcadores.get(reporte.id)?.openPopup();
  }, [reporte, marcadores, mapa]);

  return null;
};

interface MapaReportesProps {
  reportes: Reporte[];
  seleccionado?: Reporte;
  onSeleccionar: (id: string) => void;
}

const MapaReportes: React.FC<MapaReportesProps> = ({ reportes, seleccionado, onSeleccionar }) => {
  const marcadores = useRef(new Map<string, L.Marker>());
  const [estilo, setEstilo] = useState<EstiloMapa>(leerEstiloGuardado);
  const otroEstilo: EstiloMapa = estilo === 'simple' ? 'detallado' : 'simple';
  const capa = ESTILOS_MAPA[estilo];

  const cambiarEstilo = () => {
    setEstilo(otroEstilo);
    guardarEstilo(otroEstilo);
  };

  return (
    <div className="mapa-reportes">
      <MapContainer center={CENTRO_VALPARAISO} zoom={13} className="mapa-contenedor">
        {/* La key obliga a recrear la capa al cambiar de estilo */}
        <TileLayer
          key={estilo}
          attribution={capa.atribucion}
          url={capa.url}
        />
        <AjustarTamano />
        <EnfocarReporte reporte={seleccionado} marcadores={marcadores.current} />

        {reportes.map((reporte) => {
          const nivel = obtenerNivelRiesgo(reporte.riesgo);
          return (
            <Marker
              key={reporte.id}
              position={[reporte.latitud, reporte.longitud]}
              icon={ICONOS[nivel.nivel]}
              title={reporte.nombre}
              eventHandlers={{ click: () => onSeleccionar(reporte.id) }}
              ref={(marcador) => {
                if (marcador) marcadores.current.set(reporte.id, marcador);
                else marcadores.current.delete(reporte.id);
              }}
            >
              <Popup>
                <strong>{reporte.nombre}</strong>
                <br />
                {reporte.sector} · Riesgo {nivel.etiqueta.toLowerCase()} ({reporte.riesgo}%)
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <button
        type="button"
        className="mapa-boton-estilo"
        onClick={cambiarEstilo}
        title={`Cambiar a ${ESTILOS_MAPA[otroEstilo].nombre.toLowerCase()}`}
      >
        <IonIcon icon={layersOutline} aria-hidden="true" />
        {ESTILOS_MAPA[otroEstilo].nombre}
      </button>

      <ul className="mapa-leyenda" aria-label="Niveles de riesgo">
        {NIVELES_RIESGO.map((nivel) => (
          <li key={nivel.nivel}>
            <span style={{ background: nivel.color }} />
            {nivel.etiqueta}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MapaReportes;
