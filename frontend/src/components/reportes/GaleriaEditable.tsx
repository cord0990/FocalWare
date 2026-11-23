import { useRef, useState } from 'react';
import { IonIcon, IonSpinner } from '@ionic/react';
import {
  cameraOutline,
  closeOutline,
  cloudUploadOutline,
  imagesOutline,
  star,
  starOutline,
} from 'ionicons/icons';
import { urlDeImagen } from '../../services/api';
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
// Recibe las fotos como vienen (rutas del servidor o data URL de las recién cargadas) y
// solo convierte a dirección para mostrarlas.
const GaleriaEditable: React.FC<GaleriaEditableProps> = ({
  imagenes,
  error,
  onCambiar,
  onErrorCarga,
}) => {
  const entradaCamara = useRef<HTMLInputElement>(null);
  const entradaGaleria = useRef<HTMLInputElement>(null);
  const contadorArrastre = useRef(0);
  const [procesando, setProcesando] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const [aviso, setAviso] = useState('');
  const [portada, ...complementarias] = imagenes.map(urlDeImagen);
  const hayEspacio = imagenes.length < MAXIMO_FOTOS;

  const agregarArchivos = async (archivos: File[]) => {
    if (procesando) {
      setAviso('Esperá a que terminemos de procesar las fotos.');
      return;
    }

    const disponibles = MAXIMO_FOTOS - imagenes.length;
    if (disponibles <= 0) {
      setAviso(`Ya tienes ${MAXIMO_FOTOS} fotos, el máximo permitido.`);
      return;
    }

    const imagenesValidas = archivos.filter((archivo) => archivo.type.startsWith('image/'));
    if (imagenesValidas.length === 0) {
      setAviso('Solo se pueden agregar imágenes.');
      return;
    }

    const seleccionadas = imagenesValidas.slice(0, disponibles);
    const truncado = imagenesValidas.length > disponibles;

    setAviso('');
    setProcesando(true);
    try {
      const nuevas = await Promise.all(seleccionadas.map((archivo) => comprimirImagen(archivo)));
      onCambiar([...imagenes, ...nuevas].slice(0, MAXIMO_FOTOS));
      if (truncado) {
        setAviso(
          `Se agregaron ${disponibles} de ${imagenesValidas.length} fotos: el máximo es ${MAXIMO_FOTOS}.`,
        );
      }
    } catch {
      onErrorCarga('No pudimos cargar una de las fotos. Prueba con otra imagen.');
    }
    setProcesando(false);
  };

  const agregarDesdeInput = (evento: React.ChangeEvent<HTMLInputElement>) => {
    const archivos = Array.from(evento.target.files ?? []);
    evento.target.value = '';
    void agregarArchivos(archivos);
  };

  const abrirCamara = () => entradaCamara.current?.click();
  const abrirGaleria = () => entradaGaleria.current?.click();

  const quitar = (indice: number) => onCambiar(imagenes.filter((_, posicion) => posicion !== indice));

  // Mueve una foto complementaria al primer lugar, que es la portada.
  const usarComoPortada = (indice: number) =>
    onCambiar([imagenes[indice], ...imagenes.filter((_, posicion) => posicion !== indice)]);

  const arrastraArchivos = (evento: React.DragEvent) =>
    Array.from(evento.dataTransfer.types).includes('Files');

  const onDragEnter = (evento: React.DragEvent) => {
    if (!arrastraArchivos(evento)) return;
    evento.preventDefault();
    contadorArrastre.current += 1;
    setArrastrando(true);
  };

  const onDragOver = (evento: React.DragEvent) => {
    if (!arrastraArchivos(evento)) return;
    evento.preventDefault();
    evento.dataTransfer.dropEffect = 'copy';
  };

  const onDragLeave = (evento: React.DragEvent) => {
    evento.preventDefault();
    contadorArrastre.current = Math.max(0, contadorArrastre.current - 1);
    if (contadorArrastre.current === 0) setArrastrando(false);
  };

  const onDrop = (evento: React.DragEvent) => {
    evento.preventDefault();
    contadorArrastre.current = 0;
    setArrastrando(false);
    const archivos = Array.from(evento.dataTransfer.files);
    if (archivos.length > 0) void agregarArchivos(archivos);
  };

  return (
    <section
      className={`galeria-editable${error ? ' invalido' : ''}${arrastrando ? ' arrastrando' : ''}`}
      aria-label="Fotografías"
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="galeria-editable-encabezado">
        <h2>Fotografías</h2>
        <span>
          {imagenes.length} de {MAXIMO_FOTOS}
        </span>
      </div>
      <p className="galeria-editable-ayuda">
        La foto grande es la <b>portada</b> del reporte; las demás son complementarias.
      </p>

      <div className="galeria-editable-acciones">
        <button
          type="button"
          className="galeria-editable-boton camara"
          onClick={abrirCamara}
          disabled={procesando || !hayEspacio}
        >
          <IonIcon icon={cameraOutline} aria-hidden="true" />
          Tomar foto
        </button>
        <button
          type="button"
          className="galeria-editable-boton"
          onClick={abrirGaleria}
          disabled={procesando || !hayEspacio}
        >
          <IonIcon icon={imagesOutline} aria-hidden="true" />
          Elegir de galería
        </button>
        {procesando && (
          <span className="galeria-editable-procesando" role="status">
            <IonSpinner name="crescent" /> Procesando…
          </span>
        )}
        {!hayEspacio && !procesando && (
          <span className="galeria-editable-limite">Máximo de fotos alcanzado.</span>
        )}
      </div>

      {aviso && (
        <p className="galeria-editable-aviso" role="status">
          {aviso}
        </p>
      )}

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
                disabled={procesando}
                aria-label="Quitar portada"
                title="Quitar portada"
              >
                <IonIcon icon={closeOutline} aria-hidden="true" />
              </button>
            </>
          ) : (
            <div className="galeria-editable-vacia">
              <IonIcon icon={cameraOutline} aria-hidden="true" />
              <span>Arrastrá una foto acá o usá los botones de arriba</span>
            </div>
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
                      disabled={procesando}
                      aria-label={`Usar la foto complementaria ${indice} como portada`}
                      title="Usar como portada"
                    >
                      <IonIcon icon={starOutline} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="galeria-editable-quitar"
                      onClick={() => quitar(indice)}
                      disabled={procesando}
                      aria-label={`Quitar foto complementaria ${indice}`}
                      title="Quitar foto"
                    >
                      <IonIcon icon={closeOutline} aria-hidden="true" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {error && <p className="galeria-editable-error">{error}</p>}

      {arrastrando && (
        <div className="galeria-editable-soltar" aria-hidden="true">
          <IonIcon icon={cloudUploadOutline} />
          <span>Soltá las fotos acá</span>
        </div>
      )}

      <input
        ref={entradaCamara}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={agregarDesdeInput}
      />
      <input
        ref={entradaGaleria}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={agregarDesdeInput}
      />
    </section>
  );
};

export default GaleriaEditable;
