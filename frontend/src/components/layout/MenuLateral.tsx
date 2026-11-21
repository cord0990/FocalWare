import { useEffect, useState } from 'react';
import { IonIcon, useIonRouter } from '@ionic/react';
import { useLocation } from 'react-router-dom';
import {
  chevronBackOutline,
  statsChartOutline,
  documentTextOutline,
  folderOpenOutline,
  mapOutline,
  menuOutline,
  personOutline,
} from 'ionicons/icons';
import { useMenu } from '../../hooks/useMenu';
import { useSesion } from '../../hooks/useSesion';
import { EVENTO_NOTIFICACIONES, obtenerNotificaciones } from '../../services/notificacionesService';
import { EVENTO_REPORTES } from '../../services/reportesService';
import { RUTAS } from '../../routes/rutas';

// Las cuatro secciones principales de EP 1.4. Sin sesión, las tres últimas piden iniciar sesión.
const OPCIONES_VECINO = [
  { texto: 'Mapa', ruta: RUTAS.mapa, icono: mapOutline },
  { texto: 'Crear reporte', ruta: RUTAS.reportar, icono: documentTextOutline },
  { texto: 'Mis reportes', ruta: RUTAS.misReportes, icono: folderOpenOutline },
  { texto: 'Mi perfil', ruta: RUTAS.perfil, icono: personOutline },
];

//Logica: Se modifico la ruta de mi perfil para evitar errores de "pantalla negra".
// El Funcionario gestiona los reportes desde el mapa pero no los crea, así que no tiene
// Crear ni Mis reportes.
const OPCIONES_FUNCIONARIO = [
  { texto: 'Mapa', ruta: RUTAS.mapa, icono: mapOutline },
  { texto: 'Estadísticas', ruta: RUTAS.municipalEstadisticas, icono: statsChartOutline },
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
  const { usuario } = useSesion();
  const [tieneCambiosReportes, setTieneCambiosReportes] = useState(false);

  const opciones = usuario?.rol === 'funcionario' ? OPCIONES_FUNCIONARIO : OPCIONES_VECINO;

  useEffect(() => {
    if (!usuario || usuario.rol === 'funcionario') {
      setTieneCambiosReportes(false);
      return;
    }

    let activo = true;
    const revisarNotificaciones = async () => {
      try {
        const { noLeidas } = await obtenerNotificaciones();
        if (activo) setTieneCambiosReportes(noLeidas > 0);
      } catch {
        // Si falla la consulta, mantiene el estado actual sin bloquear el menú.
      }
    };

    revisarNotificaciones();
    window.addEventListener(EVENTO_NOTIFICACIONES, revisarNotificaciones);
    window.addEventListener(EVENTO_REPORTES, revisarNotificaciones);

    return () => {
      activo = false;
      window.removeEventListener(EVENTO_NOTIFICACIONES, revisarNotificaciones);
      window.removeEventListener(EVENTO_REPORTES, revisarNotificaciones);
    };
  }, [usuario, pathname]);

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
        {opciones.map((opcion) => {
          const activa = estaEnSeccion(pathname, opcion.ruta);
          const mostrarPuntito = opcion.ruta === RUTAS.misReportes && tieneCambiosReportes;
          const etiquetaTitulo = mostrarPuntito
            ? `${opcion.texto} (tienes reportes con cambio de estado)`
            : opcion.texto;

          return (
            <a
              key={opcion.ruta}
              href={opcion.ruta}
              onClick={(evento) => navegar(evento, opcion.ruta)}
              className={activa ? 'menu-opcion activa' : 'menu-opcion'}
              aria-current={activa ? 'page' : undefined}
              aria-label={etiquetaTitulo}
              title={etiquetaTitulo}
            >
              <IonIcon icon={opcion.icono} aria-hidden="true" />
              <span className="menu-texto">{opcion.texto}</span>
              {mostrarPuntito && <span className="menu-punto-notificacion" aria-hidden="true" />}
            </a>
          );
        })}
      </div>
    </nav>
  );
};

export default MenuLateral;