import React from 'react';
import { IonCard, IonCardContent, IonIcon } from '@ionic/react';
import { informationCircleOutline, shieldCheckmarkOutline, documentTextOutline } from 'ionicons/icons';
import './Informacion.css';

const Informacion: React.FC = () => {
  return (
    <div className="informacion-tab-container">
      <IonCard className="tarjeta-info">
        <IonCardContent>
          <div className="info-header">
            <IonIcon icon={informationCircleOutline} className="info-icono-main" />
            <h2>Acerca de la Aplicación</h2>
          </div>
          <p className="info-descripcion">
            Plataforma vecinal para el reporte y seguimiento de incidentes en la comunidad.
          </p>
          
          <div className="info-seccion">
            <h3><IonIcon icon={shieldCheckmarkOutline} /> Versión</h3>
            <p>1.0.0</p>
          </div>

          <div className="info-seccion">
            <h3>Soporte</h3>
            <p>soporte@vecinos.com</p>
          </div>

          <div className="info-seccion">
            <h3><IonIcon icon={documentTextOutline} /> Términos y Condiciones</h3>
            <div className="terminos-texto-container">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                Ut enim ad minim veniam,
                quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
              <p>
                Curabitur pretium tiddunt lacus.
                Nulla gravida orci a odio.
                Nullam varius, turpis et commodo pharetra, est eros bibendum elit,
                nec luctus magna felis sollicitudin mauris.
                Integer in mauris eu nibh euismod gravida.
                Duis ac tellus et risus vulputate vehicula.
                Donec lobortis risus a elit. Etiam dui sem, fermentum vitae, sagittis id, malesuada in, quam.
              </p>
              <p>
                Fusce ac turpis quis ligula lacinia aliquet.
                Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, quim.
                Quisque volutpat condimentum velit.
                Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
                Nam nec ante. Sed lacinia urna non tincidunt mattis.
              </p>
              <p>
                Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi.
                Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris.
                Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla.
                Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
              </p>
            </div>
          </div>
        </IonCardContent>
      </IonCard>
    </div>
  );
};

export default Informacion;
