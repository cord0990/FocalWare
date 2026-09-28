import { IonIcon } from '@ionic/react';
import { checkmarkCircle, closeCircle, shieldCheckmark } from 'ionicons/icons';
import type { GestionReporte } from '../../services/reportesService';
import { formatearFecha } from '../../utils/fechas';
import './SeguimientoReporte.css';

// "2026-09-04T10:15" -> "04-09-2026 a las 10:15"
const fechaYHora = (valor: string) => {
  const [fecha, hora] = valor.split('T');
  return hora ? `${formatearFecha(fecha)} a las ${hora.slice(0, 5)}` : formatearFecha(fecha);
};

// Lo que decidió el municipio sobre el reporte, visible para el vecino y el funcionario.
const SeguimientoReporte: React.FC<{ gestion?: GestionReporte }> = ({ gestion }) => {
  if (!gestion || (!gestion.aprobacion && !gestion.rechazo && !gestion.control)) return null;
  const { aprobacion, rechazo, control } = gestion;

  return (
    <section className="seguimiento" aria-label="Seguimiento municipal">
      {rechazo && (
        <div className="seguimiento-paso rechazado">
          <IonIcon icon={closeCircle} aria-hidden="true" />
          <div>
            <strong>Rechazado el {fechaYHora(rechazo.fecha)}</strong>
            <p>Motivo: {rechazo.motivo}</p>
          </div>
        </div>
      )}
      {aprobacion && (
        <div className="seguimiento-paso aprobado">
          <IonIcon icon={checkmarkCircle} aria-hidden="true" />
          <div>
            <strong>Aprobado el {fechaYHora(aprobacion.fecha)}</strong>
            <p>
              {aprobacion.cuadrilla} · Atención programada para el {formatearFecha(aprobacion.fechaAtencion)}
            </p>
            {aprobacion.detalle && <p className="seguimiento-detalle">{aprobacion.detalle}</p>}
          </div>
        </div>
      )}
      {control && (
        <div className="seguimiento-paso controlado">
          <IonIcon icon={shieldCheckmark} aria-hidden="true" />
          <div>
            <strong>Controlado el {fechaYHora(control.fecha)}</strong>
            <p>{control.detalle}</p>
            {control.imagenes.length > 0 && (
              <div className="seguimiento-evidencia" aria-label="Evidencia del control">
                {control.imagenes.map((imagen, indice) => (
                  <img key={indice} src={imagen} alt={`Evidencia del control ${indice + 1}`} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default SeguimientoReporte;
