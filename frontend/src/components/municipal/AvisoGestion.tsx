import { documentTextOutline, mapOutline } from 'ionicons/icons';
import AvisoModal from '../AvisoModal';
import type { Reporte } from '../../services/reportesService';
import { formatearFecha } from '../../utils/fechas';
import type { AccionFuncionario } from './OpcionesFuncionario';
import './AvisoGestion.css';

interface AvisoGestionProps {
  // Acción que el funcionario acaba de guardar, o null si no hay aviso que mostrar.
  resultado: AccionFuncionario | null;
  reporte: Reporte;
  onVolverAlMapa: () => void;
  onCerrar: () => void;
}

const TEXTOS: Record<AccionFuncionario, { titulo: string; mensaje: string }> = {
  aprobar: {
    titulo: '¡Reporte aprobado!',
    mensaje: 'El reporte quedó Aprobado y asignado a una cuadrilla para su atención.',
  },
  rechazar: {
    titulo: 'Reporte rechazado',
    mensaje: 'Ya no aparece en el mapa público. El vecino podrá ver el motivo en su reporte.',
  },
  controlar: {
    titulo: '¡Reporte controlado!',
    mensaje: 'El problema quedó registrado como resuelto, con su evidencia.',
  },
};

// Confirmación clara de lo que se guardó al aprobar, rechazar o controlar un reporte.
const AvisoGestion: React.FC<AvisoGestionProps> = ({ resultado, reporte, onVolverAlMapa, onCerrar }) => {
  const { aprobacion, rechazo, control } = reporte.gestion ?? {};

  const datos =
    resultado === 'aprobar' && aprobacion
      ? [
          { etiqueta: 'Cuadrilla', valor: aprobacion.cuadrilla },
          { etiqueta: 'Atención programada', valor: formatearFecha(aprobacion.fechaAtencion) },
          ...(aprobacion.detalle ? [{ etiqueta: 'Detalles', valor: aprobacion.detalle }] : []),
        ]
      : resultado === 'rechazar' && rechazo
        ? [{ etiqueta: 'Motivo', valor: rechazo.motivo }]
        : resultado === 'controlar' && control
          ? [
              { etiqueta: 'Fecha del control', valor: formatearFecha(control.fecha.slice(0, 10)) },
              { etiqueta: 'Fotos de evidencia', valor: String(control.imagenes.length) },
            ]
          : [];

  return (
    <AvisoModal
      abierto={!!resultado}
      tipo="exito"
      titulo={resultado ? TEXTOS[resultado].titulo : ''}
      mensaje={resultado ? TEXTOS[resultado].mensaje : ''}
      onAceptar={onCerrar}
      acciones={[
        { texto: 'Volver al mapa', icono: mapOutline, principal: true, onClick: onVolverAlMapa },
        { texto: 'Ver el reporte', icono: documentTextOutline, onClick: onCerrar },
      ]}
    >
      <div className="aviso-gestion-resumen">
        <strong>
          {reporte.id} · {reporte.nombre}
        </strong>
        {datos.length > 0 && (
          <dl>
            {datos.map((dato) => (
              <div key={dato.etiqueta}>
                <dt>{dato.etiqueta}</dt>
                <dd>{dato.valor}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </AvisoModal>
  );
};

export default AvisoGestion;
