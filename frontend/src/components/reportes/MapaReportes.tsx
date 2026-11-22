import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { IonIcon, IonSpinner } from '@ionic/react';
import { close, flameOutline, imageOutline, layersOutline, locateOutline } from 'ionicons/icons';
import votoDisponible from '../../assets/icons/voto-disponible.svg';
import votoVotado from '../../assets/icons/voto-votado.svg';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Reporte } from '../../services/reportesService';
import AjustarTamanoMapa from './AjustarTamanoMapa';
import CapaCalor from './CapaCalor';
import { CENTRO_VALPARAISO, ESTILOS_MAPA, ZOOM_MINIMO } from './capasMapa';
import { ICONOS_RIESGO } from './iconosMapa';
import { NIVELES_RIESGO, obtenerNivelRiesgo } from '../../utils/riesgo';
import { useUbicacionActual } from '../../hooks/useUbicacionActual';
import type { Ubicacion } from './SelectorUbicacion';
import './MapaReportes.css';
import './TarjetaReporte.css';
import { urlDeImagen } from '../../services/api';

const CLAVE_ESTILO_MAPA = 'focalware-estilo-mapa';
const CLAVE_MAPA_CALOR = 'focalware-mapa-calor';

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
    // Se centra el mapa 160 px por encima del pin para que el globo (con su imagen) quepa arriba.
    const zoom = Math.max(mapa.getZoom(), 15);
    const punto = mapa.project([reporte.latitud, reporte.longitud], zoom).subtract([0, 160]);
    mapa.flyTo(mapa.unproject(punto, zoom), zoom);
    // El globo se abre al terminar el movimiento para que Leaflet lo acomode dentro del mapa.
    mapa.once('moveend', () => marcadores.get(reporte.id)?.openPopup());
  }, [reporte, marcadores, mapa]);

  return null;
};

// Mueve el mapa al punto obtenido con el GPS cuando el usuario toca "Mi ubicación".
const CentrarEnUbicacion: React.FC<{ punto?: Ubicacion | null }> = ({ punto }) => {
  const mapa = useMap();

  useEffect(() => {
    if (punto) mapa.flyTo([punto.latitud, punto.longitud], Math.max(mapa.getZoom(), 16));
  }, [punto, mapa]);

  return null;
};

// Punto azul que marca dónde está el usuario en el mapa.
const ICONO_UBICACION = L.divIcon({
  className: 'marcador-ubicacion',
  html: '<span class="marcador-ubicacion-punto"></span>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

interface MapaReportesProps {
  reportes: Reporte[];
  reportesCalor: Reporte[];
  seleccionado?: Reporte;
  onSeleccionar: (id: string) => void;
  onVerDetalles: (id: string) => void;
  onVotar?: (id: string) => void;
  puedeVotar?: (reporte: Reporte) => boolean;
}

const MapaReportes: React.FC<MapaReportesProps> = ({
  reportes,
  reportesCalor,
  seleccionado,
  onSeleccionar,
  onVerDetalles,
  onVotar,
  puedeVotar,
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

  // "Mi ubicación" reutiliza el GPS de Crear reporte y mueve el mapa al punto obtenido.
  const gps = useUbicacionActual();
  const [miUbicacion, setMiUbicacion] = useState<Ubicacion | null>(null);
  const [errorUbicacion, setErrorUbicacion] = useState('');
  const buscarMiUbicacion = () => {
    setErrorUbicacion('');
    gps.obtener(setMiUbicacion, setErrorUbicacion);
  };

  // La lista de puntos se mantiene estable entre renders para no recrear la capa
  // de calor cada vez que se selecciona un reporte o cambia un filtro.
  const puntosCalor = useMemo(
    () => reportesCalor.map((reporte) => ({ latitud: reporte.latitud, longitud: reporte.longitud })),
    [reportesCalor],
  );

  return (
    <div className="mapa-reportes">
      <MapContainer center={CENTRO_VALPARAISO} zoom={13} minZoom={ZOOM_MINIMO} className="mapa-contenedor">
        {/* La key obliga a recrear la capa al cambiar de estilo */}
        <TileLayer
          key={estilo}
          attribution={capa.atribucion}
          url={capa.url}
        />
        <AjustarTamanoMapa />
        {calor && <CapaCalor puntos={puntosCalor} />}
        <EnfocarReporte reporte={seleccionado} marcadores={marcadores.current} />
        <CentrarEnUbicacion punto={miUbicacion} />
        {miUbicacion && (
          <Marker
            position={[miUbicacion.latitud, miUbicacion.longitud]}
            icon={ICONO_UBICACION}
            interactive={false}
            title="Tu ubicación"
          />
        )}

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
              <Popup className="popup-reporte" minWidth={250} maxWidth={330} autoPanPadding={[16, 16]}>
                <div className="popup-imagen">
                  {reporte.imagenes[0] ? (
                    <img src={urlDeImagen(reporte.imagenes[0])} alt={reporte.nombre} />
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
                    {onVotar ? (
                      (() => {
                        const esPropio = Boolean(reporte.esMio);
                        const votado = Boolean(reporte.miVoto);
                        const habilitado = puedeVotar ? puedeVotar(reporte) : true;
                        const clase = [
                          'btn-voto-mapa',
                          votado ? 'votado' : '',
                          esPropio ? 'propio' : '',
                          !habilitado && !esPropio ? 'deshabilitado' : '',
                        ]
                          .filter(Boolean)
                          .join(' ');
                        const etiqueta = esPropio
                          ? `No puedes votar tu propio reporte, ${reporte.votos} votos`
                          : votado
                            ? `Quitar voto, ${reporte.votos} votos`
                            : `Votar a favor, ${reporte.votos} votos`;
                        return (
                          <button
                            type="button"
                            className={clase}
                            onClick={() => onVotar(reporte.id)}
                            disabled={esPropio || !habilitado}
                            aria-pressed={esPropio ? undefined : votado}
                            aria-label={etiqueta}
                          >
                            {esPropio ? (
                              <span className="voto-x">
                                <IonIcon icon={close} aria-hidden="true" />
                              </span>
                            ) : (
                              <img src={reporte.miVoto ? votoVotado : votoDisponible} className="icono-voto-mapa" alt="" />
                            )}
                            {reporte.votos}
                          </button>
                        );
                      })()
                    ) : (
                      <span className="popup-votos">
                        <img src={reporte.miVoto ? votoVotado : votoDisponible} className="icono-voto-mapa" alt="" /> {reporte.votos}
                      </span>
                    )}
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
          className="mapa-boton-estilo mapa-boton-ubicacion"
          onClick={buscarMiUbicacion}
          disabled={gps.buscando}
          title="Centra el mapa en tu ubicación actual"
        >
          {gps.buscando ? (
            <IonSpinner name="crescent" aria-label="Buscando ubicación" />
          ) : (
            <IonIcon icon={locateOutline} aria-hidden="true" />
          )}
          Mi ubicación
        </button>
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
        {errorUbicacion && (
          <p className="mapa-aviso-ubicacion" role="alert">
            {errorUbicacion}
          </p>
        )}
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
