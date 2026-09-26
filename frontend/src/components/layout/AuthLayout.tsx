import { IonContent, IonPage } from '@ionic/react';
import Footer from './Footer';
import './AuthLayout.css';

interface AuthLayoutProps {
  titulo: string;
  panelAmplio?: boolean;
  children: React.ReactNode;
}

// Estructura común de Iniciar sesión, Crear cuenta y Recuperar contraseña.
const AuthLayout: React.FC<AuthLayoutProps> = ({ titulo, panelAmplio = false, children }) => (
  <IonPage>
    <IonContent className="auth-contenido">
      <div className="auth-pantalla">
        <main className="auth-fondo">
          <section className={panelAmplio ? 'auth-tarjeta auth-tarjeta-amplia' : 'auth-tarjeta'}>
            <div className="auth-marca">
              <h1 className="auth-titulo">{titulo}</h1>
              <div className="auth-logo">
                <img src="/logo-focalware.webp" alt="" />
                <span>
                  Focal
                  <br />
                  Ware
                </span>
              </div>
            </div>
            <div className="auth-panel">{children}</div>
          </section>
        </main>
        <Footer />
      </div>
    </IonContent>
  </IonPage>
);

export default AuthLayout;