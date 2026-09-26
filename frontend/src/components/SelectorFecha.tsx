import { useState } from 'react';
import { IonDatetime, IonIcon, IonModal } from '@ionic/react';
import { calendarOutline } from 'ionicons/icons';
import { formatearFecha } from '../utils/fechas';
import './SelectorFecha.css';

interface SelectorFechaProps {
  etiqueta: string;
  valor: string;
  min?: string;
  max?: string;
  onCambiar: (fecha: string) => void;
}

// Campo que abre un calendario al tocarlo.
const SelectorFecha: React.FC<SelectorFechaProps> = ({ etiqueta, valor, min, max, onCambiar }) => {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="selector-fecha">
      <span className="selector-fecha-etiqueta">{etiqueta}</span>
      <button
        type="button"
        className={valor ? 'selector-fecha-boton' : 'selector-fecha-boton vacio'}
        onClick={() => setAbierto(true)}
        aria-label={`${etiqueta}: ${valor ? formatearFecha(valor) : 'sin seleccionar'}`}
      >
        <IonIcon icon={calendarOutline} aria-hidden="true" />
        {valor ? formatearFecha(valor) : 'Seleccionar'}
      </button>

      <IonModal isOpen={abierto} onDidDismiss={() => setAbierto(false)} className="modal-calendario">
        <IonDatetime
          className="calendario"
          presentation="date"
          locale="es-CL"
          firstDayOfWeek={1}
          value={valor || undefined}
          min={min}
          max={max}
          showDefaultButtons
          showClearButton
          doneText="Listo"
          cancelText="Cancelar"
          clearText="Borrar"
          onIonChange={(e) => {
            const fecha = e.detail.value;
            onCambiar(typeof fecha === 'string' ? fecha.slice(0, 10) : '');
            setAbierto(false);
          }}
          onIonCancel={() => setAbierto(false)}
        />
      </IonModal>
    </div>
  );
};

export default SelectorFecha;
