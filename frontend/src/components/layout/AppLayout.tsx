import {
  IonContent,
  IonHeader,
  IonIcon,
  IonMenuToggle,
  IonPage,
  IonToolbar,
  useIonRouter,
} from '@ionic/react';
import { chevronDownOutline, logInOutline } from 'ionicons/icons';
import MenuLateral from './MenuLateral';
import { ID_MENU_CUENTA } from './MenuCuenta';
import { CLAVE_ANCHO_MENU } from '../../context/MenuProvider';
import { useAnchoRedimensionable } from '../../hooks/useAnchoRedimensionable';
import { useMenu } from '../../hooks/useMenu';
import { RUTAS } from '../../routes/rutas';
import { useIrAlLogin } from '../../hooks/useIrAlLogin';
import { useSesion } from '../../hooks/useSesion';
import { NOMBRE_ROL, obtenerIniciales } from '../../services/sesionService';
import './AppLayout.css';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const router = useIonRouter();
  const menu = useMenu();
  const { usuario } = useSesion();
  const irAlLogin = useIrAlLogin();
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
                <span className="app-avatar" aria-hidden="true">
                  {obtenerIniciales(usuario.nombre)}
                </span>
                <IonIcon icon={chevronDownOutline} className="app-cuenta-flecha" aria-hidden="true" />
              </button>
            </IonMenuToggle>
          ) : (
            // Sin sesión se puede mirar el mapa; para reportar o votar hay que entrar.
            <button
              type="button"
              slot="end"
              className="app-cuenta app-entrar"
              aria-label="Iniciar sesión"
              onClick={() => irAlLogin()}
            >
              <IonIcon icon={logInOutline} aria-hidden="true" />
              <strong>Iniciar sesión</strong>
            </button>
          )}
        </IonToolbar>
      </IonHeader>

      <IonContent className="app-contenido" scrollY={false}>
        <div
          ref={divisorMenu.contenedor}
          className={divisorMenu.arrastrando ? 'app-cuerpo arrastrando' : 'app-cuerpo'}
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
