import { IonIcon, IonModal } from '@ionic/react';
import { alertCircleOutline, checkmarkCircleOutline, cloudOfflineOutline } from 'ionicons/icons';
import './AvisoModal.css';

export type TipoAviso = 'exito' | 'error' | 'sin-conexion';

export interface AccionAviso {
  texto: string;
  icono?: string;
  principal?: boolean;
  onClick: () => void;
}

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
  // Contenido extra bajo el mensaje (por ejemplo, un resumen del reporte creado).
  children?: React.ReactNode;
  // Si se entregan, reemplazan a los botones Aceptar y secundario.
  acciones?: AccionAviso[];
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
  children,
  acciones,
}) => (
  <IonModal
    isOpen={abierto}
    backdropDismiss={false}
    className={`aviso-modal aviso-${tipo}${acciones ? ' con-acciones' : ''}`}
  >
    <div className="aviso-marco" role="alertdialog" aria-labelledby="aviso-titulo" aria-describedby="aviso-mensaje">
      <div className="aviso-caja">
        <IonIcon icon={ICONOS[tipo]} className="aviso-icono" aria-hidden="true" />
        <h2 id="aviso-titulo">{titulo}</h2>
        <p id="aviso-mensaje">{mensaje}</p>
        {children}
      </div>
      {acciones ? (
        <div className="aviso-acciones">
          {acciones.map((accion) => (
            <button
              key={accion.texto}
              type="button"
              className={accion.principal ? 'aviso-accion principal' : 'aviso-accion'}
              onClick={accion.onClick}
            >
              {accion.icono && <IonIcon icon={accion.icono} aria-hidden="true" />}
              {accion.texto}
            </button>
          ))}
        </div>
      ) : (
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
      )}
    </div>
  </IonModal>
);

export default AvisoModal;
