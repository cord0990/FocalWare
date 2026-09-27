import React, { useState } from 'react';
import {
  IonSearchbar,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent
} from '@ionic/react';
import { filterOutline, arrowForwardOutline } from 'ionicons/icons';
import './Notificaciones.css';

interface Notificacion {
  id: string;
  reporteId: string;
  mensaje: string;
  estado: 'controlado' | 'aceptado' | 'rechazado';
}

interface Props {
  onVerDetalles: (id: string) => void;
}

const MOCK_NOTIFICACIONES: Notificacion[] = [
  {
    id: '1',
    reporteId: 'XXXX',
    mensaje: '¡Tu reporte a sido controlado!, ¡Gracias por ayudar a la comunidad!',
    estado: 'controlado'
  },
  {
    id: '2',
    reporteId: 'XXXX',
    mensaje: '¡Tu reporte a pasado a sido aceptado!',
    estado: 'aceptado'
  },
  {
    id: '3',
    reporteId: 'XXXX',
    mensaje: 'Tu reporte a sido rechazado :(.',
    estado: 'rechazado'
  }
];

const Notificaciones: React.FC<Props> = ({ onVerDetalles }) => {
  const [busqueda, setBusqueda] = useState('');

  const notificacionsFilstrades = MOCK_NOTIFICACIONES.filter(n =>
    n.mensaje.toLowerCase().includes(busqueda.toLowerCase()) ||
    n.reporteId.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="notificaciones-tab-container">
      <div className="buscador-filtro-container">
        <IonButton fill="clear" className="btn-filtro-icon">
          <IonIcon icon={filterOutline} />
        </IonButton>
        <IonSearchbar
          value={busqueda}
          onIonInput={(e) => setBusqueda(e.detail.value!)}
          placeholder=""
          className="searchbar-perfil"
        />
      </div>

      <div className="notificaciones-lista">
        {notificacionsFilstrades.map((notif) => (
          <IonCard key={notif.id} className="tarjeta-notificacion">
            <IonCardContent className="notificacion-content">
              <div className="notificacion-badge-id">
                <span>Reporte</span>
                <span>ID: {notif.reporteId}</span>
              </div>

              <div className="notificacion-body">
                <p className="notificacion-mensaje">{notif.mensaje}</p>

                {notif.estado === 'controlado' && (
                  <div className="notificacion-accion">
                    <IonButton
                      fill="clear"
                      className="btn-ver-detalles"
                      onClick={() => onVerDetalles(notif.id)}
                    >
                      Ver detalles...
                      <IonIcon icon={arrowForwardOutline} slot="end" />
                    </IonButton>
                  </div>
                )}
              </div>
            </IonCardContent>
          </IonCard>
        ))}
      </div>
    </div>
  );
};

export default Notificaciones;
