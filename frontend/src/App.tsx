import { Navigate, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Login from './pages/publico/Login';
import Registro from './pages/publico/Registro';
import RecuperarContrasena from './pages/publico/RecuperarContrasena';
import Mapa from './pages/publico/Mapa';
import DetalleReporte from './pages/publico/DetalleReporte';
import Ayuda from './pages/publico/Ayuda';
import CrearReporte from './pages/compartido/CrearReporte';
import MisReportes from './pages/compartido/MisReportes';
import EditarReporte from './pages/compartido/EditarReporte';
import Perfil from './pages/compartido/perfil/Perfil';
import Estadisticas from './pages/municipal/Estadisticas';
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

// Rutas según la arquitectura de navegación (EP 1.4): públicas, compartidas (Vecino y
// Funcionario) y exclusivas de Funcionario bajo /municipal.
const App: React.FC = () => (
  <IonApp>
    <SesionProvider>
      <MenuProvider>
        <IonReactRouter>
          <MenuCuenta contentId="contenido-principal" />
          <IonRouterOutlet id="contenido-principal">
            {/* Públicas: el mapa y el detalle se ven sin sesión; votar y reportar piden login */}
            <Route path={RUTAS.mapa} element={<Mapa />} />
            <Route path={RUTAS.detalleMapa} element={<DetalleReporte origen="mapa" />} />
            <Route path={RUTAS.ayuda} element={<Ayuda />} />

            {/* Autenticación: con la sesión iniciada redirigen al mapa */}
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
                  <RecuperarContrasena paso={1} />
                </RutaPublica>
              }
            />
            <Route
              path={RUTAS.recuperarCodigo}
              element={
                <RutaPublica>
                  <RecuperarContrasena paso={2} />
                </RutaPublica>
              }
            />
            <Route
              path={RUTAS.recuperarNueva}
              element={
                <RutaPublica>
                  <RecuperarContrasena paso={3} />
                </RutaPublica>
              }
            />

            {/* Reportar y Mis reportes: solo Vecino (el Funcionario no crea reportes) */}
            <Route
              path={RUTAS.reportar}
              element={
                <RutaProtegida roles={['vecino']}>
                  <CrearReporte />
                </RutaProtegida>
              }
            />
            <Route
              path={RUTAS.misReportes}
              element={
                <RutaProtegida roles={['vecino']}>
                  <MisReportes />
                </RutaProtegida>
              }
            />
            <Route
              path={RUTAS.editarEnLocal}
              element={
                <RutaProtegida roles={['vecino']}>
                  <EditarReporte origen="local" />
                </RutaProtegida>
              }
            />
            <Route
              path={RUTAS.detalleMiReporte}
              element={
                <RutaProtegida roles={['vecino']}>
                  <DetalleReporte origen="mis-reportes" />
                </RutaProtegida>
              }
            />
            <Route
              path={RUTAS.editarMiReporte}
              element={
                <RutaProtegida roles={['vecino']}>
                  <EditarReporte origen="nube" />
                </RutaProtegida>
              }
            />
            <Route
              path={RUTAS.perfil}
              element={
                <RutaProtegida>
                  <Perfil seccion="notificaciones" />
                </RutaProtegida>
              }
            />
            <Route
              path={RUTAS.perfilConfiguracion}
              element={
                <RutaProtegida>
                  <Perfil seccion="configuracion" />
                </RutaProtegida>
              }
            />

            {/* Funcionario: todo lo que está bajo /municipal requiere ese rol */}
            <Route
              path={RUTAS.municipalReporte}
              element={
                <RutaProtegida roles={['funcionario']}>
                  <DetalleReporte origen="municipal" />
                </RutaProtegida>
              }
            />
            <Route
              path={RUTAS.municipalEstadisticas}
              element={
                <RutaProtegida roles={['funcionario']}>
                  <Estadisticas />
                </RutaProtegida>
              }
            />

            {/* La página de presentación (/) aún no existe: por ahora se abre el mapa */}
            <Route path={RUTAS.inicio} element={<Navigate to={RUTAS.mapa} replace />} />
            <Route path="*" element={<Navigate to={RUTAS.mapa} replace />} />
          </IonRouterOutlet>
        </IonReactRouter>
      </MenuProvider>
    </SesionProvider>
  </IonApp>
);

export default App;
