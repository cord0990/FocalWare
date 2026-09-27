import { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { IonIcon } from '@ionic/react';
import { caretUp, flameOutline, imageOutline, layersOutline } from 'ionicons/icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { obtenerHistorial } from '../../services/historialService';
import type { Reporte } from '../../services/reportesService';
import AjustarTamanoMapa from './AjustarTamanoMapa';
import CapaCalor from './CapaCalor';
import { CENTRO_VALPARAISO, ESTILOS_MAPA } from './capasMapa';
import { ICONOS_RIESGO } from './iconosMapa';
import { NIVELES_RIESGO, obtenerNivelRiesgo } from '../../utils/riesgo';
import './MapaReportes.css';

const CLAVE_ESTILO_MAPA = 'focalware-estilo-mapa';
const CLAVE_MAPA_CALOR = 'focalware-mapa-calor';
const HISTORIAL = obtenerHistorial();

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
  onVerDetalles: (id: string) => void;
}

const MapaReportes: React.FC<MapaReportesProps> = ({
  reportes,
  seleccionado,
  onSeleccionar,
  onVerDetalles,
}) => {
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
        <AjustarTamanoMapa />
        {calor && <CapaCalor puntos={HISTORIAL} />}
        <EnfocarReporte reporte={seleccionado} marcadores={marcadores.current} />

        {reportes.map((reporte) => {
          const nivel = obtenerNivelRiesgo(reporte.riesgo);
          return (
            <Marker
              key={reporte.id}
              position={[reporte.latitud, reporte.longitud]}
              icon={ICONOS_RIESGO[nivel.nivel]}
              title={reporte.nombre}
              eventHandlers={{ click: () => onSeleccionar(reporte.id) }}
              ref={(marcador) => {
                if (marcador) marcadores.current.set(reporte.id, marcador);
                else marcadores.current.delete(reporte.id);
              }}
            >
              <Popup className="popup-reporte" minWidth={240} maxWidth={260} autoPanPadding={[16, 16]}>
                <div className="popup-imagen">
                  {reporte.imagenes[0] ? (
                    <img src={reporte.imagenes[0]} alt={reporte.nombre} />
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
                  <button
                    type="button"
                    className="popup-detalles"
                    onClick={() => onVerDetalles(reporte.id)}
                  >
                    Ver detalles
                  </button>
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
