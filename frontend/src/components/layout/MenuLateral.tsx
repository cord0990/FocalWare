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

// Las cuatro secciones principales de EP 1.4. Sin sesión, las tres últimas piden iniciar sesión.
const OPCIONES = [
  { texto: 'Mapa', ruta: RUTAS.mapa, icono: mapOutline },
  { texto: 'Crear reporte', ruta: RUTAS.reportar, icono: documentTextOutline },
  { texto: 'Mis reportes', ruta: RUTAS.misReportes, icono: folderOpenOutline },
  { texto: 'Mi perfil', ruta: RUTAS.perfil, icono: personOutline },
];

// La sección sigue marcada en sus subpáginas (por ejemplo, /mis-reportes/R-001).
const estaEnSeccion = (pathname: string, ruta: string) =>
  pathname === ruta || pathname.startsWith(`${ruta}/`);

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

      <div className="menu-opciones">
        {OPCIONES.map((opcion) => (
          <a
            key={opcion.ruta}
            href={opcion.ruta}
            onClick={(evento) => navegar(evento, opcion.ruta)}
            className={estaEnSeccion(pathname, opcion.ruta) ? 'menu-opcion activa' : 'menu-opcion'}
            aria-current={estaEnSeccion(pathname, opcion.ruta) ? 'page' : undefined}
            title={opcion.texto}
          >
            <IonIcon icon={opcion.icono} aria-hidden="true" />
            <span className="menu-texto">{opcion.texto}</span>
          </a>
        ))}
      </div>
    </nav>
  );
};

export default MenuLateral;
