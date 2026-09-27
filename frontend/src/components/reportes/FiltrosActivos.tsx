import { IonIcon } from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import {
  FILTROS_INICIALES,
  type FiltroActivo,
  type FiltrosReportes,
} from '../../utils/filtrosReportes';
import './FiltrosActivos.css';

interface FiltrosActivosProps {
  activos: FiltroActivo[];
  // Estado sin filtros al que vuelve "Quitar todos".
  base?: FiltrosReportes;
  onCambiar: (filtros: FiltrosReportes) => void;
}

const FiltrosActivos: React.FC<FiltrosActivosProps> = ({
  activos,
  base = FILTROS_INICIALES,
  onCambiar,
}) => {
  if (activos.length === 0) return null;

  return (
    <div className="filtros-activos" aria-label="Filtros aplicados">
      {activos.map((filtro) => (
        <button
          key={filtro.clave}
          type="button"
          className="filtro-chip"
          onClick={() => onCambiar(filtro.sinEste)}
          aria-label={`Quitar filtro ${filtro.texto}`}
        >
          {filtro.texto}
          <IonIcon icon={closeOutline} aria-hidden="true" />
        </button>
      ))}
      {activos.length > 1 && (
        <button
          type="button"
          className="filtros-quitar-todos"
          onClick={() => onCambiar(base)}
        >
          Quitar todos
        </button>
      )}
    </div>
  );
};

export default FiltrosActivos;
