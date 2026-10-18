import React, { useEffect, useState } from 'react';
import {
  IonSearchbar,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonBadge,
} from '@ionic/react';
import { filterOutline, arrowForwardOutline } from 'ionicons/icons';
import FiltrosReportesModal from '../../../components/reportes/FiltrosReportesModal';
import { useSesion } from '../../../hooks/useSesion';
import { obtenerNotificaciones, type Notificacion } from '../../../services/notificacionesService';
import { normalizarTexto } from '../../../utils/texto';
import {
  FILTROS_INICIALES,
  listarFiltrosActivos,
  type FiltrosReportes,
} from '../../../utils/filtrosReportes';
import './Notificaciones.css';

export type { Notificacion };

interface Props {
  onVerDetalles: (notificacion: Notificacion) => void;
}

const parseFechaString = (fechaStr: string): Date | null => {
  if (!fechaStr) return null;
  const partes = fechaStr.split('/');
  if (partes.length === 3) {
    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1;
    const anio = parseInt(partes[2], 10);
    return new Date(anio, mes, dia);
  }
  const fecha = new Date(fechaStr);
  return isNaN(fecha.getTime()) ? null : fecha;
};

const Notificaciones: React.FC<Props> = ({ onVerDetalles }) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtros, setFiltros] = useState<FiltrosReportes>(FILTROS_INICIALES);
  const [modalAbierto, setModalAbierto] = useState(false);

  const filtrosActivos = listarFiltrosActivos(filtros).length;
  // Las notificaciones son del vecino: avisan los cambios de estado de sus reportes.
  const { usuario } = useSesion();
  const esVecino = usuario?.rol === 'vecino';
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!esVecino) {
      setCargando(false);
      return;
    }
    obtenerNotificaciones()
      .then((datos) => setNotificaciones(datos.notificaciones))
      .catch(() => setError('No se pudieron cargar las notificaciones. Intenta de nuevo más tarde.'))
      .finally(() => setCargando(false));
  }, [esVecino]);

  const notificacionesFiltradas = notificaciones.filter((n) => {
    const termino = normalizarTexto(busqueda.trim());
    const coincideTexto =
      !termino ||
      normalizarTexto(n.mensaje).includes(termino) ||
      normalizarTexto(n.tituloReporte).includes(termino) ||
      normalizarTexto(n.reporteId).includes(termino);

    if (!coincideTexto) return false;

    if (filtros.estado && normalizarTexto(n.estado) !== normalizarTexto(filtros.estado)) {
      return false;
    }

    const fechaNotif = parseFechaString(n.fechaCreacion);
    if (fechaNotif) {
      if (filtros.desde) {
        const fechaDesde = parseFechaString(filtros.desde);
        if (fechaDesde && fechaNotif < fechaDesde) return false;
      }

      if (filtros.hasta) {
        const fechaHasta = parseFechaString(filtros.hasta);
        if (fechaHasta && fechaNotif > fechaHasta) return false;
      }
    }

    return true;
  });

  return (
    <div className="notificaciones-tab-container">
      <div className="buscador-filtro-container">
        <IonButton
          fill="clear"
          className="btn-filtro-icon"
          onClick={() => setModalAbierto(true)}
          aria-label={
            filtrosActivos
              ? `Filtrar notificaciones, ${filtrosActivos} activo`
              : 'Filtrar notificaciones'
          }
        >
          <IonIcon icon={filterOutline} />
          {filtrosActivos > 0 && (
            <IonBadge color="danger">{filtrosActivos}</IonBadge>
          )}
        </IonButton>

        <IonSearchbar
          value={busqueda}
          onIonInput={(e) => setBusqueda(e.detail.value ?? '')}
          placeholder="Buscar notificación o ID..."
          className="searchbar-perfil"
          debounce={200}
        />
      </div>

      <div className="notificaciones-lista">
        {!esVecino ? (
          <p className="sin-resultados-texto">
            Las notificaciones son para los vecinos: les avisan cuando cambia el estado de sus reportes.
          </p>
        ) : cargando ? (
          <p className="sin-resultados-texto">Cargando notificaciones...</p>
        ) : error ? (
          <p className="sin-resultados-texto">{error}</p>
        ) : notificaciones.length === 0 ? (
          <p className="sin-resultados-texto">
            Todavía no tienes notificaciones. Te avisaremos cuando cambie el estado de tus reportes.
          </p>
        ) : notificacionesFiltradas.length === 0 ? (
          <p className="sin-resultados-texto">
            No se encontraron notificaciones con los criterios ingresados.
          </p>
        ) : (
          notificacionesFiltradas.map((notif) => (
            <IonCard
              key={notif.id}
              className={notif.leida ? 'tarjeta-notificacion' : 'tarjeta-notificacion no-leida'}
            >
              <IonCardContent className="notificacion-content">
                <div className="notificacion-badge-id">
                  <span>Reporte</span>
                  <span>ID: {notif.reporteId}</span>
                </div>

                <div className="notificacion-body">
                  {!notif.leida && <span className="notificacion-nueva">Nueva</span>}
                  <p className="notificacion-mensaje">{notif.mensaje}</p>

                  <div className="notificacion-accion">
                    <IonButton
                      fill="clear"
                      className="btn-ver-detalles"
                      onClick={() => onVerDetalles(notif)}
                    >
                      Ver detalles...
                      <IonIcon icon={arrowForwardOutline} slot="end" />
                    </IonButton>
                  </div>
                </div>
              </IonCardContent>
            </IonCard>
          ))
        )}
      </div>

      <FiltrosReportesModal
        abierto={modalAbierto}
        filtros={filtros}
        sectores={[]}
        categorias={[]}
        onCerrar={() => setModalAbierto(false)}
        onAplicar={(nuevosFiltros) => {
          setFiltros(nuevosFiltros);
          setModalAbierto(false);
        }}
      />
    </div>
  );
};

export default Notificaciones;
