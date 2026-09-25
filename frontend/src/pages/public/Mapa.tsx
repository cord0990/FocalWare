import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

const Mapa: React.FC = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Mapa</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent className="ion-padding">
      Página del mapa
    </IonContent>
  </IonPage>
);

export default Mapa;