import { useIonRouter } from '@ionic/react';
import { RUTAS } from '../../routes/rutas';
import './Footer.css';

// Cada enlace abre la página de ayuda en su sección (la misma que usa el menú de la cuenta).
const ENLACES = [
  { texto: 'Términos y condiciones', seccion: 'terminos' },
  { texto: 'Atención al cliente', seccion: 'ayuda' },
  { texto: 'Acerca del equipo', seccion: 'acerca' },
];

const Footer: React.FC = () => {
  const router = useIonRouter();

  return (
    <footer className="pie">
      <nav className="pie-enlaces">
        {ENLACES.map(({ texto, seccion }) => {
          const ruta = `${RUTAS.ayuda}?seccion=${seccion}`;
          return (
            <a
              key={seccion}
              href={ruta}
              onClick={(evento) => {
                evento.preventDefault();
                router.push(ruta, 'forward');
              }}
            >
              {texto}
            </a>
          );
        })}
      </nav>
      <p className="pie-derechos">Derechos asociados a: FocalWare</p>
    </footer>
  );
};

export default Footer;
