import { useEffect, useState } from 'react';
import { IonBadge, IonButton, IonIcon, IonSearchbar, IonSpinner } from '@ionic/react';
import { funnelOutline, refreshOutline } from 'ionicons/icons';
import AppLayout from '../../components/layout/AppLayout';
import FiltrosActivos from '../../components/reportes/FiltrosActivos';
import FiltrosReportesModal from '../../components/reportes/FiltrosReportesModal';
import MapaReportes from '../../components/reportes/MapaReportes';
import TarjetaReporte from '../../components/reportes/TarjetaReporte';
import { obtenerReportes, type Reporte } from '../../services/reportesService';
import {
  aplicarFiltros,
  FILTROS_INICIALES,
  listarFiltrosActivos,
  type FiltrosReportes,
} from '../../utils/filtrosReportes';
import './Inicio.css';

// Quita tildes y mayúsculas para que "valparaíso" y "Valparaiso" coincidan.
const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

const valoresUnicos = (valores: string[]) =>
  [...new Set(valores)].sort((a, b) => a.localeCompare(b));

const Inicio: React.FC = () => {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtros, setFiltros] = useState<FiltrosReportes>(FILTROS_INICIALES);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [seleccionadoId, setSeleccionadoId] = useState<string>();
  const [votados, setVotados] = useState<Set<string>>(new Set());

  const cargarReportes = async () => {
    setCargando(true);
    setReportes(await obtenerReportes());
    setCargando(false);
  };

  useEffect(() => {
    cargarReportes();
  }, []);

  const termino = normalizar(busqueda.trim());
  const reportesFiltrados = aplicarFiltros(reportes, filtros).filter((reporte) =>
    [reporte.sector, reporte.nombre, reporte.categoria].some((campo) =>
      normalizar(campo).includes(termino),
    ),
  );
  const seleccionado = reportesFiltrados.find((reporte) => reporte.id === seleccionadoId);
  const listaFiltrosActivos = listarFiltrosActivos(filtros);
  const filtrosActivos = listaFiltrosActivos.length;

  const seleccionar = (id: string) => {
    setSeleccionadoId(id);
    document
      .getElementById(`reporte-${id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
      <div className="inicio">
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
          />
        </section>

        <section className="inicio-lista" aria-label="Lista de reportes">
          <p className="inicio-conteo">
            {cargando
              ? 'Cargando reportes...'
              : `${reportesFiltrados.length} reporte${reportesFiltrados.length === 1 ? '' : 's'}`}
          </p>

          <FiltrosActivos activos={listaFiltrosActivos} onCambiar={setFiltros} />

          {!cargando && reportesFiltrados.length === 0 && (
            <p className="inicio-vacio">
              No encontramos reportes con esa búsqueda o filtros.
              {filtrosActivos > 0 && (
                <>
                  {' '}
                  <button
                    type="button"
                    className="inicio-quitar-filtros"
                    onClick={() => setFiltros(FILTROS_INICIALES)}
                  >
                    Quitar filtros
                  </button>
                </>
              )}
            </p>
          )}

          {reportesFiltrados.map((reporte) => (
            <TarjetaReporte
              key={reporte.id}
              reporte={reporte}
              seleccionada={reporte.id === seleccionadoId}
              votado={votados.has(reporte.id)}
              onDetalles={() => seleccionar(reporte.id)}
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
