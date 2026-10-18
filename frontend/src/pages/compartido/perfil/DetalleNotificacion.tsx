import React, { useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import { arrowBack, arrowForward } from 'ionicons/icons';
import { marcarNotificacionLeida, type Notificacion } from '../../../services/notificacionesService';
import './DetalleNotificacion.css';

interface Props {
  notificacion?: Notificacion | null;
  onVolver: () => void;
  onIrADetallesReporte?: (reporteId: string) => void;
}

const DetalleNotificacion: React.FC<Props> = ({ notificacion, onVolver, onIrADetallesReporte }) => {
  // Al abrir una notificación nueva, se marca como leída en la API.
  useEffect(() => {
    if (notificacion && !notificacion.leida) {
      marcarNotificacionLeida(notificacion.id).catch(() => {
        // Si falla, la notificación sigue como no leída y se puede volver a abrir.
      });
    }
  }, [notificacion]);

  if (!notificacion) {
    return (
      <div className="detalle-notificacion-container">
        <p>No se encontró información de la notificación.</p>
        <button onClick={onVolver}>Volver</button>
      </div>
    );
  }

  const { fechaCreacion, fechaAprobacion, fechaRechazo, fechaControl, reporteId } = notificacion;

  // La línea de tiempo se arma con las fechas que ya pasaron en la revisión del reporte.
  const esRechazado = Boolean(fechaRechazo);
  const esAceptado = Boolean(fechaAprobacion);
  const esControlado = Boolean(fechaControl);

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
          {reporteId && (
            <button className="btn-ir-reporte" onClick={() => onIrADetallesReporte?.(reporteId)}>
              <span>Ir a detalles del reporte...</span>
              <span className="icon-circle">
                <IonIcon icon={arrowForward} />
              </span>
            </button>
          )}
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
              <span className="step-date">
                {(esRechazado ? fechaRechazo : fechaAprobacion) || '--/--/----'}
              </span>
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
