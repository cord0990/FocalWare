import { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { IonIcon } from '@ionic/react';
import { caretUp, flameOutline, imageOutline, layersOutline } from 'ionicons/icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { obtenerHistorial } from '../../services/historialService';
import type { Reporte } from '../../services/reportesService';
import CapaCalor from './CapaCalor';
import { NIVELES_RIESGO, obtenerNivelRiesgo } from '../../utils/riesgo';
import './MapaReportes.css';

const CENTRO_VALPARAISO: [number, number] = [-33.045, -71.615];
const CLAVE_ESTILO_MAPA = 'focalware-estilo-mapa';
const CLAVE_MAPA_CALOR = 'focalware-mapa-calor';
const HISTORIAL = obtenerHistorial();

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

const leerCalorGuardado = () => {
  try {
    return localStorage.getItem(CLAVE_MAPA_CALOR) === 'si';
  } catch {
    return false;
  }
};

const guardarCalor = (activo: boolean) => {
  try {
    localStorage.setItem(CLAVE_MAPA_CALOR, activo ? 'si' : 'no');
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

const EnfocarReporte: React.FC<{ reporte?: Reporte; marcadores: Map<string, L.Marker> }> = ({
  reporte,
  marcadores,
}) => {
  const mapa = useMap();

  useEffect(() => {
    if (!reporte) return;
    // Se centra el mapa 120 px por encima del pin para que el globo (con su imagen) quepa arriba.
    const zoom = Math.max(mapa.getZoom(), 15);
    const punto = mapa.project([reporte.latitud, reporte.longitud], zoom).subtract([0, 120]);
    mapa.flyTo(mapa.unproject(punto, zoom), zoom);
    // El globo se abre al terminar el movimiento para que Leaflet lo acomode dentro del mapa.
    mapa.once('moveend', () => marcadores.get(reporte.id)?.openPopup());
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

  const [calor, setCalor] = useState(leerCalorGuardado);
  const alternarCalor = () => {
    setCalor(!calor);
    guardarCalor(!calor);
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
        {calor && <CapaCalor puntos={HISTORIAL} />}
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
              <Popup className="popup-reporte" minWidth={240} maxWidth={260} autoPanPadding={[16, 16]}>
                <div className="popup-imagen">
                  {reporte.imagen ? (
                    <img src={reporte.imagen} alt={reporte.nombre} />
                  ) : (
                    <>
                      <IonIcon icon={imageOutline} aria-hidden="true" />
                      <span>Sin fotografía</span>
                    </>
                  )}
                </div>
                <div className="popup-datos">
                  <strong>{reporte.nombre}</strong>
                  <span>
                    {reporte.sector} · {reporte.categoria}
                  </span>
                  <div className="popup-fila">
                    <span className="popup-riesgo" style={{ background: nivel.color, color: nivel.texto }}>
                      Riesgo {nivel.etiqueta.toLowerCase()} {reporte.riesgo}%
                    </span>
                    <span className="popup-votos">
                      <IonIcon icon={caretUp} aria-hidden="true" /> {reporte.votos}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <div className="mapa-controles">
        <button
          type="button"
          className="mapa-boton-estilo"
          onClick={cambiarEstilo}
          title={`Cambiar a ${ESTILOS_MAPA[otroEstilo].nombre.toLowerCase()}`}
        >
          <IonIcon icon={layersOutline} aria-hidden="true" />
          {ESTILOS_MAPA[otroEstilo].nombre}
        </button>
        <button
          type="button"
          className={calor ? 'mapa-boton-estilo activo' : 'mapa-boton-estilo'}
          onClick={alternarCalor}
          aria-pressed={calor}
          title="Muestra las zonas con más reportes de los últimos 12 meses"
        >
          <IonIcon icon={flameOutline} aria-hidden="true" />
          Mapa de calor
        </button>
        {calor && (
          <div className="mapa-calor-leyenda">
            <span>Concentración de reportes (12 meses)</span>
            <div className="mapa-calor-barra" aria-hidden="true" />
            <div className="mapa-calor-extremos">
              <span>Baja</span>
              <span>Alta</span>
            </div>
          </div>
        )}
      </div>

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
