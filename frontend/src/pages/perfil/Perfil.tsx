import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  IonSegment,
  IonSegmentButton,
  IonIcon,
  IonButton
} from '@ionic/react';
import {
  mailOutline,
  mailUnreadOutline,
  settingsOutline,
  informationCircleOutline
} from 'ionicons/icons';

import AppLayout from '../../components/layout/AppLayout';
import Notificaciones, { Notificacion } from './Notificaciones';
import Configuracion from './Configuracion';
import DetalleNotificacion from './DetalleNotificacion';
import InformacionTab from './Informacion';
import './Perfil.css';

type TabPerfil = 'notificaciones' | 'configuracion' | 'info' | 'detalle';

const SECCIONES: TabPerfil[] = ['notificaciones', 'configuracion', 'info'];

// Permite abrir una pestaña directamente con /perfil?seccion=configuracion
const seccionDeLaUrl = (search: string): TabPerfil => {
  const seccion = new URLSearchParams(search).get('seccion') as TabPerfil | null;
  return seccion && SECCIONES.includes(seccion) ? seccion : 'notificaciones';
};

const Perfil: React.FC = () => {
  const { search } = useLocation();
  const [tabActiva, setTabActiva] = useState<TabPerfil>(() => seccionDeLaUrl(search));

  // La página queda abierta al navegar, así que se cambia de pestaña cuando cambia la URL.
  useEffect(() => {
    setTabActiva(seccionDeLaUrl(search));
  }, [search]);
  const [notificacionSeleccionada, setNotificacionSeleccionada] = useState<Notificacion | null>(null);
  const [tieneNotificaciones] = useState<boolean>(true);

  const handleVerDetalle = (notif: Notificacion) => {
    setNotificacionSeleccionada(notif);
    setTabActiva('detalle');
  };

  const handleCerrarSesion = () => {
    // TODO: Lógica para cerrar sesión
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
            notificacion={notificacionSeleccionada}
            onVolver={() => setTabActiva('notificaciones')}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Perfil;
