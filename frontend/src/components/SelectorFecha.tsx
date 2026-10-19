import { useEffect, useState } from 'react';
import { IonDatetime, IonIcon, IonModal, IonButton } from '@ionic/react';
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

// Campo que abre un calendario al tocarlo. La selección se confirma con
// "Listo" para que navegar entre meses/años no cierre el modal por sorpresa.
const SelectorFecha: React.FC<SelectorFechaProps> = ({ etiqueta, valor, min, max, onCambiar }) => {
  const [abierto, setAbierto] = useState(false);
  // Borrador: la fecha que se está eligiendo dentro del modal, sin aplicar aún.
  const [borrador, setBorrador] = useState<string>(valor);

  // Cada vez que se abre el modal, se parte de la fecha actualmente seleccionada.
  useEffect(() => {
    if (abierto) setBorrador(valor);
  }, [abierto, valor]);

  const confirmar = () => {
    onCambiar(borrador ? borrador.slice(0, 10) : '');
    setAbierto(false);
  };

  const limpiar = () => {
    setBorrador('');
  };

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
        <div className="calendario-contenedor">
          <IonDatetime
            className="calendario"
            presentation="date"
            locale="es-CL"
            firstDayOfWeek={1}
            value={borrador || undefined}
            min={min}
            max={max}
            onIonChange={(e) => {
              const fecha = e.detail.value;
              setBorrador(typeof fecha === 'string' ? fecha : '');
            }}
          />
          <div className="calendario-acciones">
            <IonButton fill="clear" onClick={() => setAbierto(false)}>
              Cancelar
            </IonButton>
            <IonButton fill="clear" onClick={limpiar}>
              Borrar
            </IonButton>
            <IonButton className="calendario-confirmar" onClick={confirmar}>Listo</IonButton>
          </div>
        </div>
      </IonModal>
    </div>
  );
};

export default SelectorFecha;