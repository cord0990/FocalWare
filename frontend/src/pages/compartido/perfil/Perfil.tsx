import React, { useState } from 'react';
import {
  IonSegment,
  IonSegmentButton,
  IonIcon,
  IonButton,
  useIonRouter
} from '@ionic/react';
import {
  mailOutline,
  mailUnreadOutline,
  settingsOutline,
  informationCircleOutline
} from 'ionicons/icons';

import AppLayout from '../../../components/layout/AppLayout';
import { useSesion } from '../../../hooks/useSesion';
import { RUTAS } from '../../../routes/rutas';
import Notificaciones, { Notificacion } from './Notificaciones';
import Configuracion from './Configuracion';
import DetalleNotificacion from './DetalleNotificacion';
import InformacionTab from './Informacion';
import './Perfil.css';

type TabPerfil = 'notificaciones' | 'configuracion' | 'info' | 'detalle';

type SeccionPerfil = Exclude<TabPerfil, 'detalle'>;

// Cada pestaña tiene su propia ruta (EP 1.4): /mi-perfil, /mi-perfil/configuracion y /mi-perfil/terminos.
const RUTA_SECCION: Record<SeccionPerfil, string> = {
  notificaciones: RUTAS.perfil,
  configuracion: RUTAS.perfilConfiguracion,
  info: RUTAS.perfilTerminos,
};

const Perfil: React.FC<{ seccion: SeccionPerfil }> = ({ seccion }) => {
  const [tabActiva, setTabActiva] = useState<TabPerfil>(seccion);
  const [notificacionSeleccionada, setNotificacionSeleccionada] = useState<Notificacion | null>(null);
  const [tieneNotificaciones] = useState<boolean>(true);

  const handleVerDetalle = (notif: Notificacion) => {
    setNotificacionSeleccionada(notif);
    setTabActiva('detalle');
  };

  const router = useIonRouter();
  const { cerrarSesion } = useSesion();

  const handleCerrarSesion = () => {
    cerrarSesion();
    router.push(RUTAS.login, 'root', 'replace');
  };

  return (
    <AppLayout>
      <div className="perfil-header-tabs">
        <IonSegment
          value={tabActiva === 'detalle' ? 'notificaciones' : tabActiva}
          onIonChange={(e) => {
            const nueva = e.detail.value as SeccionPerfil;
            if (nueva !== seccion) router.push(RUTA_SECCION[nueva], 'none', 'replace');
            else setTabActiva(nueva);
          }}
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
