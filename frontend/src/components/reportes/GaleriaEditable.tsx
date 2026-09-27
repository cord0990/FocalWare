import { useRef, useState } from 'react';
import { IonIcon, IonSpinner } from '@ionic/react';
import { add, cameraOutline, closeOutline, star, starOutline } from 'ionicons/icons';
import { comprimirImagen } from '../../utils/imagenes';
import { MAXIMO_FOTOS } from '../../utils/validacionReporte';
import './GaleriaEditable.css';

interface GaleriaEditableProps {
  imagenes: string[];
  error?: string;
  onCambiar: (imagenes: string[]) => void;
  onErrorCarga: (mensaje: string) => void;
}

// Fotografías de un reporte: la portada en grande y las complementarias en una columna al lado.
const GaleriaEditable: React.FC<GaleriaEditableProps> = ({ imagenes, error, onCambiar, onErrorCarga }) => {
  const entrada = useRef<HTMLInputElement>(null);
  const [procesando, setProcesando] = useState(false);
  const [portada, ...complementarias] = imagenes;
  const hayEspacio = imagenes.length < MAXIMO_FOTOS;

  const abrirSelector = () => entrada.current?.click();

  const agregar = async (evento: React.ChangeEvent<HTMLInputElement>) => {
    const archivos = Array.from(evento.target.files ?? []).slice(0, MAXIMO_FOTOS - imagenes.length);
    evento.target.value = '';
    if (archivos.length === 0) return;
    setProcesando(true);
    try {
      const nuevas = await Promise.all(archivos.map((archivo) => comprimirImagen(archivo)));
      onCambiar([...imagenes, ...nuevas].slice(0, MAXIMO_FOTOS));
    } catch {
      onErrorCarga('No pudimos cargar una de las fotos. Prueba con otra imagen.');
    }
    setProcesando(false);
  };

  const quitar = (indice: number) => onCambiar(imagenes.filter((_, posicion) => posicion !== indice));

  // Mueve una foto complementaria al primer lugar, que es la portada.
  const usarComoPortada = (indice: number) =>
    onCambiar([imagenes[indice], ...imagenes.filter((_, posicion) => posicion !== indice)]);

  return (
    <section className={error ? 'galeria-editable invalido' : 'galeria-editable'} aria-label="Fotografías">
      <div className="galeria-editable-encabezado">
        <h2>Fotografías</h2>
        <span>
          {imagenes.length} de {MAXIMO_FOTOS}
        </span>
      </div>
      <p className="galeria-editable-ayuda">
        La foto grande es la <b>portada</b> del reporte; las demás son complementarias.
      </p>

      <div className={portada ? 'galeria-editable-cuerpo' : 'galeria-editable-cuerpo sin-fotos'}>
        <div className="galeria-editable-portada">
          {portada ? (
            <>
              <img src={portada} alt="Portada del reporte" />
              <span className="galeria-editable-etiqueta">
                <IonIcon icon={star} aria-hidden="true" /> Portada
              </span>
              <button
                type="button"
                className="galeria-editable-quitar"
                onClick={() => quitar(0)}
                aria-label="Quitar portada"
                title="Quitar portada"
              >
                <IonIcon icon={closeOutline} aria-hidden="true" />
              </button>
            </>
          ) : (
            <button
              type="button"
              className="galeria-editable-agregar-portada"
              onClick={abrirSelector}
              disabled={procesando}
            >
              {procesando ? (
                <IonSpinner name="crescent" />
              ) : (
                <>
                  <IonIcon icon={cameraOutline} aria-hidden="true" />
                  Agregar portada
                </>
              )}
            </button>
          )}
        </div>

        {portada && (
          <div className="galeria-editable-columna">
            <div className="galeria-editable-miniaturas" aria-label="Fotos complementarias">
              {complementarias.map((imagen, posicion) => {
                const indice = posicion + 1;
                return (
                  <div key={indice} className="galeria-editable-miniatura">
                    <img src={imagen} alt={`Foto complementaria ${indice}`} />
                    <button
                      type="button"
                      className="galeria-editable-destacar"
                      onClick={() => usarComoPortada(indice)}
                      aria-label={`Usar la foto complementaria ${indice} como portada`}
                      title="Usar como portada"
                    >
                      <IonIcon icon={starOutline} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="galeria-editable-quitar"
                      onClick={() => quitar(indice)}
                      aria-label={`Quitar foto complementaria ${indice}`}
                      title="Quitar foto"
                    >
                      <IonIcon icon={closeOutline} aria-hidden="true" />
                    </button>
                  </div>
                );
              })}
              {hayEspacio && (
                <button
                  type="button"
                  className="galeria-editable-agregar"
                  onClick={abrirSelector}
                  disabled={procesando}
                  aria-label="Agregar fotos complementarias"
                  title="Agregar fotos complementarias"
                >
                  {procesando ? <IonSpinner name="crescent" /> : <IonIcon icon={add} aria-hidden="true" />}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="galeria-editable-error">{error}</p>}
      <input ref={entrada} type="file" accept="image/*" multiple hidden onChange={agregar} />
    </section>
  );
};

export default GaleriaEditable;
