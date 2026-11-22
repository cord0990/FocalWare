import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import {
  IonBadge,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonSpinner,
  useIonRouter,
} from '@ionic/react';
import {
  chevronBack,
  chevronForward,
  closeOutline,
  flameOutline,
  funnelOutline,
  helpOutline,
  listOutline,
  locateOutline,
  locationOutline,
  refreshOutline,
  searchOutline,
} from 'ionicons/icons';
import AppLayout from '../../components/layout/AppLayout';
import FiltrosActivos from '../../components/reportes/FiltrosActivos';
import FiltrosReportesModal from '../../components/reportes/FiltrosReportesModal';
import MapaReportes from '../../components/reportes/MapaReportes';
import SinResultados from '../../components/reportes/SinResultados';
import TarjetaReporte from '../../components/reportes/TarjetaReporte';
import { leerAnchoGuardado, useAnchoRedimensionable } from '../../hooks/useAnchoRedimensionable';
import { useIrAlLogin } from '../../hooks/useIrAlLogin';
import { useSectores } from '../../hooks/useSectores';
import { useSesion } from '../../hooks/useSesion';
import { NIVELES_RIESGO, rangoNivel } from '../../utils/riesgo';
import { esCategoriaReporte } from '../../utils/opcionesReporte';
import { fechaHace12Meses } from '../../utils/fechas';
import { rutaDetalleMapa, rutaMunicipalReporte } from '../../routes/rutas';
import {
  EVENTO_REPORTES,
  obtenerReportes,
  apoyarReporte,
  quitarApoyo,
  type Reporte,
} from '../../services/reportesService';
import {
  aplicarFiltros,
  buscarReportes,
  FILTROS_INICIALES,
  listarFiltrosActivos,
  type FiltrosReportes,
} from '../../utils/filtrosReportes';
import './Mapa.css';

const valoresUnicos = <T extends string>(valores: T[]): T[] =>
  [...new Set(valores)].sort((a, b) => a.localeCompare(b));

// Mapa de reportes (RF-03). Es público: sin sesión se puede mirar y filtrar, y para votar
// se pide iniciar sesión (EP 1.4, 3.3).
const Mapa: React.FC = () => {
  const router = useIonRouter();
  const { usuario } = useSesion();
  const irAlLogin = useIrAlLogin();
  const { catalogo, sectores: sectoresCatalogo } = useSectores();
  // El funcionario abre cada reporte en su vista de gestión; el resto, en el detalle público.
  const rutaDetalle = usuario?.rol === 'funcionario' ? rutaMunicipalReporte : rutaDetalleMapa;
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtros, setFiltros] = useState<FiltrosReportes>(FILTROS_INICIALES);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [ayudaAbierta, setAyudaAbierta] = useState(false);
  const [seleccionadoId, setSeleccionadoId] = useState<string>();
  // El calor usa todos los reportes visibles de los últimos 12 meses,
  // sin la búsqueda ni los filtros de la lista: así representa el historial del mapa.
  const reportesCalor = useMemo(
    () => reportes.filter((reporte) => reporte.fecha >= fechaHace12Meses()),
    [reportes],
  );
  const [anchoLista, setAnchoLista] = useState<number | null>(() =>
    leerAnchoGuardado('focalware-ancho-lista'),
  );
  // Ancho que tenía la lista antes de cerrarla, para devolverlo al abrirla.
  const [anchoListaPrevio, setAnchoListaPrevio] = useState<number | null>(null);

  // Un clic en el divisor oculta o muestra la lista completa; arrastrar la ajusta a mano.
  const alternarLista = () => {
    if (anchoLista === 0) {
      setAnchoLista(anchoListaPrevio);
    } else {
      setAnchoListaPrevio(anchoLista);
      setAnchoLista(0);
    }
  };

  const divisor = useAnchoRedimensionable({
    clave: 'focalware-ancho-lista',
    minimo: 320,
    maximoProporcion: 0.6,
    estado: [anchoLista, setAnchoLista],
    onClic: alternarLista,
  });
  const listaCerrada = divisor.ancho === 0;

  const cargarReportes = async () => {
    setCargando(true);
    setReportes(await obtenerReportes());
    setCargando(false);
  };

  useEffect(() => {
    cargarReportes();
    const actualizar = async () => setReportes(await obtenerReportes());
    window.addEventListener(EVENTO_REPORTES, actualizar);
    return () => window.removeEventListener(EVENTO_REPORTES, actualizar);
  }, []);

  useEffect(() => {
    if (!ayudaAbierta) return;
    const alPresionarTecla = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setAyudaAbierta(false);
    };
    window.addEventListener('keydown', alPresionarTecla);
    return () => window.removeEventListener('keydown', alPresionarTecla);
  }, [ayudaAbierta]);

  // Desde "Mis reportes" se llega con /inicio?reporte=ID para ver ese reporte en el mapa.
  const { search } = useLocation();
  const reporteSolicitado = new URLSearchParams(search).get('reporte');

  useEffect(() => {
    if (!reporteSolicitado || cargando) return;
    setBusqueda('');
    setFiltros(FILTROS_INICIALES);
    setSeleccionadoId(reporteSolicitado);
    const espera = setTimeout(
      () =>
        document
          .getElementById(`reporte-${reporteSolicitado}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
      400,
    );
    return () => clearTimeout(espera);
  }, [reporteSolicitado, cargando]);

  const reportesFiltrados = buscarReportes(aplicarFiltros(reportes, filtros), busqueda);
  const seleccionado = reportesFiltrados.find((reporte) => reporte.id === seleccionadoId);
  const listaFiltrosActivos = listarFiltrosActivos(filtros);
  const filtrosActivos = listaFiltrosActivos.length;

  const seleccionar = (id: string) => {
    setSeleccionadoId(id);
    document
      .getElementById(`reporte-${id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const alternarVoto = async (id: string) => {
    if (!usuario) {
      irAlLogin();
      return;
    }

    const actual = reportes.find((reporte) => reporte.id === id);
    const yaVotado = Boolean(actual?.miVoto);

    try {
      const votos = yaVotado ? await quitarApoyo(id) : await apoyarReporte(id);
      setReportes((actuales) =>
        actuales.map((reporte) =>
          reporte.id === id ? { ...reporte, votos, miVoto: !yaVotado } : reporte,
        ),
      );
    } catch {
      setReportes(await obtenerReportes());
    }
  };

  const puedeVotar = (reporte: Reporte) =>
    usuario?.rol !== 'funcionario' && !reporte.esMio;

  const aplicarNuevosFiltros = (nuevos: FiltrosReportes) => {
    setFiltros(nuevos);
    setFiltrosAbiertos(false);
  };

  return (
    <AppLayout>
      <div
        ref={divisor.contenedor}
        className={[
          'inicio',
          divisor.arrastrando ? 'arrastrando' : '',
          listaCerrada ? 'cerrado' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={
          divisor.ancho !== null
            ? ({ '--ancho-lista': `${divisor.ancho}px` } as React.CSSProperties)
            : undefined
        }
      >
        <div className="inicio-barra">
          <IonSearchbar
            className="inicio-buscador"
            placeholder="Buscar por sector, dirección, nombre o categoría"
            value={busqueda}
            debounce={250}
            onIonInput={(e) => setBusqueda(e.detail.value ?? '')}
          />
          <div className="inicio-acciones">
            <IonButton
              fill="solid"
              className="inicio-boton-icono inicio-boton-principal"
              aria-label={
                filtrosActivos ? `Filtrar reportes, ${filtrosActivos} filtros activos` : 'Filtrar reportes'
              }
              onClick={() => setFiltrosAbiertos(true)}
            >
              <IonIcon slot="icon-only" icon={funnelOutline} />
              {filtrosActivos > 0 && (
                <IonBadge className="inicio-filtros-activos">{filtrosActivos}</IonBadge>
              )}
            </IonButton>
            <IonButton
              fill="solid"
              className="inicio-boton-icono inicio-boton-principal"
              aria-label="Actualizar reportes"
              onClick={cargarReportes}
              disabled={cargando}
            >
              {cargando ? (
                <IonSpinner name="crescent" color="light" />
              ) : (
                <IonIcon slot="icon-only" icon={refreshOutline} />
              )}
            </IonButton>
            <button
              type="button"
              className="inicio-boton-icono inicio-boton-ayuda"
              aria-label="Ayuda sobre esta vista"
              aria-expanded={ayudaAbierta}
              onClick={() => setAyudaAbierta(true)}
            >
              <IonIcon icon={helpOutline} aria-hidden="true" />
            </button>
          </div>
        </div>

        <section className="inicio-mapa" aria-label="Mapa de reportes">
          <MapaReportes
            reportes={reportesFiltrados}
            reportesCalor={reportesCalor}
            seleccionado={seleccionado}
            sectores={catalogo?.sectores ?? []}
            sectorSeleccionado={filtros.sector}
            onSeleccionar={seleccionar}
            onVerDetalles={(id) => router.push(rutaDetalle(id), 'forward')}
            onVotar={alternarVoto}
            puedeVotar={puedeVotar}
          />
        </section>

        {/* Solo se muestra en PC: un clic oculta o muestra la lista; arrastrar la ajusta a mano */}
        <div
          className={listaCerrada ? 'inicio-divisor cerrado' : 'inicio-divisor'}
          role="separator"
          aria-orientation="vertical"
          aria-label={
            listaCerrada ? 'Mostrar la lista de reportes' : 'Ocultar la lista de reportes'
          }
          tabIndex={0}
          title={
            listaCerrada
              ? 'Clic para mostrar la lista. Mantén presionado y arrastra para ajustar el ancho.'
              : 'Clic para ocultar la lista. Mantén presionado y arrastra para ajustar el ancho.'
          }
          onPointerDown={divisor.alPresionar}
          onKeyDown={(evento) => {
            if (evento.key === 'Enter' || evento.key === ' ') {
              evento.preventDefault();
              alternarLista();
              return;
            }
            divisor.alTeclado(evento);
          }}
        >
          <span aria-hidden="true" />
          <IonIcon
            className="inicio-divisor-icono"
            icon={listaCerrada ? chevronBack : chevronForward}
            aria-hidden="true"
          />
        </div>

        <section ref={divisor.panel} className="inicio-lista" aria-label="Lista de reportes">
          <div className="inicio-conteo">
            <p aria-live="polite">
              {cargando ? (
                'Cargando reportes...'
              ) : (
                <>
                  <strong>{reportesFiltrados.length}</strong>
                  {reportesFiltrados.length === 1 ? 'reporte' : 'reportes'}
                  {busqueda.trim() || filtrosActivos > 0 ? ' encontrados' : ' en el mapa'}
                </>
              )}
            </p>
            <ul className="inicio-escala" aria-label="Escala de riesgo">
              {[...NIVELES_RIESGO].reverse().map((nivel) => (
                <li key={nivel.nivel} style={{ background: nivel.color, color: nivel.texto }}>
                  <strong>{nivel.etiqueta}</strong>
                  <span>{rangoNivel(nivel)}</span>
                </li>
              ))}
            </ul>
          </div>

          <FiltrosActivos activos={listaFiltrosActivos} onCambiar={setFiltros} />

          {!cargando && reportesFiltrados.length === 0 && (
            <SinResultados
              busqueda={busqueda}
              hayFiltros={filtrosActivos > 0}
              onReiniciar={() => {
                setBusqueda('');
                setFiltros(FILTROS_INICIALES);
              }}
            />
          )}

          {reportesFiltrados.map((reporte) => (
            <TarjetaReporte
              key={reporte.id}
              reporte={reporte}
              seleccionada={reporte.id === seleccionadoId}
              votado={reporte.miVoto}
              puedeVotar={puedeVotar(reporte)}
              onDetalles={() => router.push(rutaDetalle(reporte.id), 'forward')}
              onVotar={() => alternarVoto(reporte.id)}
            />
          ))}
        </section>
      </div>

      <FiltrosReportesModal
        abierto={filtrosAbiertos}
        filtros={filtros}
        sectores={sectoresCatalogo.map((sector) => sector.nombre)}
        categorias={valoresUnicos(
          reportes.map((reporte) => reporte.categoria).filter(esCategoriaReporte),
        )}
        onCerrar={() => setFiltrosAbiertos(false)}
        onAplicar={aplicarNuevosFiltros}
      />

      {ayudaAbierta &&
        createPortal(
          <div
            className="ayuda-mapa-fondo"
            onClick={(evento) => {
              if (evento.target === evento.currentTarget) setAyudaAbierta(false);
            }}
          >
            <div
              className="ayuda-mapa-contenido"
              role="dialog"
              aria-modal="true"
              aria-labelledby="ayuda-mapa-titulo"
            >
              <div className="ayuda-mapa-encabezado">
                <div className="ayuda-mapa-titulo">
                  <span className="ayuda-mapa-insignia" aria-hidden="true">
                    <IonIcon icon={helpOutline} />
                  </span>
                  <h2 id="ayuda-mapa-titulo">Guía rápida del mapa</h2>
                </div>
                <button
                  type="button"
                  className="ayuda-mapa-btn-x"
                  onClick={() => setAyudaAbierta(false)}
                  aria-label="Cerrar guía del mapa"
                >
                  <IonIcon icon={closeOutline} aria-hidden="true" />
                </button>
              </div>

              <ul className="ayuda-mapa-lista">
                <li>
                  <span className="ayuda-mapa-item-icono" aria-hidden="true">
                    <IonIcon icon={searchOutline} />
                  </span>
                  <div>
                    <strong>Buscador</strong>
                    <p>Escribe un sector, cerro, título o tipo de residuo para encontrar reportes al instante.</p>
                  </div>
                </li>
                <li>
                  <span className="ayuda-mapa-item-icono" aria-hidden="true">
                    <IonIcon icon={funnelOutline} />
                  </span>
                  <div>
                    <strong>Filtros y actualizar</strong>
                    <p>Filtra los reportes por estado, nivel de riesgo o sector, y actualiza el mapa para ver los reportes más recientes.</p>
                  </div>
                </li>
                <li>
                  <span className="ayuda-mapa-item-icono" aria-hidden="true">
                    <IonIcon icon={locationOutline} />
                  </span>
                  <div>
                    <strong>Marcadores de riesgo</strong>
                    <p>Cada marcador señala un microbasural y su color indica el nivel de riesgo. Tócalo para resaltarlo.</p>
                  </div>
                </li>
                <li>
                  <span className="ayuda-mapa-item-icono" aria-hidden="true">
                    <IonIcon icon={locateOutline} />
                  </span>
                  <div>
                    <strong>Mi ubicación y vista del mapa</strong>
                    <p>Centra el mapa en tu posición actual o cambia entre mapa simple y mapa detallado.</p>
                  </div>
                </li>
                <li>
                  <span className="ayuda-mapa-item-icono" aria-hidden="true">
                    <IonIcon icon={flameOutline} />
                  </span>
                  <div>
                    <strong>Mapa de calor</strong>
                    <p>Resalta las zonas con mayor acumulación de reportes en los últimos 12 meses.</p>
                  </div>
                </li>
                <li>
                  <span className="ayuda-mapa-item-icono" aria-hidden="true">
                    <IonIcon icon={listOutline} />
                  </span>
                  <div>
                    <strong>Lista de reportes y apoyos</strong>
                    <p>Revisa cada ficha, apoya un reporte para darle prioridad o entra a Detalles.</p>
                  </div>
                </li>
              </ul>

              <button
                type="button"
                className="ayuda-mapa-cerrar"
                onClick={() => setAyudaAbierta(false)}
              >
                Entendido
              </button>
            </div>
          </div>,
          document.body,
        )}
    </AppLayout>
  );
};

export default Mapa;