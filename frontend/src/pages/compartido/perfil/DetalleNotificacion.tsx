import React from 'react';
import { IonIcon } from '@ionic/react';
import { arrowBack, arrowForward } from 'ionicons/icons';
import { buscarNotificacion, type Notificacion } from '../../../services/notificacionesService';
import './DetalleNotificacion.css';

interface Props {
  notificacion?: Notificacion | null;
  notificacionId?: string | null;
  onVolver: () => void;
  onIrADetallesReporte?: () => void;
}

const DetalleNotificacion: React.FC<Props> = ({
  notificacion,
  notificacionId,
  onVolver,
  onIrADetallesReporte
}) => {
  // Resolvemos la notificación activa ya sea desde la prop directa o buscándola por ID
  const notifActiva =
    notificacion ||
    (notificacionId ? buscarNotificacion(notificacionId) : undefined) ||
    null;

  if (!notifActiva) {
    return (
      <div className="detalle-notificacion-container">
        <p>No se encontró información de la notificación.</p>
        <button onClick={onVolver}>Volver</button>
      </div>
    );
  }

  const { estado, fechaCreacion, fechaAprobacion, fechaControl, reporteId } = notifActiva;

  const esRechazado = estado === 'rechazado';
  const esAceptado = estado === 'aceptado' || estado === 'controlado';
  const esControlado = estado === 'controlado';

  const getStepClass = (etapa: 'creacion' | 'aprobacion' | 'control') => {
    if (etapa === 'creacion') return 'step-completado';

    if (etapa === 'aprobacion') {
      if (esRechazado) return 'step-rechazado';
      if (esAceptado) return 'step-completado';
      return 'step-pendiente';
    }

    if (etapa === 'control') {
      if (esControlado) return 'step-actual';
      return 'step-pendiente';
    }

    return '';
  };

  return (
    <div className="detalle-notificacion-container">
      <div className="tarjeta-detalle-custom">
        <button className="btn-volver-link" onClick={onVolver}>
          <span className="icon-circle">
            <IonIcon icon={arrowBack} />
          </span>
          <span>Volver a notificaciones....</span>
        </button>

        <div className="detalle-header-row">
          <div className="badge-reporte-id">
            Reporte ID: {reporteId}
          </div>
          <button className="btn-ir-reporte" onClick={onIrADetallesReporte}>
            <span>Ir a detalles del reporte...</span>
            <span className="icon-circle">
              <IonIcon icon={arrowForward} />
            </span>
          </button>
        </div>

        <div className="timeline-section">
          <div className="timeline-badge-title">Linea de tiempo:</div>

          <div className="timeline-track-container">
            <div className="timeline-line" />

            <div className={`timeline-step ${getStepClass('creacion')}`}>
              <span className="step-label">Fecha de creación</span>
              <div className="step-circle" />
              <span className="step-date">{fechaCreacion || '--/--/----'}</span>
            </div>

            <div className={`timeline-step ${getStepClass('aprobacion')}`}>
              <span className="step-label">
                {esRechazado ? 'Fecha de rechazo' : 'Fecha de aprobación'}
              </span>
              <div className="step-circle" />
              <span className="step-date">{fechaAprobacion || '--/--/----'}</span>
            </div>

            <div className={`timeline-step ${getStepClass('control')}`}>
              <span className="step-label">Fecha de control</span>
              <div className="step-circle" />
              <span className="step-date">{fechaControl || '--/--/----'}</span>
            </div>
          </div>
        </div>

        <h2 className="mensaje-agradecimiento">
          ¡Gracias por contribuir a la comunidad!
        </h2>
      </div>
    </div>
  );
};

export default DetalleNotificacion;
