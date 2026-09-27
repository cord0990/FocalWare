import React, { useState } from 'react';
import {
  IonInput,
  IonButton,
  IonIcon,
  IonAvatar
} from '@ionic/react';
import { pencilOutline } from 'ionicons/icons';
import './Configuracion.css';

const Configuracion: React.FC = () => {
  const [username, setUsername] = useState('Vecino');
  const [email, setEmail] = useState('*******************.com');

  const handleDescartar = () => {
    setUsername('Vecino');
    setEmail('*******************.com');
  };

  const handleAceptar = () => {
    // TODO: Función para aceptar cambios
  };

  return (
    <div className="configuracion-tab-container">
      <div className="configuracion-grid">
        <div className="avatar-seccion">
          <IonAvatar className="perfil-avatar-large">
            <div className="avatar-placeholder-text">V</div>
          </IonAvatar>
        </div>

        <div className="formulario-seccion">
          <div className="campo-grupo">
            <label className="campo-label">Nombre de usuario:</label>
            <div className="input-con-icono">
              <IonInput
                value={username}
                onIonInput={(e) => setUsername(e.detail.value!)}
                className="input-custom"
              />
              <IonIcon icon={pencilOutline} className="input-icono-edit" />
            </div>
          </div>

          <div className="campo-grupo">
            <label className="campo-label">Correo electronico:</label>
            <div className="input-con-icono">
              <IonInput
                value={email}
                onIonInput={(e) => setEmail(e.detail.value!)}
                className="input-custom"
              />
              <IonIcon icon={pencilOutline} className="input-icono-edit" />
            </div>
          </div>

          <div className="btn-cambiar-pass-container">
            <IonButton className="btn-cambiar-pass">
              Cambiar Contraseña
            </IonButton>
          </div>
        </div>
      </div>

      <div className="configuracion-acciones">
        <IonButton className="btn-descartar" onClick={handleDescartar}>
          Descartar Cambios
        </IonButton>
        <IonButton className="btn-aceptar" onClick={handleAceptar}>
          Aceptar cambios
        </IonButton>
      </div>
    </div>
  );
};

export default Configuracion;
