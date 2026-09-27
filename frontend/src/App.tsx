import { Navigate, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Login from './pages/public/Login';
import Registro from './pages/public/Registro';
import RecuperarContrasena from './pages/public/RecuperarContrasena';
import Inicio from './pages/vecino/Inicio';
import EnConstruccion from './pages/vecino/EnConstruccion';
import Ayuda from './pages/ayuda/Ayuda';
import MenuProvider from './context/MenuProvider';
import MenuCuenta from './components/layout/MenuCuenta';
import { RUTAS } from './routes/rutas';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
/* Desactivado hasta diseñar el modo oscuro: con esta paleta activa, los componentes
   de Ionic se ven negros cuando el sistema del usuario está en modo oscuro. */
/* import '@ionic/react/css/palettes/dark.system.css'; */

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <MenuProvider>
      <IonReactRouter>
        <MenuCuenta contentId="contenido-principal" />
        <IonRouterOutlet id="contenido-principal">
          <Route path={RUTAS.login} element={<Login />} />
          <Route path={RUTAS.registro} element={<Registro />} />
          <Route path={RUTAS.recuperar} element={<RecuperarContrasena />} />
          <Route path={RUTAS.inicio} element={<Inicio />} />
          <Route path={RUTAS.misReportes} element={<EnConstruccion titulo="Mis reportes" />} />
          <Route path={RUTAS.crearReporte} element={<EnConstruccion titulo="Crear reporte" />} />
          <Route path={RUTAS.perfil} element={<EnConstruccion titulo="Mi perfil" />} />
          <Route path={RUTAS.ayuda} element={<Ayuda />} />
          <Route path="/" element={<Navigate to={RUTAS.login} replace />} />
          <Route path="*" element={<Navigate to={RUTAS.login} replace />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </MenuProvider>
  </IonApp>
);

export default App;
