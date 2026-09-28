import { IonIcon } from '@ionic/react';
import { cloudOfflineOutline, createOutline, trashOutline } from 'ionicons/icons';
import type { ReportePendiente } from '../../services/pendientesService';
import { formatearFecha } from '../../utils/fechas';
import './TarjetaPendiente.css';

interface TarjetaPendienteProps {
  pendiente: ReportePendiente;
  onEditar: () => void;
  onEliminar: () => void;
}

const formatearGuardado = (fechaHora: string) => {
  const [fecha, hora] = fechaHora.split('T');
  return `${formatearFecha(fecha)} a las ${hora.slice(0, 5)}`;
};

// Reporte guardado en el teléfono que todavía no se envía al servidor.
const TarjetaPendiente: React.FC<TarjetaPendienteProps> = ({ pendiente, onEditar, onEliminar }) => (
  <article className="tarjeta-pendiente">
    <span className="tarjeta-pendiente-icono">
      <IonIcon icon={cloudOfflineOutline} aria-hidden="true" />
    </span>
    <div className="tarjeta-pendiente-info">
      <h3>{pendiente.nombre}</h3>
      <p>
        {pendiente.sector} · {pendiente.categoria}
      </p>
      <small>Guardado el {formatearGuardado(pendiente.guardadoEn)}</small>
    </div>
    <button
      type="button"
      className="tarjeta-pendiente-accion"
      onClick={onEditar}
      aria-label={`Modificar el borrador "${pendiente.nombre}"`}
      title="Modificar borrador"
    >
      <IonIcon icon={createOutline} aria-hidden="true" />
    </button>
    <button
      type="button"
      className="tarjeta-pendiente-accion eliminar"
      onClick={onEliminar}
      aria-label={`Eliminar el borrador "${pendiente.nombre}"`}
      title="Eliminar borrador"
    >
      <IonIcon icon={trashOutline} aria-hidden="true" />
    </button>
  </article>
);

export default TarjetaPendiente;
