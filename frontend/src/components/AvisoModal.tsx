import { IonIcon, IonModal } from '@ionic/react';
import { alertCircleOutline, checkmarkCircleOutline, cloudOfflineOutline } from 'ionicons/icons';
import './AvisoModal.css';

export type TipoAviso = 'exito' | 'error' | 'sin-conexion';

interface AvisoModalProps {
  abierto: boolean;
  tipo: TipoAviso;
  titulo: string;
  mensaje: string;
  textoAceptar?: string;
  // Botón opcional a la izquierda (por ejemplo, "Cerrar" junto a "Reintentar").
  textoSecundario?: string;
  onAceptar: () => void;
  onSecundario?: () => void;
}

const ICONOS: Record<TipoAviso, string> = {
  exito: checkmarkCircleOutline,
  error: alertCircleOutline,
  'sin-conexion': cloudOfflineOutline,
};

// Ventana emergente para avisar el resultado de una acción (por ejemplo, al crear un reporte).
// No se cierra tocando afuera: el usuario tiene que elegir un botón.
const AvisoModal: React.FC<AvisoModalProps> = ({
  abierto,
  tipo,
  titulo,
  mensaje,
  textoAceptar = 'Aceptar',
  textoSecundario,
  onAceptar,
  onSecundario,
}) => (
  <IonModal isOpen={abierto} backdropDismiss={false} className={`aviso-modal aviso-${tipo}`}>
    <div className="aviso-marco" role="alertdialog" aria-labelledby="aviso-titulo" aria-describedby="aviso-mensaje">
      <div className="aviso-caja">
        <IonIcon icon={ICONOS[tipo]} className="aviso-icono" aria-hidden="true" />
        <h2 id="aviso-titulo">{titulo}</h2>
        <p id="aviso-mensaje">{mensaje}</p>
      </div>
      <div className="aviso-botones">
        {textoSecundario && onSecundario && (
          <button type="button" className="aviso-boton secundario" onClick={onSecundario}>
            {textoSecundario}
          </button>
        )}
        <button type="button" className="aviso-boton" onClick={onAceptar}>
          {textoAceptar}
        </button>
      </div>
    </div>
  </IonModal>
);

export default AvisoModal;
