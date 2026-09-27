import { useEffect, useState } from 'react';
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
  createOutline,
  folderOpenOutline,
  helpCircleOutline,
  imageOutline,
  locateOutline,
  mapOutline,
  thermometerOutline,
  waterOutline,
  warningOutline,
} from 'ionicons/icons';
import AvisoModal, { type TipoAviso } from '../../components/AvisoModal';
import AppLayout from '../../components/layout/AppLayout';
import CamposDesglose from '../../components/reportes/CamposDesglose';
import ExplicacionRiesgo from '../../components/reportes/ExplicacionRiesgo';
import GaleriaEditable from '../../components/reportes/GaleriaEditable';
import SelectorUbicacion, { type Ubicacion } from '../../components/reportes/SelectorUbicacion';
import { useConexion } from '../../hooks/useConexion';
import { useUbicacionActual } from '../../hooks/useUbicacionActual';
import { RUTAS, rutaEditarReporte } from '../../routes/rutas';
import { esClimaDeRiesgo, obtenerClimaActual, type Clima } from '../../services/climaService';
import { guardarPendiente } from '../../services/pendientesService';
import { crearReporte, type DatosNuevoReporte, type Reporte } from '../../services/reportesService';
import { calcularIndice } from '../../utils/opcionesReporte';
import { obtenerNivelRiesgo } from '../../utils/riesgo';
import { MAXIMO_TITULO, validarReporte } from '../../utils/validacionReporte';
import './FormularioReporte.css';

interface Aviso {
  tipo: TipoAviso;
  titulo: string;
  mensaje: string;
}

const CrearReporte: React.FC = () => {
  const router = useIonRouter();
  const [mostrarAlerta] = useIonAlert();
  const enLinea = useConexion();

  const [titulo, setTitulo] = useState('');
  const [sector, setSector] = useState('');
  const [categoria, setCategoria] = useState('');
  const [volumen, setVolumen] = useState('');
  const [distancia, setDistancia] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ubicacion, setUbicacion] = useState<Ubicacion | null>(null);
  const [enfocar, setEnfocar] = useState<Ubicacion | null>(null);
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [clima, setClima] = useState<Clima>();
  const [intentoEnviar, setIntentoEnviar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const gps = useUbicacionActual();
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [creado, setCreado] = useState<Reporte>();
  const [explicacionAbierta, setExplicacionAbierta] = useState(false);

  useEffect(() => {
    obtenerClimaActual().then(setClima);
  }, []);

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
  const hayCambios =
    !!(titulo || sector || categoria || volumen || distancia || descripcion || ubicacion) || imagenes.length > 0;

  const reiniciar = () => {
    setTitulo('');
    setSector('');
    setCategoria('');
    setVolumen('');
    setDistancia('');
    setDescripcion('');
    setUbicacion(null);
    setEnfocar(null);
    setImagenes([]);
    setIntentoEnviar(false);
    setAviso(null);
  };

  // Al salir de la pantalla se limpia el formulario para empezar de cero la próxima vez.
  useIonViewDidLeave(reiniciar);

  const usarMiUbicacion = () =>
    gps.obtener((punto) => {
      setUbicacion(punto);
      setEnfocar(punto);
    }, setMensaje);

  const enviar = async () => {
    setIntentoEnviar(true);
    if (Object.values(errores).some(Boolean) || !ubicacion) {
      setMensaje('Revisa los campos marcados en rojo.');
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
      setCreado(await crearReporte(datos));
      setAviso({
        tipo: 'exito',
        titulo: '¡Reporte creado con éxito!',
        mensaje:
          'Gracias por ayudar a tu comunidad. Tu reporte ya está en el mapa y quedará Pendiente hasta que el municipio lo revise.',
      });
    } catch (causa) {
      const sinEspacio = causa instanceof DOMException && causa.name === 'QuotaExceededError';
      setAviso({
        tipo: 'error',
        titulo: 'No pudimos crear el reporte',
        mensaje: sinEspacio
          ? 'Las fotos ocupan demasiado espacio en tu dispositivo. Prueba con menos fotos.'
          : 'Ocurrió un problema al enviarlo. Revisa tu conexión e inténtalo de nuevo.',
      });
    }
    setEnviando(false);
  };

  // Cierra el aviso, limpia el formulario y va a la pantalla elegida.
  const salirA = (ruta: string) => {
    setAviso(null);
    reiniciar();
    router.push(ruta, 'root');
  };

  const irAlMapa = () => salirA(creado ? `${RUTAS.inicio}?reporte=${creado.id}` : RUTAS.inicio);
  const irAMisReportes = () => salirA(RUTAS.misReportes);

  // Si el vecino se equivocó en algo, puede corregirlo apenas lo crea.
  const accionesExito = creado && [
    { texto: 'Ver en el mapa', icono: mapOutline, principal: true, onClick: irAlMapa },
    { texto: 'Editar reporte', icono: createOutline, onClick: () => salirA(rutaEditarReporte(creado.id)) },
    { texto: 'Mis reportes', icono: folderOpenOutline, onClick: irAMisReportes },
  ];
  const nivelCreado = creado && !creado.riesgoEnCalculo ? obtenerNivelRiesgo(creado.riesgo) : null;

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
            <IonInput
              label="Sector o dirección"
              labelPlacement="stacked"
              fill="outline"
              placeholder="Ej: Cerro Cordillera, escalera Fischer"
              value={sector}
              className={error('sector') ? 'campo-invalido ion-invalid ion-touched' : ''}
              errorText={error('sector')}
              onIonInput={(e) => setSector(e.detail.value ?? '')}
            />
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
              <SelectorUbicacion ubicacion={ubicacion} enfocar={enfocar} onCambiar={setUbicacion} />
              {error('ubicacion') && <p className="formulario-error">{error('ubicacion')}</p>}
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
        textoAceptar={aviso?.tipo === 'error' ? 'Reintentar' : 'Aceptar'}
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
        acciones={aviso?.tipo === 'exito' ? accionesExito : undefined}
      >
        {aviso?.tipo === 'exito' && creado && (
          <div className="resumen-creado">
            <div className="resumen-creado-foto">
              {creado.imagenes[0] ? (
                <img src={creado.imagenes[0]} alt="" />
              ) : (
                <IonIcon icon={imageOutline} aria-hidden="true" />
              )}
            </div>
            <div className="resumen-creado-datos">
              <strong>{creado.nombre}</strong>
              <span>
                ID {creado.id} · {creado.sector}
              </span>
              <div className="resumen-creado-etiquetas">
                <span>{creado.categoria}</span>
                {nivelCreado ? (
                  <span style={{ background: nivelCreado.color, color: nivelCreado.texto }}>
                    Riesgo {creado.riesgo} %
                  </span>
                ) : (
                  <span>Riesgo en cálculo</span>
                )}
              </div>
            </div>
          </div>
        )}
      </AvisoModal>

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
    </AppLayout>
  );
};

export default CrearReporte;
