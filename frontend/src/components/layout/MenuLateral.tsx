import { IonIcon, useIonRouter } from '@ionic/react';
import { useLocation } from 'react-router-dom';
import {
  chevronBackOutline,
  documentTextOutline,
  folderOpenOutline,
  mapOutline,
  menuOutline,
  personOutline,
} from 'ionicons/icons';
import { useMenu } from '../../hooks/useMenu';
import { RUTAS } from '../../routes/rutas';

const OPCIONES = [
  { texto: 'Mapa', ruta: RUTAS.inicio, icono: mapOutline },
  { texto: 'Mis reportes', ruta: RUTAS.misReportes, icono: folderOpenOutline },
  { texto: 'Crear reporte', ruta: RUTAS.crearReporte, icono: documentTextOutline },
  { texto: 'Mi perfil', ruta: RUTAS.perfil, icono: personOutline },
];

// En escritorio es un menú lateral que se puede colapsar; en celular se muestra como barra inferior.
const MenuLateral: React.FC = () => {
  const { colapsado, alternar } = useMenu();
  const { pathname } = useLocation();
  const router = useIonRouter();

  const navegar = (evento: React.MouseEvent, ruta: string) => {
    evento.preventDefault();
    router.push(ruta, 'root');
  };

  return (
    <nav className={colapsado ? 'menu-lateral colapsado' : 'menu-lateral'} aria-label="Menú principal">
      <button
        type="button"
        className="menu-alternar"
        onClick={alternar}
        aria-label={colapsado ? 'Expandir menú' : 'Colapsar menú'}
        aria-expanded={!colapsado}
      >
        <IonIcon icon={colapsado ? menuOutline : chevronBackOutline} />
      </button>

      {OPCIONES.map((opcion) => (
        <a
          key={opcion.ruta}
          href={opcion.ruta}
          onClick={(evento) => navegar(evento, opcion.ruta)}
          className={pathname === opcion.ruta ? 'menu-opcion activa' : 'menu-opcion'}
          aria-current={pathname === opcion.ruta ? 'page' : undefined}
          title={opcion.texto}
        >
          <IonIcon icon={opcion.icono} aria-hidden="true" />
          <span className="menu-texto">{opcion.texto}</span>
        </a>
      ))}
    </nav>
  );
};

export default MenuLateral;
