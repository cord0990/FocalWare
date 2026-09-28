import React, { useState } from 'react';
import {
  IonSegment,
  IonSegmentButton,
  IonIcon,
  IonButton,
  useIonRouter
} from '@ionic/react';
import { settingsOutline } from 'ionicons/icons';

import AppLayout from '../../../components/layout/AppLayout';
import { useSesion } from '../../../hooks/useSesion';
import { RUTAS } from '../../../routes/rutas';
import Notificaciones, { Notificacion } from './Notificaciones';
import Configuracion from './Configuracion';
import DetalleNotificacion from './DetalleNotificacion';
import './Perfil.css';

type TabPerfil = 'notificaciones' | 'configuracion' | 'detalle';

type SeccionPerfil = Exclude<TabPerfil, 'detalle'>;

// Cada vista tiene su propia ruta: /mi-perfil (notificaciones) y /mi-perfil/configuracion.
const RUTA_SECCION: Record<SeccionPerfil, string> = {
  notificaciones: RUTAS.perfil,
  configuracion: RUTAS.perfilConfiguracion,
};

const Perfil: React.FC<{ seccion: SeccionPerfil }> = ({ seccion }) => {
  const [tabActiva, setTabActiva] = useState<TabPerfil>(seccion);
  const [notificacionSeleccionada, setNotificacionSeleccionada] = useState<Notificacion | null>(null);

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
          value={tabActiva === 'configuracion' ? 'configuracion' : undefined}
          onIonChange={(e) => {
            const nueva = e.detail.value as SeccionPerfil;
            if (nueva !== seccion) router.push(RUTA_SECCION[nueva], 'none', 'replace');
            else setTabActiva(nueva);
          }}
          className="perfil-segment"
        >
          <IonSegmentButton value="configuracion" className="perfil-segment-btn">
            <IonIcon icon={settingsOutline} />
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
