import { useEffect, useState } from 'react';
import {
  IonButton,
  IonIcon,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTextarea,
} from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import SelectorFecha from '../SelectorFecha';
import GaleriaEditable from '../reportes/GaleriaEditable';
import {
  aprobarReporte,
  controlarReporte,
  fechaDeHoy,
  rechazarReporte,
  type Reporte,
} from '../../services/reportesService';
import { formatearFecha } from '../../utils/fechas';
import { CUADRILLAS, MINIMO_MOTIVO } from '../../utils/gestionMunicipal';
import type { AccionFuncionario } from './OpcionesFuncionario';
import './ModalGestion.css';

interface ModalGestionProps {
  accion: AccionFuncionario | null;
  reporte: Reporte;
  funcionario: string;
  onCerrar: () => void;
  // Se llama cuando la acción quedó guardada.
  onHecho: () => void;
}

const TITULOS: Record<AccionFuncionario, string> = {
  aprobar: 'Aprobación de reporte',
  rechazar: 'Rechazo de reporte',
  controlar: 'Reporte controlado',
};

const BOTONES: Record<AccionFuncionario, string> = {
  aprobar: 'Aprobar reporte',
  rechazar: 'Rechazar reporte',
  controlar: 'Registrar control',
};

// Ventanas de gestión del Funcionario: aprobar (RF-17), rechazar (RF-18) y controlar (RF-16).
const ModalGestion: React.FC<ModalGestionProps> = ({ accion, reporte, funcionario, onCerrar, onHecho }) => {
  const [cuadrilla, setCuadrilla] = useState('');
  const [fechaAtencion, setFechaAtencion] = useState('');
  const [texto, setTexto] = useState('');
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [intento, setIntento] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorFotos, setErrorFotos] = useState('');

  // Cada vez que se abre, el formulario parte vacío.
  useEffect(() => {
    if (!accion) return;
    setCuadrilla('');
    setFechaAtencion('');
    setTexto('');
    setImagenes([]);
    setIntento(false);
    setErrorFotos('');
  }, [accion]);

  if (!accion) return <IonModal isOpen={false} />;

  const errores = {
    cuadrilla: accion === 'aprobar' && !cuadrilla ? 'Selecciona la cuadrilla.' : '',
    fecha: accion === 'aprobar' && !fechaAtencion ? 'Selecciona la fecha de atención.' : '',
    texto:
      accion !== 'aprobar' && texto.trim().length < MINIMO_MOTIVO
        ? accion === 'rechazar'
          ? `Explica el motivo del rechazo (mínimo ${MINIMO_MOTIVO} caracteres). El vecino lo verá.`
          : `Describe el trabajo realizado (mínimo ${MINIMO_MOTIVO} caracteres).`
        : '',
    imagenes: accion === 'controlar' && imagenes.length === 0 ? 'Adjunta al menos una foto como evidencia.' : '',
  };
  const error = (campo: keyof typeof errores) => (intento ? errores[campo] : '');

  const confirmar = async () => {
    setIntento(true);
    if (Object.values(errores).some(Boolean)) return;
    setGuardando(true);
    if (accion === 'aprobar') {
      await aprobarReporte(reporte.id, { cuadrilla, fechaAtencion, detalle: texto.trim() }, funcionario);
    } else if (accion === 'rechazar') {
      await rechazarReporte(reporte.id, texto.trim(), funcionario);
    } else {
      await controlarReporte(reporte.id, { detalle: texto.trim(), imagenes }, funcionario);
    }
    onHecho();
    setGuardando(false);
  };

  const etiquetaTexto =
    accion === 'aprobar'
      ? 'Detalles de la aprobación (opcional)'
      : accion === 'rechazar'
        ? 'Motivo del rechazo'
        : 'Detalles del control';

  const ahora = new Date();
  const hora = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;

  return (
    <IonModal isOpen onDidDismiss={onCerrar} className="modal-gestion">
      {/* Sin IonContent: la ventana toma el alto de su contenido y solo se desplaza si no cabe */}
      <div className="gestion-contenido">
        <div className="gestion-marco">
          <div className="gestion-encabezado">
            <h2>{TITULOS[accion]}</h2>
            <IonButton fill="clear" onClick={onCerrar} aria-label="Cerrar">
              <IonIcon slot="icon-only" icon={closeOutline} />
            </IonButton>
          </div>
          <p className="gestion-reporte">
            {reporte.id} · {reporte.nombre}
          </p>

          {accion === 'aprobar' && (
            <div className="gestion-campos-fila">
              <div className="gestion-campo">
                <span className="gestion-etiqueta" aria-hidden="true">
                  Cuadrilla
                </span>
                <IonSelect
                  aria-label="Cuadrilla"
                  fill="outline"
                  interface="popover"
                  placeholder="Seleccionar cuadrilla"
                  value={cuadrilla}
                  className={error('cuadrilla') ? 'campo-invalido' : ''}
                  onIonChange={(e) => setCuadrilla(e.detail.value)}
                >
                  {CUADRILLAS.map((opcion) => (
                    <IonSelectOption key={opcion} value={opcion}>
                      {opcion}
                    </IonSelectOption>
                  ))}
                </IonSelect>
                {error('cuadrilla') && <p className="gestion-error">{error('cuadrilla')}</p>}
              </div>
              <div className="gestion-campo">
                <SelectorFecha
                  etiqueta="Fecha de atención"
                  valor={fechaAtencion}
                  min={fechaDeHoy()}
                  onCambiar={setFechaAtencion}
                />
                {error('fecha') && <p className="gestion-error">{error('fecha')}</p>}
              </div>
            </div>
          )}

          {accion === 'controlar' && (
            <>
              <dl className="gestion-control-info">
                <div>
                  <dt>Fecha</dt>
                  <dd>{formatearFecha(fechaDeHoy())}</dd>
                </div>
                <div>
                  <dt>Hora</dt>
                  <dd>{hora}</dd>
                </div>
                <div>
                  <dt>Lugar</dt>
                  <dd>{reporte.sector}</dd>
                </div>
                <div>
                  <dt>Cuadrilla</dt>
                  <dd>{reporte.gestion?.aprobacion?.cuadrilla ?? 'Sin asignar'}</dd>
                </div>
                <div>
                  <dt>Funcionario</dt>
                  <dd>{funcionario}</dd>
                </div>
              </dl>
              <GaleriaEditable
                imagenes={imagenes}
                error={error('imagenes')}
                onCambiar={setImagenes}
                onErrorCarga={setErrorFotos}
              />
              {errorFotos && <p className="gestion-error">{errorFotos}</p>}
            </>
          )}

          <span className="gestion-etiqueta" aria-hidden="true">
            {etiquetaTexto}
          </span>
          <IonTextarea
            aria-label={etiquetaTexto}
            fill="outline"
            placeholder={
              accion === 'aprobar'
                ? 'Ej: llevar camión tolva y coordinar con Bomberos.'
                : accion === 'rechazar'
                  ? 'Ej: el lugar corresponde a un recinto privado y ya fue notificado.'
                  : 'Ej: se retiraron 3 m³ de residuos y se limpió la quebrada.'
            }
            value={texto}
            rows={5}
            autoGrow
            maxlength={500}
            counter
            className={error('texto') ? 'gestion-texto campo-invalido ion-invalid ion-touched' : 'gestion-texto'}
            errorText={error('texto')}
            onIonInput={(e) => setTexto(e.detail.value ?? '')}
          />

          <div className="gestion-botones">
            <IonButton className="gestion-cancelar" onClick={onCerrar} disabled={guardando}>
              Cancelar
            </IonButton>
            <IonButton className="gestion-confirmar" onClick={confirmar} disabled={guardando}>
              {guardando ? <IonSpinner name="crescent" /> : BOTONES[accion]}
            </IonButton>
          </div>
        </div>
      </div>
    </IonModal>
  );
};

export default ModalGestion;
