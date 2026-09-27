import { useEffect, useRef, useState } from 'react';
import {
  IonBadge,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonSpinner,
  IonToast,
  useIonAlert,
  useIonRouter,
} from '@ionic/react';
import {
  addOutline,
  arrowBackOutline,
  cloudOfflineOutline,
  cloudUploadOutline,
  folderOpen,
  funnelOutline,
} from 'ionicons/icons';
import AppLayout from '../../components/layout/AppLayout';
import FiltrosActivos from '../../components/reportes/FiltrosActivos';
import FiltrosReportesModal from '../../components/reportes/FiltrosReportesModal';
import SinResultados from '../../components/reportes/SinResultados';
import TarjetaPendiente from '../../components/reportes/TarjetaPendiente';
import TarjetaReporte from '../../components/reportes/TarjetaReporte';
import { useConexion } from '../../hooks/useConexion';
import { usePendientes } from '../../hooks/usePendientes';
import { RUTAS } from '../../routes/rutas';
import { eliminarPendiente, enviarPendientes } from '../../services/pendientesService';
import { ESTADOS_REPORTE, obtenerMisReportes, type Reporte } from '../../services/reportesService';
import { ESTILO_ESTADO } from '../../utils/estados';
import {
  aplicarFiltros,
  buscarReportes,
  FILTROS_MIS_REPORTES,
  listarFiltrosActivos,
  type FiltrosReportes,
} from '../../utils/filtrosReportes';
import './MisReportes.css';

const valoresUnicos = (valores: string[]) =>
  [...new Set(valores)].sort((a, b) => a.localeCompare(b));

const MisReportes: React.FC = () => {
  const router = useIonRouter();
  const [mostrarAlerta] = useIonAlert();
  const enLinea = useConexion();
  const pendientes = usePendientes();

  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtros, setFiltros] = useState<FiltrosReportes>(FILTROS_MIS_REPORTES);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; exito: boolean } | null>(null);

  const cargarReportes = () =>
    obtenerMisReportes().then((datos) => {
      setReportes(datos);
      setCargando(false);
    });

  useEffect(() => {
    cargarReportes();
  }, []);

  const enviar = async () => {
    setEnviando(true);
    const cantidad = await enviarPendientes();
    await cargarReportes();
    setEnviando(false);
    setMensaje({
      texto:
        `${cantidad === 1 ? 'Se envió 1 reporte' : `Se enviaron ${cantidad} reportes`}. ` +
        'Ya aparecen en tu lista con estado Pendiente.',
      exito: true,
    });
  };

  // Cuando la conexión vuelve (pasa de sin conexión a en línea), los pendientes se envían solos.
  const estabaEnLinea = useRef(enLinea);
  useEffect(() => {
    if (enLinea && !estabaEnLinea.current && pendientes.length > 0) enviar();
    estabaEnLinea.current = enLinea;
    // Solo debe reaccionar al cambio de conexión, no a cada cambio de la lista.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enLinea]);

  const confirmarEliminar = (id: string, nombre: string) =>
    mostrarAlerta({
      header: 'Eliminar borrador',
      message: `"${nombre}" se borrará de tu teléfono y no se enviará.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => eliminarPendiente(id) },
      ],
    });

  const listaFiltrosActivos = listarFiltrosActivos(filtros, FILTROS_MIS_REPORTES);
  const filtrosActivos = listaFiltrosActivos.length;
  const reportesFiltrados = buscarReportes(aplicarFiltros(reportes, filtros), busqueda);
  const contarEstado = (estado: string) =>
    reportes.filter((reporte) => reporte.estado === estado).length;

  return (
    <AppLayout>
      <div className="mis-reportes">
        <header className="mis-reportes-encabezado">
          <button
            type="button"
            className="mis-reportes-volver"
            onClick={() => router.push(RUTAS.inicio, 'back')}
            aria-label="Volver al mapa"
          >
            <IonIcon icon={arrowBackOutline} aria-hidden="true" />
          </button>
          <span className="mis-reportes-icono">
            <IonIcon icon={folderOpen} aria-hidden="true" />
          </span>
          <div className="mis-reportes-titulo">
            <h1>Mis reportes</h1>
            <p>Revisa el estado de lo que has reportado y los envíos pendientes.</p>
          </div>
          <IonButton
            className="mis-reportes-nuevo"
            onClick={() => router.push(RUTAS.crearReporte, 'root')}
          >
            <IonIcon slot="start" icon={addOutline} />
            Nuevo reporte
          </IonButton>
        </header>

        {pendientes.length > 0 && (
          <section className={enLinea ? 'pendientes' : 'pendientes sin-conexion'} aria-live="polite">
            <div className="pendientes-aviso">
              <span className="pendientes-aviso-icono">
                <IonIcon icon={enLinea ? cloudUploadOutline : cloudOfflineOutline} aria-hidden="true" />
              </span>
              <div className="pendientes-aviso-texto">
                <strong>
                  {pendientes.length}{' '}
                  {pendientes.length === 1 ? 'reporte pendiente' : 'reportes pendientes'} de envío
                </strong>
                <span>
                  {enLinea
                    ? 'Se guardaron cuando no tenías conexión. Ya puedes enviarlos.'
                    : 'Sin conexión. Se enviarán automáticamente cuando vuelvas a tener internet.'}
                </span>
              </div>
              <IonButton
                className="pendientes-reintentar"
                onClick={enviar}
                disabled={!enLinea || enviando}
              >
                {enviando ? <IonSpinner name="crescent" /> : 'Reintentar'}
              </IonButton>
            </div>

            <div className="pendientes-lista">
              {pendientes.map((pendiente) => (
                <TarjetaPendiente
                  key={pendiente.id}
                  pendiente={pendiente}
                  onEliminar={() => confirmarEliminar(pendiente.id, pendiente.nombre)}
                />
              ))}
            </div>
          </section>
        )}

        <section className="mis-reportes-panel" aria-label="Reportes enviados">
          <div className="mis-reportes-estados" role="tablist" aria-label="Filtrar por estado">
            {['', ...ESTADOS_REPORTE].map((estado) => {
              const activo = filtros.estado === estado;
              const color = estado ? ESTILO_ESTADO[estado as keyof typeof ESTILO_ESTADO].color : '#1f1f1f';
              return (
                <button
                  key={estado || 'todos'}
                  type="button"
                  role="tab"
                  aria-selected={activo}
                  className={activo ? 'estado-pestana activa' : 'estado-pestana'}
                  style={{ '--color-estado': color } as React.CSSProperties}
                  onClick={() => setFiltros({ ...filtros, estado })}
                >
                  {estado || 'Todos'}
                  <span>{estado ? contarEstado(estado) : reportes.length}</span>
                </button>
              );
            })}
          </div>

          <div className="mis-reportes-barra">
            <IonButton
              fill="outline"
              className="mis-reportes-filtro"
              aria-label={
                filtrosActivos ? `Filtros, ${filtrosActivos} filtros activos` : 'Filtros'
              }
              onClick={() => setFiltrosAbiertos(true)}
            >
              <IonIcon slot="start" icon={funnelOutline} />
              Filtros
              {filtrosActivos > 0 && (
                <IonBadge className="mis-reportes-contador-filtros">{filtrosActivos}</IonBadge>
              )}
            </IonButton>
            <IonSearchbar
              className="mis-reportes-buscador"
              placeholder="Buscar reporte"
              value={busqueda}
              debounce={250}
              onIonInput={(e) => setBusqueda(e.detail.value ?? '')}
            />
          </div>

          <FiltrosActivos
            activos={listaFiltrosActivos}
            base={FILTROS_MIS_REPORTES}
            onCambiar={setFiltros}
          />

          {cargando ? (
            <div className="mis-reportes-cargando">
              <IonSpinner name="crescent" /> Cargando tus reportes...
            </div>
          ) : reportesFiltrados.length === 0 ? (
            <SinResultados
              busqueda={busqueda}
              hayFiltros={filtrosActivos > 0}
              onReiniciar={() => {
                setBusqueda('');
                setFiltros(FILTROS_MIS_REPORTES);
              }}
            />
          ) : (
            <div className="mis-reportes-grilla">
              {reportesFiltrados.map((reporte) => (
                <div key={reporte.id} className="mis-reportes-celda">
                  <TarjetaReporte
                    reporte={reporte}
                    mostrarEstado
                    puedeVotar={false}
                    onDetalles={() =>
                      reporte.riesgoEnCalculo
                        ? setMensaje({
                            texto: 'Este reporte aparecerá en el mapa cuando el municipio lo revise.',
                            exito: false,
                          })
                        : router.push(`${RUTAS.inicio}?reporte=${reporte.id}`, 'root')
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <FiltrosReportesModal
        abierto={filtrosAbiertos}
        filtros={filtros}
        sectores={valoresUnicos(reportes.map((reporte) => reporte.sector))}
        categorias={valoresUnicos(reportes.map((reporte) => reporte.categoria))}
        base={FILTROS_MIS_REPORTES}
        onCerrar={() => setFiltrosAbiertos(false)}
        onAplicar={(nuevos) => {
          setFiltros(nuevos);
          setFiltrosAbiertos(false);
        }}
      />

      <IonToast
        isOpen={!!mensaje}
        message={mensaje?.texto}
        duration={3000}
        color={mensaje?.exito ? 'success' : 'dark'}
        position="top"
        onDidDismiss={() => setMensaje(null)}
      />
    </AppLayout>
  );
};

export default MisReportes;
