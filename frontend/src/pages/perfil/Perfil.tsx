import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonIcon,
  IonButton
} from '@ionic/react';
import {
  mailOutline,
  mailUnreadOutline,
  settingsOutline,
  informationCircleOutline,
  logOutOutline
} from 'ionicons/icons';

import AppLayout from '../../components/layout/AppLayout';
import Notificaciones from './Notificaciones';
import Configuracion from './Configuracion';
import DetalleNotificacion from './DetalleNotificacion';
import InformacionTab from './Informacion';
import './Perfil.css';

type TabPerfil = 'notificaciones' | 'configuracion' | 'info' | 'detalle';

const Perfil: React.FC = () => {
  const [tabActiva, setTabActiva] = useState<TabPerfil>('notificaciones');
  const [notificacionSeleccionadaId, setNotificacionSeleccionadaId] = useState<string | null>(null);
  const [tieneNotificaciones, setTieneNotificaciones] = useState<boolean>(true);

  const handleVerDetalle = (id: string) => {
    setNotificacionSeleccionadaId(id);
    setTabActiva('detalle');
  };

  const handleCerrarSesion = () => {
    // TODO: Lógica para cerrar sesión.
  };

  return (
    <AppLayout>
      <div className="perfil-header-tabs">
        <IonSegment
          value={tabActiva === 'detalle' ? 'notificaciones' : tabActiva}
          onIonChange={(e) => setTabActiva(e.detail.value as TabPerfil)}
          className="perfil-segment"
        >
          <IonSegmentButton value="notificaciones" className="perfil-segment-btn">
            <IonIcon icon={tieneNotificaciones ? mailUnreadOutline : mailOutline} />
          </IonSegmentButton>

          <IonSegmentButton value="configuracion" className="perfil-segment-btn">
            <IonIcon icon={settingsOutline} />
          </IonSegmentButton>

          <IonSegmentButton value="info" className="perfil-segment-btn">
            <IonIcon icon={informationCircleOutline} />
          </IonSegmentButton>
        </IonSegment>

        <IonButton
          fill="clear"
          className="btn-cerrar-sesion"
          onClick={handleCerrarSesion}
        >
          Cerrar sesión
        </IonButton>
      </div>

      <div className="perfil-contenido">
        {tabActiva === 'notificaciones' && (
          <Notificaciones onVerDetalles={handleVerDetalle} />
        )}

        {tabActiva === 'configuracion' && (
          <Configuracion />
        )}

        {tabActiva === 'info' && (
          <InformacionTab />
        )}

        {tabActiva === 'detalle' && (
          <DetalleNotificacion
            notificacionId={notificacionSeleccionadaId}
            onVolver={() => setTabActiva('notificaciones')}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Perfil;
