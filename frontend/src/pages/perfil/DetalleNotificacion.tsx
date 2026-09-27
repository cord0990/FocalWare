import React from 'react';
import {
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonBadge
} from '@ionic/react';
import { arrowBackOutline, checkmarkCircleOutline } from 'ionicons/icons';
import './DetalleNotificacion.css';

interface Props {
  notificacionId: string | null;
  onVolver: () => void;
}

const DetalleNotificacion: React.FC<Props> = ({ notificacionId, onVolver }) => {
  return (
    <div className="detalle-notificacion-container">
      <IonButton fill="clear" className="btn-volver" onClick={onVolver}>
        <IonIcon icon={arrowBackOutline} slot="start" />
        Volver a notificaciones
      </IonButton>

      <IonCard className="tarjeta-detalle">
        <IonCardContent>
          <div className="detalle-header">
            <IonBadge color="success" className="badge-estado">
              <IonIcon icon={checkmarkCircleOutline} />
              Controlado
            </IonBadge>
            <span className="detalle-id">ID Reporte: {notificacionId || 'N/A'}</span>
          </div>

          <h3 className="detalle-titulo">Estado del reporte de incidentes</h3>
          <p className="detalle-texto">
            El reporte ha sido revisado por las autoridades correspondientes y la situación fue controlada en el sector asignado.
          </p>

          <div className="detalle-meta">
            <p><strong>Fecha de actualización:</strong> 26/09/2026</p>
            <p><strong>Ubicación:</strong> Sector Centro</p>
          </div>
        </IonCardContent>
      </IonCard>
    </div>
  );
};

export default DetalleNotificacion;
