import {
  IonContent,
  IonHeader,
  IonIcon,
  IonMenuToggle,
  IonPage,
  IonToolbar,
  useIonRouter,
} from '@ionic/react';
import { chevronDownOutline, logInOutline, personAddOutline } from 'ionicons/icons';
import MenuLateral from './MenuLateral';
import { ID_MENU_CUENTA } from './MenuCuenta';
import { CLAVE_ANCHO_MENU } from '../../context/MenuProvider';
import { useAnchoRedimensionable } from '../../hooks/useAnchoRedimensionable';
import { useMenu } from '../../hooks/useMenu';
import { RUTAS } from '../../routes/rutas';
import { useIrAlLogin } from '../../hooks/useIrAlLogin';
import { useNotificacionesNoLeidas } from '../../hooks/useNotificacionesNoLeidas';
import { useSesion } from '../../hooks/useSesion';
import { useTecladoAbierto } from '../../hooks/useTecladoAbierto';
import { NOMBRE_ROL, obtenerIniciales } from '../../services/sesionService';
import './AppLayout.css';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const router = useIonRouter();
  const menu = useMenu();
  const { usuario } = useSesion();
  const notificacionesNoLeidas = useNotificacionesNoLeidas();
  const irAlLogin = useIrAlLogin();
  const tecladoAbierto = useTecladoAbierto();
  const divisorMenu = useAnchoRedimensionable({
    clave: CLAVE_ANCHO_MENU,
    minimo: 180,
    maximoProporcion: 0.3,
    lado: 'izquierda',
    estado: [menu.ancho, menu.setAncho],
  });

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="app-encabezado">
          <a
            href={RUTAS.mapa}
            className="app-marca"
            aria-label="FocalWare, ir al mapa"
            onClick={(evento) => {
              evento.preventDefault();
              router.push(RUTAS.mapa, 'root');
            }}
          >
            <img src="/logo-focalware.webp" alt="" />
            <span>FocalWare</span>
          </a>
          {usuario ? (
            <IonMenuToggle slot="end" menu={ID_MENU_CUENTA} autoHide={false}>
              <button type="button" className="app-cuenta" aria-label="Abrir menú de mi cuenta">
                <span className="app-cuenta-texto">
                  <strong>Mi cuenta</strong>
                  <small>{NOMBRE_ROL[usuario.rol]}</small>
                </span>
                <span className="app-avatar-contenedor" aria-hidden="true">
                  <span className="app-avatar">
                    {obtenerIniciales(usuario.nombre)}
                  </span>
                  {notificacionesNoLeidas > 0 && (
                    <span
                      className="app-avatar-badge"
                      aria-label={`${notificacionesNoLeidas} notificaciones sin leer`}
                    >
                      <svg
                        className="app-avatar-badge-llama"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          d="M12 1.5 C12 1.5 13.5 5 14.5 7.5 C16 10 18 12 18 15 C18 18.9 15.3 22 12 22 C8.7 22 6 18.9 6 15 C6 12 8 10 9.5 7.5 C10.5 5 12 1.5 12 1.5 Z"
                          fill="#E72441"
                        />
                      </svg>
                      <span className="app-avatar-badge-numero">
                        {notificacionesNoLeidas}
                      </span>
                    </span>
                  )}
                </span>
                <IonIcon icon={chevronDownOutline} className="app-cuenta-flecha" aria-hidden="true" />
              </button>
            </IonMenuToggle>
          ) : (
            // Sin sesión se puede mirar el mapa; para reportar o votar hay que entrar.
            <div slot="end" className="app-acciones">
              <button
                type="button"
                className="app-cuenta app-entrar"
                aria-label="Iniciar sesión"
                onClick={() => irAlLogin()}
              >
                <IonIcon icon={logInOutline} aria-hidden="true" />
                <strong>Iniciar sesión</strong>
              </button>
              <button
                type="button"
                className="app-cuenta app-crear-cuenta"
                aria-label="Crear cuenta"
                onClick={() => router.push(RUTAS.registro, 'root')}
              >
                <IonIcon icon={personAddOutline} aria-hidden="true" />
                <strong>Crear cuenta</strong>
              </button>
            </div>
          )}
        </IonToolbar>
      </IonHeader>

      <IonContent className="app-contenido" scrollY={false}>
        <div
          ref={divisorMenu.contenedor}
          className={[
            'app-cuerpo',
            divisorMenu.arrastrando && 'arrastrando',
            tecladoAbierto && 'teclado-abierto',
          ]
            .filter(Boolean)
            .join(' ')}
          style={menu.ancho ? ({ '--ancho-menu': `${menu.ancho}px` } as React.CSSProperties) : undefined}
        >
          <MenuLateral />
          {!menu.colapsado && (
            <div
              className="app-divisor"
              role="separator"
              aria-orientation="vertical"
              aria-label="Cambiar el ancho del menú"
              tabIndex={0}
              title="Arrastra para cambiar el ancho. Doble clic para restablecer."
              onPointerDown={divisorMenu.alPresionar}
              onKeyDown={divisorMenu.alTeclado}
              onDoubleClick={divisorMenu.restablecer}
            />
          )}
          <main className="app-principal">{children}</main>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AppLayout;
