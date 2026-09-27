import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  IonBadge,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonSpinner,
  useIonRouter,
} from '@ionic/react';
import { funnelOutline, refreshOutline } from 'ionicons/icons';
import AppLayout from '../../components/layout/AppLayout';
import FiltrosActivos from '../../components/reportes/FiltrosActivos';
import FiltrosReportesModal from '../../components/reportes/FiltrosReportesModal';
import MapaReportes from '../../components/reportes/MapaReportes';
import SinResultados from '../../components/reportes/SinResultados';
import TarjetaReporte from '../../components/reportes/TarjetaReporte';
import { useAnchoRedimensionable } from '../../hooks/useAnchoRedimensionable';
import { NIVELES_RIESGO, rangoNivel } from '../../utils/riesgo';
import { rutaReporte } from '../../routes/rutas';
import { EVENTO_REPORTES, obtenerReportes, type Reporte } from '../../services/reportesService';
import {
  aplicarFiltros,
  buscarReportes,
  FILTROS_INICIALES,
  listarFiltrosActivos,
  type FiltrosReportes,
} from '../../utils/filtrosReportes';
import './Inicio.css';

const valoresUnicos = (valores: string[]) =>
  [...new Set(valores)].sort((a, b) => a.localeCompare(b));

const Inicio: React.FC = () => {
  const router = useIonRouter();
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtros, setFiltros] = useState<FiltrosReportes>(FILTROS_INICIALES);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [seleccionadoId, setSeleccionadoId] = useState<string>();
  const [votados, setVotados] = useState<Set<string>>(new Set());
  const divisor = useAnchoRedimensionable({
    clave: 'focalware-ancho-lista',
    minimo: 320,
    maximoProporcion: 0.6,
  });

  const cargarReportes = async () => {
    setCargando(true);
    setReportes(await obtenerReportes());
    setCargando(false);
  };

  useEffect(() => {
    cargarReportes();
    // Cuando se crea o modifica un reporte, la lista se actualiza sin mostrar la carga.
    const actualizar = async () => setReportes(await obtenerReportes());
    window.addEventListener(EVENTO_REPORTES, actualizar);
    return () => window.removeEventListener(EVENTO_REPORTES, actualizar);
  }, []);

  // Desde "Mis reportes" se llega con /inicio?reporte=ID para ver ese reporte en el mapa.
  const { search } = useLocation();
  const reporteSolicitado = new URLSearchParams(search).get('reporte');

  useEffect(() => {
    if (!reporteSolicitado || cargando) return;
    setBusqueda('');
    setFiltros(FILTROS_INICIALES);
    setSeleccionadoId(reporteSolicitado);
    // Espera a que termine la animación de entrada antes de desplazar la lista.
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

  const alternarVoto = (id: string) =>
    setVotados((actuales) => {
      const nuevos = new Set(actuales);
      if (nuevos.has(id)) nuevos.delete(id);
      else nuevos.add(id);
      return nuevos;
    });

  const aplicarNuevosFiltros = (nuevos: FiltrosReportes) => {
    setFiltros(nuevos);
    setFiltrosAbiertos(false);
  };

  return (
    <AppLayout>
      <div
        ref={divisor.contenedor}
        className={divisor.arrastrando ? 'inicio arrastrando' : 'inicio'}
        style={
          divisor.ancho ? ({ '--ancho-lista': `${divisor.ancho}px` } as React.CSSProperties) : undefined
        }
      >
        <div className="inicio-barra">
          <IonButton
            fill="clear"
            className="inicio-boton-icono"
            aria-label={
              filtrosActivos ? `Filtrar reportes, ${filtrosActivos} filtros activos` : 'Filtrar reportes'
            }
            onClick={() => setFiltrosAbiertos(true)}
          >
            <IonIcon slot="icon-only" icon={funnelOutline} />
            {filtrosActivos > 0 && <IonBadge className="inicio-filtros-activos">{filtrosActivos}</IonBadge>}
          </IonButton>
          <IonSearchbar
            className="inicio-buscador"
            placeholder="Buscar por sector, nombre o categoría"
            value={busqueda}
            debounce={250}
            onIonInput={(e) => setBusqueda(e.detail.value ?? '')}
          />
          <IonButton
            fill="clear"
            className="inicio-boton-icono"
            aria-label="Actualizar reportes"
            onClick={cargarReportes}
            disabled={cargando}
          >
            {cargando ? (
              <IonSpinner name="crescent" />
            ) : (
              <IonIcon slot="icon-only" icon={refreshOutline} />
            )}
          </IonButton>
        </div>

        <section className="inicio-mapa" aria-label="Mapa de reportes">
          <MapaReportes
            reportes={reportesFiltrados}
            seleccionado={seleccionado}
            onSeleccionar={seleccionar}
            onVerDetalles={(id) => router.push(rutaReporte(id), 'forward')}
          />
        </section>

        {/* Solo se muestra en PC: se arrastra para cambiar el ancho de la lista */}
        <div
          className="inicio-divisor"
          role="separator"
          aria-orientation="vertical"
          aria-label="Cambiar el ancho de la lista de reportes"
          tabIndex={0}
          title="Arrastra para cambiar el ancho. Doble clic para restablecer."
          onPointerDown={divisor.alPresionar}
          onKeyDown={divisor.alTeclado}
          onDoubleClick={divisor.restablecer}
        >
          <span aria-hidden="true" />
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
              votado={votados.has(reporte.id)}
              onDetalles={() => router.push(rutaReporte(reporte.id), 'forward')}
              onVotar={() => alternarVoto(reporte.id)}
            />
          ))}
        </section>
      </div>

      <FiltrosReportesModal
        abierto={filtrosAbiertos}
        filtros={filtros}
        sectores={valoresUnicos(reportes.map((reporte) => reporte.sector))}
        categorias={valoresUnicos(reportes.map((reporte) => reporte.categoria))}
        onCerrar={() => setFiltrosAbiertos(false)}
        onAplicar={aplicarNuevosFiltros}
      />
    </AppLayout>
  );
};

export default Inicio;
