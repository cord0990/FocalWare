import { useEffect, useRef, useState } from 'react';
import {
  IonButton,
  IonIcon,
  IonInput,
  IonSpinner,
  IonTextarea,
  IonToast,
  useIonAlert,
  useIonRouter,
  useIonViewDidLeave,
} from '@ionic/react';
import {
  arrowBackOutline,
  checkmarkCircleOutline,
  helpCircleOutline,
  locateOutline,
  thermometerOutline,
  waterOutline,
  warningOutline,
} from 'ionicons/icons';
import AvisoModal, { type TipoAviso } from '../../components/AvisoModal';
import AppLayout from '../../components/layout/AppLayout';
import CamposDesglose from '../../components/reportes/CamposDesglose';
import ExplicacionRiesgo from '../../components/reportes/ExplicacionRiesgo';
import GaleriaEditable from '../../components/reportes/GaleriaEditable';
import SelectorUbicacion from '../../components/reportes/SelectorUbicacion';
import { useConexion } from '../../hooks/useConexion';
import { useUbicacionActual } from '../../hooks/useUbicacionActual';
import { useGeocodificacion } from '../../hooks/useGeocodificacion';
import { RUTAS, rutaMiReporte } from '../../routes/rutas';
import { ErrorApi } from '../../services/api';
import { esClimaDeRiesgo, obtenerClimaActual, type Clima } from '../../services/climaService';
import { guardarPendiente } from '../../services/pendientesService';
import { crearReporte, type DatosNuevoReporte } from '../../services/reportesService';
import {
  calcularIndice,
  type CategoriaReporte,
  type DistanciaReporte,
  type VolumenReporte,
} from '../../utils/opcionesReporte';
import { obtenerNivelRiesgo } from '../../utils/riesgo';
import { MAXIMO_TITULO, irAlPrimerError, validarReporte } from '../../utils/validacionReporte';
import './FormularioReporte.css';

interface Aviso {
  tipo: TipoAviso;
  titulo: string;
  mensaje: string;
}

// Tiempo que el vecino ve el aviso verde antes de abrir el reporte creado.
const ESPERA_REDIRECCION_MS = 1800;

const CrearReporte: React.FC = () => {
  const router = useIonRouter();
  const [mostrarAlerta] = useIonAlert();
  const enLinea = useConexion();

  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState<CategoriaReporte | ''>('');
  const [volumen, setVolumen] = useState<VolumenReporte | ''>('');
  const [distancia, setDistancia] = useState<DistanciaReporte | ''>('');
  const [descripcion, setDescripcion] = useState('');
  const [mensaje, setMensaje] = useState('');
  const geo = useGeocodificacion('', null, setMensaje);
  const {
    sector,
    ubicacion,
    enfocar,
    sugerencias,
    buscandoSugerencias,
    cambiarUbicacion,
    onSectorChange,
    seleccionarSugerencia,
    limpiar: limpiarGeo,
  } = geo;
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [clima, setClima] = useState<Clima>();
  const [sinClima, setSinClima] = useState(false);
  const [intentoEnviar, setIntentoEnviar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const gps = useUbicacionActual();
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [exitoCreado, setExitoCreado] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [explicacionAbierta, setExplicacionAbierta] = useState(false);

  // El clima se pide para el punto elegido en el mapa, así el riesgo se calcula con el
  // mismo clima que la API guarda con el reporte. Si el clima no carga (sin conexión o
  // Open-Meteo caído), el reporte se puede crear igual.
  useEffect(() => {
    // Si el vecino mueve el punto antes de que llegue la respuesta, la anterior se ignora.
    let vigente = true;
    obtenerClimaActual(ubicacion ?? undefined)
      .then((nuevo) => {
        if (!vigente) return;
        setClima(nuevo);
        setSinClima(false);
      })
      .catch(() => {
        if (!vigente) return;
        setClima(undefined);
        setSinClima(true);
      });
    return () => {
      vigente = false;
    };
  }, [ubicacion]);

  // Un reporte nuevo todavía no tiene apoyos ni antigüedad; se usa el clima de ahora.
  const desglose = calcularIndice({ categoria, volumen, distancia, votos: 0, clima });
  const riesgo = desglose.indice;
  const nivel = riesgo === null ? null : obtenerNivelRiesgo(riesgo);

  const errores = validarReporte({
    titulo,
    sector,
    ubicacion,
    categoria,
    volumen,
    distancia,
    imagenes,
    descripcion,
  });
  const error = (campo: keyof typeof errores) => (intentoEnviar ? errores[campo] : '');
  const direccionLista = Boolean(
    ubicacion &&
      sector.trim() &&
      !geo.validandoUbicacion &&
      !geo.errorUbicacion &&
      !errores.sector,
  );
  const hayCambios =
    !!(titulo || sector || categoria || volumen || distancia || descripcion || ubicacion) || imagenes.length > 0;

  const reiniciar = () => {
    if (temporizador.current !== null) {
      clearTimeout(temporizador.current);
      temporizador.current = null;
    }
    setTitulo('');
    setCategoria('');
    setVolumen('');
    setDistancia('');
    setDescripcion('');
    limpiarGeo();
    setImagenes([]);
    setIntentoEnviar(false);
    setAviso(null);
    setExitoCreado(false);
    setEnviando(false);
  };

  // Al salir de la pantalla se limpia el formulario para empezar de cero la próxima vez.
  useIonViewDidLeave(reiniciar);

  // Si la pantalla se desmonta por otro camino, no debe quedar una redirección pendiente.
  useEffect(
    () => () => {
      if (temporizador.current !== null) clearTimeout(temporizador.current);
    },
    [],
  );

  const usarMiUbicacion = () =>
    gps.obtener((punto) => {
      cambiarUbicacion(punto);
    }, setMensaje);

  const enviar = async () => {
    if (enLinea && geo.validandoUbicacion) {
      setMensaje('Estamos verificando la ubicación...');
      return;
    }

    setIntentoEnviar(true);
    if (Object.values(errores).some(Boolean) || !ubicacion) {
      setMensaje('Revisa los campos marcados en rojo.');
      irAlPrimerError();
      return;
    }

    const datos: DatosNuevoReporte = {
      nombre: titulo.trim(),
      sector: sector.trim(),
      categoria,
      volumen,
      distanciaViviendas: distancia,
      descripcion: descripcion.trim(),
      latitud: ubicacion.latitud,
      longitud: ubicacion.longitud,
      imagenes,
      riesgo,
      clima,
    };

    // Sin conexión el reporte se guarda en el teléfono y se envía después (RF-02).
    if (!enLinea) {
      guardarPendiente(datos);
      setAviso({
        tipo: 'sin-conexion',
        titulo: 'Reporte guardado sin conexión',
        mensaje:
          'Se enviará automáticamente cuando vuelvas a tener internet. Puedes verlo en "Mis reportes".',
      });
      return;
    }

    setEnviando(true);
    try {
      const reporte = await crearReporte(datos);
      setExitoCreado(true);
      temporizador.current = setTimeout(() => {
        reiniciar();
        router.push(rutaMiReporte(reporte.id), 'root');
      }, ESPERA_REDIRECCION_MS);
    } catch (causa) {
      const sinEspacio = causa instanceof DOMException && causa.name === 'QuotaExceededError';
      const sinConexion = causa instanceof ErrorApi && causa.estado === 0;

      setAviso({
        tipo: 'error',
        titulo: 'No pudimos crear el reporte',
        mensaje: sinEspacio
          ? 'Las fotos ocupan demasiado espacio en tu dispositivo. Prueba con menos fotos.'
          : sinConexion
            ? 'No pudimos conectarnos con el servidor. Revisa tu conexión e inténtalo de nuevo.'
            : (causa as Error).message || 'Ocurrió un problema al enviarlo.',
      });
      setEnviando(false);
    }
  };

  // Cierra el aviso, limpia el formulario y va a la pantalla elegida.
  const salirA = (ruta: string) => {
    setAviso(null);
    reiniciar();
    router.push(ruta, 'root');
  };

  const irAMisReportes = () => salirA(RUTAS.misReportes);

  const cancelar = () => {
    if (!hayCambios) {
      router.push(RUTAS.misReportes, 'back');
      return;
    }
    mostrarAlerta({
      header: 'Cancelar reporte',
      message: 'Se perderán los datos y las fotos que ingresaste.',
      buttons: [
        { text: 'Seguir editando', role: 'cancel' },
        {
          text: 'Descartar',
          role: 'destructive',
          handler: () => {
            reiniciar();
            router.push(RUTAS.misReportes, 'back');
          },
        },
      ],
    });
  };

  return (
    <AppLayout>
      <div className="formulario-reporte">
        <aside className="formulario-lateral">
          <div
            className="formulario-riesgo"
            style={nivel ? { background: nivel.color, color: nivel.texto } : undefined}
            aria-live="polite"
          >
            <button
              type="button"
              className="boton-ayuda-riesgo"
              onClick={() => setExplicacionAbierta(true)}
              aria-label="¿Cómo se calcula el riesgo?"
              title="¿Cómo se calcula el riesgo?"
            >
              <IonIcon icon={helpCircleOutline} aria-hidden="true" />
            </button>
            <span className="formulario-riesgo-titulo">Riesgo estimado</span>
            <strong>{riesgo === null ? '-- %' : `${riesgo} %`}</strong>
            <span className="formulario-riesgo-tipo">
              {nivel ? `Riesgo ${nivel.etiqueta.toLowerCase()}` : 'Completa el desglose'}
            </span>
          </div>

          <section className="formulario-desglose" aria-label="Desglose del riesgo">
            <h2>Desglose</h2>
            <CamposDesglose
              categoria={categoria}
              volumen={volumen}
              distancia={distancia}
              errores={{ categoria: error('categoria'), volumen: error('volumen'), distancia: error('distancia') }}
              onCategoria={setCategoria}
              onVolumen={setVolumen}
              onDistancia={setDistancia}
            />
          </section>

          <section className="formulario-clima" aria-label="Clima ahora">
            <h2>Clima ahora</h2>
            {clima ? (
              <>
                <p className="formulario-clima-condicion">{clima.condicion}</p>
                <ul>
                  <li>
                    <IonIcon icon={thermometerOutline} aria-hidden="true" /> {clima.temperatura} °C
                  </li>
                  <li>
                    <IonIcon icon={waterOutline} aria-hidden="true" /> {clima.humedad} % humedad
                  </li>
                  <li>Viento {clima.viento} km/h</li>
                </ul>
                {esClimaDeRiesgo(clima) && (
                  <p className="formulario-clima-alerta">
                    <IonIcon icon={warningOutline} aria-hidden="true" /> Condiciones favorables para
                    incendios
                  </p>
                )}
              </>
            ) : sinClima ? (
              <p className="formulario-clima-condicion">No se pudo obtener el clima ahora.</p>
            ) : (
              <IonSpinner name="dots" />
            )}
          </section>
        </aside>

        <div className="formulario-principal">
          <button
            type="button"
            className="formulario-volver"
            onClick={() => router.push(RUTAS.misReportes, 'back')}
            disabled={enviando}
          >
            <span>
              <IonIcon icon={arrowBackOutline} aria-hidden="true" />
            </span>
            Volver a Mis reportes
          </button>

          <IonInput
            label="Título del reporte"
            labelPlacement="stacked"
            fill="outline"
            placeholder="Ej: Basura acumulada en la escalera Fischer"
            value={titulo}
            maxlength={MAXIMO_TITULO}
            counter
            className={error('titulo') ? 'campo-invalido ion-invalid ion-touched' : ''}
            errorText={error('titulo')}
            onIonInput={(e) => setTitulo(e.detail.value ?? '')}
          />

          <div className="formulario-fila-sector">
            <div className="formulario-sugerencias-contenedor">
              <IonInput
                label="Sector o dirección"
                labelPlacement="stacked"
                fill="outline"
                placeholder="Escribe una calle o un cerro"
                value={sector}
                className={
                  error('sector')
                    ? 'campo-invalido ion-invalid ion-touched'
                    : direccionLista
                      ? 'campo-confirmado'
                      : ''
                }
                errorText={error('sector')}
                onIonInput={(e) => {
                  onSectorChange(e.detail.value ?? '');
                }}
                onIonBlur={() => {
                  /* sugerencias se limpian en el hook */
                }}
              />
              {direccionLista && !buscandoSugerencias && sugerencias.length === 0 && (
                <p className="formulario-direccion-ok">
                  <IonIcon icon={checkmarkCircleOutline} aria-hidden="true" />
                  Dirección confirmada en el mapa
                </p>
              )}
              {sugerencias.length > 0 && (
                <ul className="formulario-sugerencias" role="listbox" aria-label="Sugerencias de dirección">
                  {sugerencias.map((sugerencia) => (
                    <li key={sugerencia.id} role="option">
                      <button type="button" onClick={() => seleccionarSugerencia(sugerencia)}>
                        {sugerencia.texto}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {buscandoSugerencias && <p className="formulario-sugerencias-cargando">Buscando direcciones…</p>}
            </div>
            <IonButton className="formulario-gps" onClick={usarMiUbicacion} disabled={gps.buscando}>
              {gps.buscando ? (
                <IonSpinner name="crescent" />
              ) : (
                <>
                  <IonIcon slot="start" icon={locateOutline} />
                  Usar mi ubicación
                </>
              )}
            </IonButton>
          </div>

          <div className="formulario-fila-mapa">
            <div className={error('ubicacion') ? 'formulario-mapa invalido' : 'formulario-mapa'}>
              <SelectorUbicacion
                ubicacion={ubicacion}
                confirmada={direccionLista}
                enfocar={enfocar}
                onCambiar={cambiarUbicacion}
              />
              {!geo.errorUbicacion && error('ubicacion') && <p className="formulario-error">{error('ubicacion')}</p>}
              {geo.errorUbicacion && (
                <p className="formulario-error" role="alert">
                  {geo.errorUbicacion}
                </p>
              )}
            </div>

            <GaleriaEditable
              imagenes={imagenes}
              error={error('imagenes')}
              onCambiar={setImagenes}
              onErrorCarga={setMensaje}
            />
          </div>

          <IonTextarea
            label="Descripción"
            labelPlacement="stacked"
            fill="outline"
            placeholder="Cuenta qué hay, desde cuándo está y cualquier detalle útil para la cuadrilla."
            value={descripcion}
            autoGrow
            rows={4}
            maxlength={500}
            counter
            className={
              error('descripcion')
                ? 'formulario-descripcion campo-invalido ion-invalid ion-touched'
                : 'formulario-descripcion'
            }
            errorText={error('descripcion')}
            onIonInput={(e) => setDescripcion(e.detail.value ?? '')}
          />

          <div className="formulario-acciones">
            <IonButton className="formulario-cancelar" onClick={cancelar} disabled={enviando}>
              Cancelar reporte
            </IonButton>
            <IonButton className="formulario-subir" onClick={enviar} disabled={enviando}>
              {enviando ? <IonSpinner name="crescent" /> : 'Subir reporte'}
            </IonButton>
          </div>
        </div>
      </div>

      <AvisoModal
        abierto={!!aviso}
        tipo={aviso?.tipo ?? 'exito'}
        titulo={aviso?.titulo ?? ''}
        mensaje={aviso?.mensaje ?? ''}
        textoAceptar={aviso?.tipo === 'error' ? 'Reintentar' : 'Ver en Mis reportes'}
        textoSecundario={aviso?.tipo === 'error' ? 'Cerrar' : undefined}
        onAceptar={
          aviso?.tipo === 'error'
            ? () => {
                setAviso(null);
                enviar();
              }
            : irAMisReportes
        }
        onSecundario={() => setAviso(null)}
      />

      <ExplicacionRiesgo
        abierto={explicacionAbierta}
        desglose={desglose}
        onCerrar={() => setExplicacionAbierta(false)}
      />

      <IonToast
        isOpen={!!mensaje}
        message={mensaje}
        duration={3000}
        position="top"
        onDidDismiss={() => setMensaje('')}
      />

      <IonToast
        isOpen={exitoCreado}
        color="success"
        icon={checkmarkCircleOutline}
        message="¡Reporte creado con éxito! Te llevamos a tu reporte…"
        duration={ESPERA_REDIRECCION_MS}
        position="top"
        onDidDismiss={() => setExitoCreado(false)}
      />
    </AppLayout>
  );
};

export default CrearReporte;