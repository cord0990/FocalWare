import { IonIcon } from '@ionic/react';
import { buildOutline, checkmark, createOutline } from 'ionicons/icons';
import type { Reporte } from '../../services/reportesService';
import './OpcionesFuncionario.css';

export type AccionFuncionario = 'aprobar' | 'rechazar' | 'controlar';

interface OpcionesFuncionarioProps {
  reporte: Reporte;
  modificando: boolean;
  onAccion: (accion: AccionFuncionario) => void;
  onModificar: () => void;
}

// Menú de opciones del Funcionario sobre un reporte (RF-12). Cada opción se habilita según
// el estado: se aprueba o rechaza un reporte pendiente, y se controla uno aprobado.
const OpcionesFuncionario: React.FC<OpcionesFuncionarioProps> = ({
  reporte,
  modificando,
  onAccion,
  onModificar,
}) => {
  const { estado } = reporte;
  const cerrado = estado === 'Controlado' || estado === 'Rechazado';

  const opciones: { accion: AccionFuncionario; texto: string; hecha: boolean; habilitada: boolean }[] = [
    {
      accion: 'aprobar',
      texto: 'Aprobar reporte',
      hecha: !!reporte.gestion?.aprobacion,
      habilitada: estado === 'Pendiente',
    },
    { accion: 'rechazar', texto: 'Rechazar reporte', hecha: estado === 'Rechazado', habilitada: estado === 'Pendiente' },
    {
      accion: 'controlar',
      texto: 'Reporte controlado',
      hecha: estado === 'Controlado',
      habilitada: estado === 'Aprobado' || estado === 'En atención',
    },
  ];

  const ayuda =
    estado === 'Pendiente'
      ? 'Revisa el reporte y apruébalo o recházalo.'
      : estado === 'Rechazado'
        ? 'Este reporte fue rechazado.'
        : estado === 'Controlado'
          ? 'Este reporte ya fue controlado.'
          : 'Cuando la cuadrilla termine, registra el reporte de control.';

  return (
    <section className="opciones-funcionario" aria-label="Opciones de funcionario">
      <div className="opciones-encabezado">
        <h2>Opciones de funcionario</h2>
        <IonIcon icon={buildOutline} aria-hidden="true" />
      </div>

      <div className="opciones-lista">
        {opciones.map((opcion) => (
          <button
            key={opcion.accion}
            type="button"
            className={opcion.hecha ? 'opcion-funcionario hecha' : 'opcion-funcionario'}
            onClick={() => onAccion(opcion.accion)}
            disabled={!opcion.habilitada}
          >
            {opcion.texto}
            <span className="opcion-marca" aria-hidden="true">
              {opcion.hecha && <IonIcon icon={checkmark} />}
            </span>
          </button>
        ))}
        <button
          type="button"
          className={modificando ? 'opcion-funcionario activa' : 'opcion-funcionario'}
          onClick={onModificar}
          disabled={cerrado}
          aria-pressed={modificando}
        >
          Modificar reporte
          <span className="opcion-marca icono" aria-hidden="true">
            <IonIcon icon={createOutline} />
          </span>
        </button>
      </div>

      <p className="opciones-ayuda">{ayuda}</p>
    </section>
  );
};

export default OpcionesFuncionario;
