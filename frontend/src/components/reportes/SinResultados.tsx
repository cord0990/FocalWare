import { IonButton } from '@ionic/react';
import './SinResultados.css';

interface SinResultadosProps {
  busqueda: string;
  hayFiltros: boolean;
  onReiniciar: () => void;
}

const SinResultados: React.FC<SinResultadosProps> = ({ busqueda, hayFiltros, onReiniciar }) => {
  const termino = busqueda.trim();

  let detalle = 'Todavía no hay reportes registrados.';
  if (termino && hayFiltros) {
    detalle = `Ningún reporte coincide con “${termino}” y los filtros aplicados.`;
  } else if (termino) {
    detalle = `Ningún reporte coincide con “${termino}”. Prueba con otro sector, nombre o categoría.`;
  } else if (hayFiltros) {
    detalle = 'Ningún reporte cumple con los filtros aplicados. Prueba quitando alguno.';
  }

  return (
    <div className="sin-resultados" role="status">
      <h2>No encontramos coincidencias</h2>

      <svg className="sin-resultados-robot" viewBox="0 0 120 110" aria-hidden="true">
        <line x1="60" y1="8" x2="60" y2="26" />
        <circle cx="60" cy="8" r="6" />
        <rect x="18" y="26" width="84" height="66" rx="14" />
        <rect x="6" y="46" width="12" height="26" rx="4" />
        <rect x="102" y="46" width="12" height="26" rx="4" />
        <circle className="ojo" cx="44" cy="56" r="11" />
        <circle className="ojo" cx="76" cy="56" r="11" />
        <circle cx="47" cy="59" r="4" />
        <circle cx="73" cy="53" r="4" />
        <path className="boca" d="M46 80 q14 -8 28 0" />
      </svg>

      <p>{detalle}</p>

      {(termino || hayFiltros) && (
        <IonButton className="sin-resultados-boton" onClick={onReiniciar}>
          {termino && hayFiltros
            ? 'Reiniciar búsqueda y filtros'
            : termino
              ? 'Borrar búsqueda'
              : 'Reiniciar filtros'}
        </IonButton>
      )}
    </div>
  );
};

export default SinResultados;
