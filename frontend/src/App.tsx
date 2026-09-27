import { Navigate, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Login from './pages/public/Login';
import Registro from './pages/public/Registro';
import RecuperarContrasena from './pages/public/RecuperarContrasena';
import Inicio from './pages/vecino/Inicio';
import MisReportes from './pages/vecino/MisReportes';
import Perfil from './pages/perfil/Perfil';
import CrearReporte from './pages/vecino/CrearReporte';
import DetalleReporte from './pages/vecino/DetalleReporte';
import EditarReporte from './pages/vecino/EditarReporte';
import Ayuda from './pages/ayuda/Ayuda';
import MenuProvider from './context/MenuProvider';
import SesionProvider from './context/SesionProvider';
import MenuCuenta from './components/layout/MenuCuenta';
import { RUTAS } from './routes/rutas';
import RutaProtegida from './routes/RutaProtegida';
import RutaPublica from './routes/RutaPublica';

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
    <SesionProvider>
      <MenuProvider>
        <IonReactRouter>
          <MenuCuenta contentId="contenido-principal" />
          <IonRouterOutlet id="contenido-principal">
            <Route
              path={RUTAS.login}
              element={
                <RutaPublica>
                  <Login />
                </RutaPublica>
              }
            />
            <Route
              path={RUTAS.registro}
              element={
                <RutaPublica>
                  <Registro />
                </RutaPublica>
              }
            />
            <Route
              path={RUTAS.recuperar}
              element={
                <RutaPublica>
                  <RecuperarContrasena />
                </RutaPublica>
              }
            />
            <Route
              path={RUTAS.inicio}
              element={
                <RutaProtegida>
                  <Inicio />
                </RutaProtegida>
              }
            />
            <Route
              path={RUTAS.misReportes}
              element={
                <RutaProtegida>
                  <MisReportes />
                </RutaProtegida>
              }
            />
            <Route
              path={RUTAS.crearReporte}
              element={
                <RutaProtegida>
                  <CrearReporte />
                </RutaProtegida>
              }
            />
            <Route
              path={RUTAS.detalleReporte}
              element={
                <RutaProtegida>
                  <DetalleReporte />
                </RutaProtegida>
              }
            />
            <Route
              path={RUTAS.editarReporte}
              element={
                <RutaProtegida>
                  <EditarReporte />
                </RutaProtegida>
              }
            />
            <Route
              path={RUTAS.perfil}
              element={
                <RutaProtegida>
                  <Perfil />
                </RutaProtegida>
              }
            />
            <Route
              path={RUTAS.ayuda}
              element={
                <RutaProtegida>
                  <Ayuda />
                </RutaProtegida>
              }
            />
            {/* Sin sesión, la ruta protegida del mapa redirige al login */}
            <Route path="/" element={<Navigate to={RUTAS.inicio} replace />} />
            <Route path="*" element={<Navigate to={RUTAS.inicio} replace />} />
          </IonRouterOutlet>
        </IonReactRouter>
      </MenuProvider>
    </SesionProvider>
  </IonApp>
);

export default App;