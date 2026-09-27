import {
  IonContent,
  IonHeader,
  IonIcon,
  IonMenuToggle,
  IonPage,
  IonToolbar,
  useIonRouter,
} from '@ionic/react';
import { chevronDownOutline } from 'ionicons/icons';
import MenuLateral from './MenuLateral';
import { ID_MENU_CUENTA } from './MenuCuenta';
import { CLAVE_ANCHO_MENU } from '../../context/MenuProvider';
import { useAnchoRedimensionable } from '../../hooks/useAnchoRedimensionable';
import { useMenu } from '../../hooks/useMenu';
import { RUTAS } from '../../routes/rutas';
import { USUARIO_PRUEBA } from '../../services/usuarioService';
import './AppLayout.css';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const router = useIonRouter();
  const menu = useMenu();
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
            href={RUTAS.inicio}
            className="app-marca"
            aria-label="FocalWare, ir al inicio"
            onClick={(evento) => {
              evento.preventDefault();
              router.push(RUTAS.inicio, 'root');
            }}
          >
            <img src="/logo-focalware.webp" alt="" />
            <span>FocalWare</span>
          </a>
          <IonMenuToggle slot="end" menu={ID_MENU_CUENTA} autoHide={false}>
            <button type="button" className="app-cuenta" aria-label="Abrir menú de mi cuenta">
              <span className="app-cuenta-texto">
                <strong>Mi cuenta</strong>
                <small>{USUARIO_PRUEBA.rol}</small>
              </span>
              <span className="app-avatar" aria-hidden="true">
                {USUARIO_PRUEBA.iniciales}
              </span>
              <IonIcon icon={chevronDownOutline} className="app-cuenta-flecha" aria-hidden="true" />
            </button>
          </IonMenuToggle>
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
