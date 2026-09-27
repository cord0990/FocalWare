import { useState } from 'react';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonModal,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import { arrowDownOutline, arrowUpOutline, closeOutline } from 'ionicons/icons';
import SelectorFecha from '../SelectorFecha';
import { ESTADOS_REPORTE } from '../../services/reportesService';
import {
  FILTROS_INICIALES,
  type CriterioOrden,
  type FiltrosReportes,
} from '../../utils/filtrosReportes';
import './FiltrosReportesModal.css';

interface FiltrosReportesModalProps {
  abierto: boolean;
  filtros: FiltrosReportes;
  sectores: string[];
  categorias: string[];
  // Estado sin filtros al que vuelve "Quitar filtros".
  base?: FiltrosReportes;
  onCerrar: () => void;
  onAplicar: (filtros: FiltrosReportes) => void;
}

const FiltrosReportesModal: React.FC<FiltrosReportesModalProps> = ({
  abierto,
  filtros,
  sectores,
  categorias,
  base = FILTROS_INICIALES,
  onCerrar,
  onAplicar,
}) => {
  // Los cambios se guardan en un borrador y solo se aplican al tocar "Aplicar filtros".
  // Si se cierra con la X o tocando fuera, el borrador se descarta.
  const [borrador, setBorrador] = useState(filtros);

  const actualizar = (cambios: Partial<FiltrosReportes>) =>
    setBorrador((actual) => ({ ...actual, ...cambios }));

  const errorFechas =
    borrador.desde && borrador.hasta && borrador.desde > borrador.hasta
      ? 'La fecha de inicio no puede ser posterior a la de término.'
      : '';

  return (
    <IonModal
      isOpen={abierto}
      onWillPresent={() => setBorrador(filtros)}
      onDidDismiss={onCerrar}
      className="modal-filtros"
    >
      <IonContent className="filtros-contenido">
        <div className="filtros-marco">
          <div className="filtros-encabezado">
            <h2>Filtros</h2>
            <IonButton fill="clear" className="filtros-cerrar" onClick={onCerrar} aria-label="Cerrar filtros">
              <IonIcon slot="icon-only" icon={closeOutline} />
            </IonButton>
          </div>

          <div className="filtros-panel">
            <div className="filtros-columna">
              <IonSelect
                label="Estado"
                labelPlacement="stacked"
                fill="outline"
                interface="popover"
                placeholder="Todos"
                value={borrador.estado}
                onIonChange={(e) => actualizar({ estado: e.detail.value })}
              >
                <IonSelectOption value="">Todos</IonSelectOption>
                {ESTADOS_REPORTE.map((estado) => (
                  <IonSelectOption key={estado} value={estado}>
                    {estado}
                  </IonSelectOption>
                ))}
              </IonSelect>

              <fieldset className="filtros-fechas">
                <legend>Lapso de tiempo</legend>
                <SelectorFecha
                  etiqueta="Fecha de inicio"
                  valor={borrador.desde}
                  max={borrador.hasta || undefined}
                  onCambiar={(desde) => actualizar({ desde })}
                />
                <SelectorFecha
                  etiqueta="Fecha de término"
                  valor={borrador.hasta}
                  min={borrador.desde || undefined}
                  onCambiar={(hasta) => actualizar({ hasta })}
                />
              </fieldset>
              {errorFechas && <p className="filtros-error">{errorFechas}</p>}

              <IonSelect
                label="Sector"
                labelPlacement="stacked"
                fill="outline"
                interface="popover"
                placeholder="Todos"
                value={borrador.sector}
                onIonChange={(e) => actualizar({ sector: e.detail.value })}
              >
                <IonSelectOption value="">Todos</IonSelectOption>
                {sectores.map((sector) => (
                  <IonSelectOption key={sector} value={sector}>
                    {sector}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </div>

            <div className="filtros-columna">
              <div className="filtros-orden">
                <IonSelect
                  label="Ordenar por"
                  labelPlacement="stacked"
                  fill="outline"
                  interface="popover"
                  value={borrador.orden}
                  onIonChange={(e) => actualizar({ orden: e.detail.value as CriterioOrden })}
                >
                  <IonSelectOption value="riesgo">Riesgo</IonSelectOption>
                  <IonSelectOption value="votos">Votos</IonSelectOption>
                  <IonSelectOption value="fecha">Fecha</IonSelectOption>
                </IonSelect>
                <div className="filtros-direccion" role="group" aria-label="Dirección del orden">
                  <button
                    type="button"
                    className={borrador.descendente ? '' : 'activo'}
                    aria-pressed={!borrador.descendente}
                    aria-label="Ascendente"
                    title="Ascendente"
                    onClick={() => actualizar({ descendente: false })}
                  >
                    <IonIcon icon={arrowUpOutline} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={borrador.descendente ? 'activo' : ''}
                    aria-pressed={borrador.descendente}
                    aria-label="Descendente"
                    title="Descendente"
                    onClick={() => actualizar({ descendente: true })}
                  >
                    <IonIcon icon={arrowDownOutline} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <IonSelect
                label="Categoría(s)"
                labelPlacement="stacked"
                fill="outline"
                interface="popover"
                multiple
                placeholder="Todas"
                value={borrador.categorias}
                onIonChange={(e) => actualizar({ categorias: e.detail.value })}
              >
                {categorias.map((categoria) => (
                  <IonSelectOption key={categoria} value={categoria}>
                    {categoria}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </div>
          </div>

          <div className="filtros-acciones">
            <IonButton
              className="btn-limpiar"
              onClick={() => onAplicar(base)}
            >
              Quitar filtros
            </IonButton>
            <IonButton
              className="btn-aplicar"
              disabled={!!errorFechas}
              onClick={() => onAplicar(borrador)}
            >
              Aplicar filtros
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default FiltrosReportesModal;
