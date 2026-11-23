import React, { useState } from 'react';
import { IonIcon, useIonRouter } from '@ionic/react';
import { notificationsOutline, personOutline } from 'ionicons/icons';

import AppLayout from '../../../components/layout/AppLayout';
import { useSesion } from '../../../hooks/useSesion';
import { useNotificacionesNoLeidas } from '../../../hooks/useNotificacionesNoLeidas';
import { RUTAS, rutaDetalleMapa } from '../../../routes/rutas';
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
  const { usuario, cerrarSesion } = useSesion();
  // Las notificaciones son del vecino (RF-08): el funcionario entra directo a la configuración.
  const seccionInicial: SeccionPerfil = usuario?.rol === 'funcionario' ? 'configuracion' : seccion;
  const [tabActiva, setTabActiva] = useState<TabPerfil>(seccionInicial);
  const [notificacionSeleccionada, setNotificacionSeleccionada] = useState<Notificacion | null>(null);

  const handleVerDetalle = (notif: Notificacion) => {
    setNotificacionSeleccionada(notif);
    setTabActiva('detalle');
  };

  const router = useIonRouter();
  const noLeidas = useNotificacionesNoLeidas();
  // Las notificaciones son del vecino; el funcionario solo ve sus datos.
  const esVecino = usuario?.rol === 'vecino';
  const pestanaActiva: SeccionPerfil = tabActiva === 'configuracion' ? 'configuracion' : 'notificaciones';

  const irA = (nueva: SeccionPerfil) => {
    if (nueva !== seccion) router.push(RUTA_SECCION[nueva], 'forward');
    else setTabActiva(nueva);
  };

  const handleCerrarSesion = () => {
    cerrarSesion();
    router.push(RUTAS.login, 'root', 'replace');
  };

  return (
    <AppLayout>
      <div className="perfil-cabecera">
        <h1 className="perfil-titulo">Mi perfil</h1>
        {/* Pestañas con nombre: el vecino tiene sus datos y sus notificaciones */}
        {esVecino && (
          <nav className="perfil-pestanas" aria-label="Secciones del perfil">
            <button
              type="button"
              className={pestanaActiva === 'configuracion' ? 'perfil-pestana activa' : 'perfil-pestana'}
              aria-current={pestanaActiva === 'configuracion' ? 'page' : undefined}
              onClick={() => irA('configuracion')}
            >
              <IonIcon icon={personOutline} aria-hidden="true" />
              Mis datos
            </button>
            <button
              type="button"
              className={pestanaActiva === 'notificaciones' ? 'perfil-pestana activa' : 'perfil-pestana'}
              aria-current={pestanaActiva === 'notificaciones' ? 'page' : undefined}
              onClick={() => irA('notificaciones')}
            >
              <IonIcon icon={notificationsOutline} aria-hidden="true" />
              Notificaciones
              {noLeidas > 0 && (
                <span className="perfil-pestana-contador" aria-label={`${noLeidas} sin leer`}>
                  {noLeidas > 99 ? '99+' : noLeidas}
                </span>
              )}
            </button>
          </nav>
        )}
      </div>

      <div className="perfil-contenido">
        {tabActiva === 'notificaciones' && (
          <Notificaciones onVerDetalles={handleVerDetalle} />
        )}

        {tabActiva === 'configuracion' && (
          <Configuracion onCerrarSesion={handleCerrarSesion} />
        )}

        {tabActiva === 'detalle' && (
          <DetalleNotificacion
            notificacion={notificacionSeleccionada}
            onVolver={() => setTabActiva('notificaciones')}
            onIrADetallesReporte={(reporteId) => router.push(rutaDetalleMapa(reporteId), 'forward')}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Perfil;
