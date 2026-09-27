import { IonButton, IonIcon } from '@ionic/react';
import { caretUp, imageOutline, locationOutline } from 'ionicons/icons';
import type { Reporte } from '../../services/reportesService';
import { ESTILO_ESTADO } from '../../utils/estados';
import { formatearFecha } from '../../utils/fechas';
import { obtenerNivelRiesgo } from '../../utils/riesgo';
import './TarjetaReporte.css';

interface TarjetaReporteProps {
  reporte: Reporte;
  seleccionada?: boolean;
  votado?: boolean;
  // En "Mis reportes" se muestra el estado y la fecha, y no se puede votar el reporte propio.
  mostrarEstado?: boolean;
  puedeVotar?: boolean;
  onDetalles: () => void;
  onVotar?: () => void;
}

const TarjetaReporte: React.FC<TarjetaReporteProps> = ({
  reporte,
  seleccionada = false,
  votado = false,
  mostrarEstado = false,
  puedeVotar = true,
  onDetalles,
  onVotar,
}) => {
  const nivel = obtenerNivelRiesgo(reporte.riesgo);
  const estado = ESTILO_ESTADO[reporte.estado];
  const votos = reporte.votos + (votado ? 1 : 0);

  return (
    <article
      id={`reporte-${reporte.id}`}
      className={seleccionada ? 'tarjeta-reporte seleccionada' : 'tarjeta-reporte'}
      aria-current={seleccionada ? 'true' : undefined}
    >
      {seleccionada && (
        <span className="tarjeta-seleccionada-aviso">
          <IonIcon icon={locationOutline} aria-hidden="true" />
          Viendo en el mapa
        </span>
      )}
      <div className="tarjeta-imagen">
        {reporte.imagenes[0] ? (
          <img src={reporte.imagenes[0]} alt={reporte.nombre} />
        ) : (
          <IonIcon icon={imageOutline} aria-label="Sin fotografía" />
        )}
      </div>

      <div className="tarjeta-info">
        {mostrarEstado && (
          <div className="tarjeta-estado-fila">
            <span className="tarjeta-estado" style={{ color: estado.color, borderColor: estado.color }}>
              <IonIcon icon={estado.icono} aria-hidden="true" />
              {reporte.estado}
            </span>
            <span className="tarjeta-fecha">{formatearFecha(reporte.fecha)}</span>
          </div>
        )}

        <h3>{reporte.nombre}</h3>
        <p className="tarjeta-sector">{reporte.sector}</p>

        <div className="tarjeta-etiquetas">
          <span className="etiqueta etiqueta-categoria">{reporte.categoria}</span>
          {reporte.riesgoEnCalculo ? (
            <span className="etiqueta etiqueta-calculando">Riesgo en cálculo</span>
          ) : (
            <span className="etiqueta" style={{ background: nivel.color, color: nivel.texto }}>
              Riesgo {reporte.riesgo}%
            </span>
          )}
        </div>

        <div className="tarjeta-acciones">
          <IonButton className="btn-detalles" onClick={onDetalles}>
            Detalles
          </IonButton>
          <button
            type="button"
            className={votado ? 'btn-voto votado' : 'btn-voto'}
            onClick={onVotar}
            disabled={!puedeVotar}
            aria-pressed={votado}
            aria-label={puedeVotar ? `Votar a favor, ${votos} votos` : `${votos} votos`}
            title={puedeVotar ? undefined : 'Votos que ha recibido el reporte'}
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
