import { useState } from 'react';
import {
  IonButton,
  IonContent,
  IonDatetime,
  IonIcon,
  IonModal,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import { calendarOutline, closeOutline } from 'ionicons/icons';
import { formatearFecha } from '../../utils/fechas';
import { ESTADOS_REPORTE, esEstadoReporte } from '../../services/reportesService';
import {
  esCategoriaReporte,
  type CategoriaReporte,
} from '../../utils/opcionesReporte';
import {
  FILTROS_INICIALES,
  TEXTOS_ORDEN,
  type CriterioOrden,
  type FiltrosReportes,
} from '../../utils/filtrosReportes';
import './FiltrosReportesModal.css';

interface FiltrosReportesModalProps {
  abierto: boolean;
  filtros: FiltrosReportes;
  sectores: string[];
  categorias: CategoriaReporte[];
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
  // Qué fecha se está eligiendo en el calendario: la de inicio o la de término.
  const [campoFecha, setCampoFecha] = useState<'desde' | 'hasta'>('desde');

  const actualizar = (cambios: Partial<FiltrosReportes>) =>
    setBorrador((actual) => ({ ...actual, ...cambios }));

  const errorFechas =
    borrador.desde && borrador.hasta && borrador.desde > borrador.hasta
      ? 'La fecha de inicio no puede ser posterior a la de término.'
      : '';

  return (
    <IonModal
      isOpen={abierto}
      onWillPresent={() => {
        setBorrador(filtros);
        setCampoFecha('desde');
      }}
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
              <div className="filtros-campo">
                <span className="filtros-etiqueta" id="filtros-orden-etiqueta">Ordenar por:</span>
                <IonSelect
                  aria-labelledby="filtros-orden-etiqueta"
                  fill="outline"
                  interface="popover"
                  value={borrador.orden}
                  onIonChange={(e) => actualizar({ orden: e.detail.value as CriterioOrden })}
                >
                  <IonSelectOption value="riesgo">Riesgo</IonSelectOption>
                  <IonSelectOption value="votos">Votos</IonSelectOption>
                  <IonSelectOption value="fecha">Fecha</IonSelectOption>
                </IonSelect>
                {/* La dirección se dice con palabras según lo que se ordena, no con flechas */}
                <div className="filtros-direccion" role="group" aria-labelledby="filtros-orden-etiqueta">
                  <button
                    type="button"
                    className={borrador.descendente ? 'activo' : ''}
                    aria-pressed={borrador.descendente}
                    onClick={() => actualizar({ descendente: true })}
                  >
                    {TEXTOS_ORDEN[borrador.orden].mayor}
                  </button>
                  <button
                    type="button"
                    className={borrador.descendente ? '' : 'activo'}
                    aria-pressed={!borrador.descendente}
                    onClick={() => actualizar({ descendente: false })}
                  >
                    {TEXTOS_ORDEN[borrador.orden].menor}
                  </button>
                </div>
              </div>

              <div className="filtros-campo">
                <span className="filtros-etiqueta">Sector:</span>
                <IonSelect
                  aria-label="Sector"
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

              <div className="filtros-campo">
                <span className="filtros-etiqueta">Categoría(s):</span>
                <IonSelect
                  aria-label="Categorías"
                  fill="outline"
                  interface="popover"
                  multiple
                  placeholder="Todas"
                  value={borrador.categorias}
                  onIonChange={(e) => {
                    const valor = e.detail.value;
                    if (Array.isArray(valor)) {
                      actualizar({ categorias: valor.filter(esCategoriaReporte) });
                    }
                  }}
                >
                  {categorias.map((categoria) => (
                    <IonSelectOption key={categoria} value={categoria}>
                      {categoria}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </div>

              <div className="filtros-campo">
                <span className="filtros-etiqueta">Estado:</span>
                <IonSelect
                  aria-label="Estado"
                  fill="outline"
                  interface="popover"
                  placeholder="Todos"
                  value={borrador.estado}
                  onIonChange={(e) => {
                    const estado = e.detail.value;
                    if (estado === '' || esEstadoReporte(estado)) {
                      actualizar({ estado });
                    }
                  }}
                >
                  <IonSelectOption value="">Todos</IonSelectOption>
                  {ESTADOS_REPORTE.map((estado) => (
                    <IonSelectOption key={estado} value={estado}>
                      {estado}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </div>
            </div>

            <div className="filtros-columna">
              <div className="filtros-fechas">
                <span className="filtros-etiqueta filtros-etiqueta-titulo">Lapso de tiempo</span>
                {/* Se elige qué fecha marcar y luego el día en el calendario */}
                <div className="filtros-fechas-campos" role="group" aria-label="Fecha que se elige en el calendario">
                  {(['desde', 'hasta'] as const).map((campo) => (
                    <button
                      key={campo}
                      type="button"
                      className={campoFecha === campo ? 'filtros-fecha activo' : 'filtros-fecha'}
                      aria-pressed={campoFecha === campo}
                      onClick={() => setCampoFecha(campo)}
                    >
                      <span className="filtros-fecha-nombre">{campo === 'desde' ? 'Desde' : 'Hasta'}</span>
                      <span className={borrador[campo] ? 'filtros-fecha-valor' : 'filtros-fecha-valor vacio'}>
                        <IonIcon icon={calendarOutline} aria-hidden="true" />
                        {borrador[campo] ? formatearFecha(borrador[campo]) : 'Sin fecha'}
                      </span>
                    </button>
                  ))}
                </div>
                <IonDatetime
                  key={campoFecha}
                  className="filtros-calendario"
                  presentation="date"
                  locale="es-CL"
                  firstDayOfWeek={1}
                  value={borrador[campoFecha] || undefined}
                  min={campoFecha === 'hasta' ? borrador.desde || undefined : undefined}
                  max={campoFecha === 'desde' ? borrador.hasta || undefined : undefined}
                  onIonChange={(e) => {
                    const fecha = typeof e.detail.value === 'string' ? e.detail.value.slice(0, 10) : '';
                    actualizar({ [campoFecha]: fecha });
                    // Después de elegir el inicio se pasa solo al término
                    if (campoFecha === 'desde' && fecha) setCampoFecha('hasta');
                  }}
                />
                {(borrador.desde || borrador.hasta) && (
                  <button
                    type="button"
                    className="filtros-borrar-fechas"
                    onClick={() => {
                      actualizar({ desde: '', hasta: '' });
                      setCampoFecha('desde');
                    }}
                  >
                    Borrar fechas
                  </button>
                )}
                {errorFechas && <p className="filtros-error">{errorFechas}</p>}
              </div>
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
