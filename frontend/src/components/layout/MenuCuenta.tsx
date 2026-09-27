import {
  IonContent,
  IonIcon,
  IonMenu,
  IonMenuToggle,
  useIonRouter,
} from '@ionic/react';
import {
  chevronForwardOutline,
  cloudUploadOutline,
  documentTextOutline,
  helpCircleOutline,
  informationCircleOutline,
  logOutOutline,
  notificationsOutline,
} from 'ionicons/icons';
import { useConexion } from '../../hooks/useConexion';
import { usePendientes } from '../../hooks/usePendientes';
import { RUTAS } from '../../routes/rutas';
import { USUARIO_PRUEBA } from '../../services/usuarioService';
import './MenuCuenta.css';

export const ID_MENU_CUENTA = 'menu-cuenta';

interface OpcionMenuProps {
  icono: string;
  texto: string;
  detalle?: string;
  contador?: number;
  tipoContador?: 'rojo' | 'cafe';
  onClick: () => void;
}

// IonMenuToggle cierra el menú automáticamente al tocar una opción.
const OpcionMenu: React.FC<OpcionMenuProps> = ({
  icono,
  texto,
  detalle,
  contador,
  tipoContador = 'rojo',
  onClick,
}) => (
  <IonMenuToggle menu={ID_MENU_CUENTA} autoHide={false}>
    <button type="button" className="cuenta-opcion" onClick={onClick}>
      <span className="cuenta-opcion-icono">
        <IonIcon icon={icono} aria-hidden="true" />
      </span>
      <span className="cuenta-opcion-texto">
        {texto}
        {detalle && <small>{detalle}</small>}
      </span>
      {contador ? (
        <span className={`cuenta-contador ${tipoContador}`}>{contador}</span>
      ) : (
        <IonIcon icon={chevronForwardOutline} className="cuenta-flecha" aria-hidden="true" />
      )}
    </button>
  </IonMenuToggle>
);

const MenuCuenta: React.FC<{ contentId: string }> = ({ contentId }) => {
  const router = useIonRouter();
  const usuario = USUARIO_PRUEBA;
  const pendientes = usePendientes();
  const enLinea = useConexion();
  const irA = (ruta: string) => router.push(ruta, 'root');

  return (
    <IonMenu
        menuId={ID_MENU_CUENTA}
        contentId={contentId}
        side="end"
        type="overlay"
        swipeGesture={false}
        className="menu-cuenta"
      >
        <IonContent className="cuenta-contenido">
          <IonMenuToggle menu={ID_MENU_CUENTA} autoHide={false}>
            <button type="button" className="cuenta-saludo" onClick={() => irA(RUTAS.perfil)}>
              <span className="cuenta-avatar">{usuario.iniciales}</span>
              <span className="cuenta-saludo-texto">
                <strong>¡Hola, {usuario.nombre}!</strong>
                <small>
                  {usuario.rol} · {usuario.sector}
                </small>
              </span>
              <IonIcon icon={chevronForwardOutline} className="cuenta-flecha" aria-hidden="true" />
            </button>
          </IonMenuToggle>

          <h2 className="cuenta-seccion">Tu aporte</h2>
          <div className="cuenta-impacto">
            <div>
              <strong>{usuario.reportesCreados}</strong>
              <span>Reportes creados</span>
            </div>
            <div>
              <strong>{usuario.votosDados}</strong>
              <span>Votos dados</span>
            </div>
            <div>
              <strong>{usuario.apoyosRecibidos}</strong>
              <span>Apoyos recibidos</span>
            </div>
          </div>

          <h2 className="cuenta-seccion">Mi actividad</h2>
          <div className="cuenta-grupo">
            <OpcionMenu
              icono={notificationsOutline}
              texto="Notificaciones"
              contador={usuario.notificacionesSinLeer}
              onClick={() => irA(RUTAS.perfil)}
            />
            <OpcionMenu
              icono={cloudUploadOutline}
              texto="Pendientes de envío"
              detalle={
                pendientes.length === 0
                  ? 'Todo enviado'
                  : `${enLinea ? 'Listos para enviar' : 'Sin conexión'} · ${pendientes.length} esperando`
              }
              contador={pendientes.length}
              tipoContador="cafe"
              onClick={() => irA(RUTAS.misReportes)}
            />
          </div>

          <h2 className="cuenta-seccion">Ayuda y soporte</h2>
          <div className="cuenta-grupo">
            <OpcionMenu
              icono={helpCircleOutline}
              texto="Ayuda y contacto"
              onClick={() => irA(`${RUTAS.ayuda}?seccion=ayuda`)}
            />
            <OpcionMenu
              icono={documentTextOutline}
              texto="Términos y privacidad"
              onClick={() => irA(`${RUTAS.ayuda}?seccion=terminos`)}
            />
            <OpcionMenu
              icono={informationCircleOutline}
              texto="Acerca de FocalWare"
              onClick={() => irA(`${RUTAS.ayuda}?seccion=acerca`)}
            />
          </div>

          <IonMenuToggle menu={ID_MENU_CUENTA} autoHide={false}>
            <button
              type="button"
              className="cuenta-cerrar-sesion"
              onClick={() => router.push(RUTAS.login, 'root', 'replace')}
            >
              <IonIcon icon={logOutOutline} aria-hidden="true" />
              Cerrar sesión
            </button>
          </IonMenuToggle>
        </IonContent>
      </IonMenu>
  );
};

export default MenuCuenta;
