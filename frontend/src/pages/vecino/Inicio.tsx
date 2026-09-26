import { useEffect, useState } from 'react';
import { IonButton, IonIcon, IonSearchbar, IonSpinner, IonToast } from '@ionic/react';
import { funnelOutline, refreshOutline } from 'ionicons/icons';
import AppLayout from '../../components/layout/AppLayout';
import MapaReportes from '../../components/reportes/MapaReportes';
import TarjetaReporte from '../../components/reportes/TarjetaReporte';
import { obtenerReportes, type Reporte } from '../../services/reportesService';
import './Inicio.css';

// Quita tildes y mayúsculas para que "valparaíso" y "Valparaiso" coincidan.
const normalizar = (texto: string) =>
  texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const Inicio: React.FC = () => {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [seleccionadoId, setSeleccionadoId] = useState<string>();
  const [votados, setVotados] = useState<Set<string>>(new Set());
  const [mensaje, setMensaje] = useState('');

  const cargarReportes = async () => {
    setCargando(true);
    setReportes(await obtenerReportes());
    setCargando(false);
  };

  useEffect(() => {
    cargarReportes();
  }, []);

  const termino = normalizar(busqueda.trim());
  const reportesFiltrados = reportes.filter((reporte) =>
    [reporte.sector, reporte.nombre, reporte.categoria].some((campo) =>
      normalizar(campo).includes(termino),
    ),
  );
  const seleccionado = reportesFiltrados.find((reporte) => reporte.id === seleccionadoId);

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

  return (
    <AppLayout>
      <div className="inicio">
        <div className="inicio-barra">
          <IonButton
            fill="clear"
            className="inicio-boton-icono"
            aria-label="Filtrar reportes"
            onClick={() => setMensaje('Los filtros estarán disponibles pronto.')}
          >
            <IonIcon slot="icon-only" icon={funnelOutline} />
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

          {!cargando && reportesFiltrados.length === 0 && (
            <p className="inicio-vacio">No encontramos reportes para “{busqueda}”.</p>
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

      <IonToast
        isOpen={!!mensaje}
        message={mensaje}
        duration={2500}
        position="top"
        onDidDismiss={() => setMensaje('')}
      />
    </AppLayout>
  );
};

export default Inicio;
