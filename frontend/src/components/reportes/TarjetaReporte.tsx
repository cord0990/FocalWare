import { IonButton, IonIcon } from '@ionic/react';
import { caretUp, imageOutline } from 'ionicons/icons';
import type { Reporte } from '../../services/reportesService';
import { obtenerNivelRiesgo } from '../../utils/riesgo';
import './TarjetaReporte.css';

interface TarjetaReporteProps {
  reporte: Reporte;
  seleccionada: boolean;
  votado: boolean;
  onDetalles: () => void;
  onVotar: () => void;
}

const TarjetaReporte: React.FC<TarjetaReporteProps> = ({
  reporte,
  seleccionada,
  votado,
  onDetalles,
  onVotar,
}) => {
  const nivel = obtenerNivelRiesgo(reporte.riesgo);
  const votos = reporte.votos + (votado ? 1 : 0);

  return (
    <article
      id={`reporte-${reporte.id}`}
      className={seleccionada ? 'tarjeta-reporte seleccionada' : 'tarjeta-reporte'}
    >
      <div className="tarjeta-imagen">
        {reporte.imagen ? (
          <img src={reporte.imagen} alt={reporte.nombre} />
        ) : (
          <IonIcon icon={imageOutline} aria-label="Sin fotografía" />
        )}
      </div>

      <div className="tarjeta-info">
        <h3>{reporte.nombre}</h3>
        <p className="tarjeta-sector">{reporte.sector}</p>

        <div className="tarjeta-etiquetas">
          <span className="etiqueta etiqueta-categoria">{reporte.categoria}</span>
          <span className="etiqueta" style={{ background: nivel.color, color: nivel.texto }}>
            Riesgo {reporte.riesgo}%
          </span>
        </div>

        <div className="tarjeta-acciones">
          <IonButton className="btn-detalles" onClick={onDetalles}>
            Detalles
          </IonButton>
          <button
            type="button"
            className={votado ? 'btn-voto votado' : 'btn-voto'}
            onClick={onVotar}
            aria-pressed={votado}
            aria-label={`Votar a favor, ${votos} votos`}
          >
            <IonIcon icon={caretUp} aria-hidden="true" />
            {votos}
          </button>
        </div>
      </div>
    </article>
  );
};

export default TarjetaReporte;
