import React, { useState } from 'react';
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
import { normalizarTexto } from '../../../utils/texto';
import {
  FILTROS_INICIALES,
  listarFiltrosActivos,
  type FiltrosReportes,
} from '../../../utils/filtrosReportes';
import './Notificaciones.css';

export interface Notificacion {
  id: string;
  reporteId: string;
  mensaje: string;
  estado: 'controlado' | 'aceptado' | 'rechazado';
  fechaCreacion: string;
  fechaAprobacion?: string;
  fechaControl?: string;
  fechaRechazo?: string;
}

interface Props {
  onVerDetalles: (notificacion: Notificacion) => void;
}

export const MOCK_NOTIFICACIONES: Notificacion[] = [
  {
    id: 'notif-8f3a91b2',
    reporteId: 'REP-2026-0482',
    mensaje: '¡Tu reporte ha sido controlado!, ¡Gracias por ayudar a la comunidad!',
    estado: 'controlado',
    fechaCreacion: '12/03/2026',
    fechaAprobacion: '14/03/2026',
    fechaControl: '20/03/2026',
  },
  {
    id: 'notif-4c1e78a9',
    reporteId: 'REP-2026-0391',
    mensaje: '¡Tu reporte ha sido aceptado!',
    estado: 'aceptado',
    fechaCreacion: '01/03/2026',
    fechaAprobacion: '05/03/2026',
  },
  {
    id: 'notif-1b9d45e3',
    reporteId: 'REP-2026-0215',
    mensaje: 'Tu reporte ha sido rechazado.',
    estado: 'rechazado',
    fechaCreacion: '10/02/2026',
    fechaRechazo: '10/02/2026',
  },
];

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

  const notificacionesFiltradas = MOCK_NOTIFICACIONES.filter((n) => {
    const termino = normalizarTexto(busqueda.trim());
    const coincideTexto =
      !termino ||
      normalizarTexto(n.mensaje).includes(termino) ||
      normalizarTexto(n.reporteId).includes(termino);

    if (!coincideTexto) return false;

    if (filtros.estado) {
      const estadoFiltro = normalizarTexto(filtros.estado);
      const estadoNotif = normalizarTexto(n.estado);

      const coincideEstado =
        (estadoFiltro === 'aprobado' || estadoFiltro === 'aceptado')
          ? (estadoNotif === 'aceptado' || estadoNotif === 'controlado')
          : estadoNotif === estadoFiltro;

      if (!coincideEstado) return false;
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
        {notificacionesFiltradas.length === 0 ? (
          <p className="sin-resultados-texto">
            No se encontraron notificaciones con los criterios ingresados.
          </p>
        ) : (
          notificacionesFiltradas.map((notif) => (
            <IonCard key={notif.id} className="tarjeta-notificacion">
              <IonCardContent className="notificacion-content">
                <div className="notificacion-badge-id">
                  <span>Reporte</span>
                  <span>ID: {notif.reporteId}</span>
                </div>

                <div className="notificacion-body">
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
