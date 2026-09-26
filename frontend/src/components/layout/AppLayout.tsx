import { IonContent, IonHeader, IonIcon, IonPage, IonToolbar } from '@ionic/react';
import { chevronDownOutline } from 'ionicons/icons';
import MenuLateral from './MenuLateral';
import './AppLayout.css';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => (
  <IonPage>
    <IonHeader className="ion-no-border">
      <IonToolbar className="app-encabezado">
        <div className="app-marca">
          <img src="/logo-focalware.webp" alt="" />
          <span>FocalWare</span>
        </div>
        {/* El menú de la cuenta se implementará más adelante */}
        <button type="button" className="app-cuenta" slot="end" aria-label="Abrir menú de mi cuenta">
          <span className="app-cuenta-texto">
            <strong>Mi cuenta</strong>
            <small>Vecino</small>
          </span>
          <span className="app-avatar" aria-hidden="true">
            V
          </span>
          <IonIcon icon={chevronDownOutline} className="app-cuenta-flecha" aria-hidden="true" />
        </button>
      </IonToolbar>
    </IonHeader>

    <IonContent className="app-contenido" scrollY={false}>
      <div className="app-cuerpo">
        <MenuLateral />
        <main className="app-principal">{children}</main>
      </div>
    </IonContent>
  </IonPage>
);

export default AppLayout;
