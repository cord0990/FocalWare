import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  IonButton,
  IonIcon,
  IonInput,
  IonSpinner,
  IonTextarea,
  IonToast,
  useIonAlert,
  useIonRouter,
} from '@ionic/react';
import {
  arrowBackOutline,
  cloudOfflineOutline,
  helpCircleOutline,
  locateOutline,
  lockClosedOutline,
  pencilOutline,
  thermometerOutline,
  trashOutline,
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
import { RUTAS, rutaMiReporte } from '../../routes/rutas';
import { esClimaDeRiesgo } from '../../services/climaService';
import {
  actualizarPendiente,
  eliminarPendiente,
  obtenerPendientePorId,
  type ReportePendiente,
} from '../../services/pendientesService';
import {
  actualizarReporte,
  eliminarReporte,
  obtenerReportePorId,
  puedeEliminar,
  puedeModificar,
  type CambiosReporte,
  type Reporte,
} from '../../services/reportesService';
import { ESTILO_ESTADO } from '../../utils/estados';
import { antiguedad, formatearFecha } from '../../utils/fechas';
import { calcularIndice } from '../../utils/opcionesReporte';
import { obtenerNivelRiesgo } from '../../utils/riesgo';
import { MAXIMO_TITULO, validarReporte } from '../../utils/validacionReporte';
import './FormularioReporte.css';

interface Aviso {
  tipo: TipoAviso;
  titulo: string;
  mensaje: string;
}

// El título es una sola línea aunque en pantalla ocupe varias.
const sinSaltosDeLinea = (texto: string) => texto.replace(/\s*\n\s*/g, ' ');

// Un borrador guardado sin conexión se muestra con la misma forma que un reporte enviado.
const borradorComoReporte = (borrador: ReportePendiente): Reporte => ({
  ...borrador,
  estado: 'Pendiente',
  fecha: borrador.guardadoEn.slice(0, 10),
  riesgo: borrador.riesgo ?? 0,
  votos: 0,
});

interface EditarReporteProps {
  // 'nube': reporte ya enviado (/mis-reportes/:id/editar).
  // 'local': borrador guardado sin conexión que aún no se envía (/mis-reportes/en-local/:id, RF-13).
  origen: 'nube' | 'local';
}

// Pantalla para que el autor corrija los datos o las fotos de su reporte.
const EditarReporte: React.FC<EditarReporteProps> = ({ origen }) => {
  const esBorrador = origen === 'local';
  const { id = '' } = useParams<{ id: string }>();
  const router = useIonRouter();
  const [mostrarAlerta] = useIonAlert();
  const enLinea = useConexion();

  const [reporte, setReporte] = useState<Reporte | null>();
  const [titulo, setTitulo] = useState('');
  const [sector, setSector] = useState('');
  const [categoria, setCategoria] = useState('');
  const [volumen, setVolumen] = useState('');
  const [distancia, setDistancia] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ubicacion, setUbicacion] = useState<Ubicacion | null>(null);
  const [enfoque, setEnfoque] = useState<Ubicacion | null>(null);
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [intentoGuardar, setIntentoGuardar] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [eliminado, setEliminado] = useState(false);
  const gps = useUbicacionActual();
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [explicacionAbierta, setExplicacionAbierta] = useState(false);

  // Carga el reporte y deja el formulario con sus datos actuales.
  const cargar = (encontrado: Reporte | null) => {
    setReporte(encontrado);
    if (!encontrado) return;
    setTitulo(encontrado.nombre);
    setSector(encontrado.sector);
    setCategoria(encontrado.categoria);
    setVolumen(encontrado.volumen);
    setDistancia(encontrado.distanciaViviendas);
    setDescripcion(encontrado.descripcion);
    const punto = { latitud: encontrado.latitud, longitud: encontrado.longitud };
    setUbicacion(punto);
    setEnfoque(punto);
    setImagenes(encontrado.imagenes);
    setIntentoGuardar(false);
  };

  useEffect(() => {
    let vigente = true;
    setReporte(undefined);
    if (esBorrador) {
      const borrador = obtenerPendientePorId(id);
      cargar(borrador ? borradorComoReporte(borrador) : null);
    } else {
      obtenerReportePorId(id).then((encontrado) => {
        if (vigente) cargar(encontrado ?? null);
      });
    }
    return () => {
      vigente = false;
    };
  }, [id, esBorrador]);

  // Un borrador vuelve a Mis reportes; un reporte enviado, a su detalle.
  const volverAlDetalle = () =>
    router.push(esBorrador ? RUTAS.misReportes : rutaMiReporte(id), 'back');

  if (reporte === undefined) {
    return (
      <AppLayout>
        <div className="formulario-estado">
          <IonSpinner name="crescent" /> Cargando reporte...
        </div>
      </AppLayout>
    );
  }

  if (reporte === null || (!esBorrador && !puedeModificar(reporte) && !eliminado)) {
    return (
      <AppLayout>
        <div className="formulario-estado">
          <IonIcon icon={lockClosedOutline} aria-hidden="true" className="formulario-estado-icono" />
          <h1>{reporte ? 'No puedes modificar este reporte' : 'No encontramos este reporte'}</h1>
          <p>
            {reporte
              ? 'Solo quien creó el reporte puede modificarlo, y no una vez que el problema está controlado.'
              : 'Puede que haya sido eliminado o que el enlace esté incompleto.'}
          </p>
          <IonButton className="formulario-subir" onClick={() => router.push(RUTAS.misReportes, 'root')}>
            Ir a Mis reportes
          </IonButton>
        </div>
      </AppLayout>
    );
  }

  const desglose = calcularIndice({
    categoria,
    volumen,
    distancia,
    votos: reporte.votos,
    fecha: reporte.fecha,
    clima: reporte.clima,
  });
  const nivel = desglose.indice === null ? null : obtenerNivelRiesgo(desglose.indice);
  const estado = ESTILO_ESTADO[reporte.estado];

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
  const error = (campo: keyof typeof errores) => (intentoGuardar ? errores[campo] : '');

  const cambios: CambiosReporte = {
    nombre: titulo.trim(),
    sector: sector.trim(),
    categoria,
    volumen,
    distanciaViviendas: distancia,
    descripcion: descripcion.trim(),
    latitud: ubicacion?.latitud ?? reporte.latitud,
    longitud: ubicacion?.longitud ?? reporte.longitud,
    imagenes,
  };
  const hayCambios = (Object.keys(cambios) as (keyof CambiosReporte)[]).some(
    (campo) => JSON.stringify(cambios[campo]) !== JSON.stringify(reporte[campo]),
  );

  const guardar = async () => {
    setIntentoGuardar(true);
    if (Object.values(errores).some(Boolean)) {
      setMensaje('Revisa los campos marcados en rojo.');
      return;
    }
    if (!hayCambios) {
      setMensaje('No has hecho cambios en el reporte.');
      return;
    }
    // El borrador está en el teléfono: se guarda al tiro, con o sin conexión.
    if (esBorrador) {
      actualizarPendiente(reporte.id, { ...cambios, riesgo: desglose.indice });
      setAviso({
        tipo: 'exito',
        titulo: '¡Borrador actualizado!',
        mensaje: 'Se enviará con estos cambios cuando tengas conexión.',
      });
      return;
    }
    // Un reporte ya enviado solo se puede modificar con conexión.
    if (!enLinea) {
      setAviso({
        tipo: 'sin-conexion',
        titulo: 'Sin conexión',
        mensaje: 'Necesitas internet para guardar los cambios. Tus cambios siguen en pantalla.',
      });
      return;
    }

    setGuardando(true);
    try {
      await actualizarReporte(reporte.id, cambios);
      setAviso({
        tipo: 'exito',
        titulo: '¡Cambios guardados!',
        mensaje: 'Tu reporte quedó actualizado con los nuevos datos.',
      });
    } catch (causa) {
      const sinEspacio = causa instanceof DOMException && causa.name === 'QuotaExceededError';
      setAviso({
        tipo: 'error',
        titulo: 'No pudimos guardar los cambios',
        mensaje: sinEspacio
          ? 'Las fotos ocupan demasiado espacio en tu dispositivo. Prueba con menos fotos.'
          : 'Ocurrió un problema al guardarlos. Revisa tu conexión e inténtalo de nuevo.',
      });
    }
    setGuardando(false);
  };

  const usarMiUbicacion = () =>
    gps.obtener((punto) => {
      setUbicacion(punto);
      setEnfoque(punto);
    }, setMensaje);

  const eliminar = () =>
    mostrarAlerta({
      header: esBorrador ? 'Eliminar borrador' : 'Eliminar reporte',
      message: esBorrador
        ? 'El borrador se borrará de tu teléfono y no se enviará.'
        : 'El reporte dejará de aparecer en el mapa y no se puede recuperar.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            if (esBorrador) {
              eliminarPendiente(reporte.id);
              setEliminado(true);
              setAviso({
                tipo: 'exito',
                titulo: 'Borrador eliminado',
                mensaje: 'Ya no está en tu lista de envíos pendientes.',
              });
              return;
            }
            if (!enLinea) {
              setMensaje('Necesitas internet para eliminar el reporte.');
              return;
            }
            setGuardando(true);
            await eliminarReporte(reporte.id);
            setGuardando(false);
            setEliminado(true);
            setAviso({
              tipo: 'exito',
              titulo: 'Reporte eliminado',
              mensaje: 'Ya no aparece en el mapa ni en tu lista de reportes.',
            });
          },
        },
      ],
    });

  const descartar = () => {
    if (!hayCambios) {
      volverAlDetalle();
      return;
    }
    mostrarAlerta({
      header: 'Descartar cambios',
      message: 'El reporte quedará como estaba antes de modificarlo.',
      buttons: [
        { text: 'Seguir editando', role: 'cancel' },
        {
          text: 'Descartar',
          role: 'destructive',
          handler: () => {
            cargar(reporte);
            volverAlDetalle();
          },
        },
      ],
    });
  };

  const alAceptarAviso = () => {
    const tipo = aviso?.tipo;
    setAviso(null);
    if (tipo === 'error') guardar();
    if (tipo === 'exito' && (eliminado || esBorrador)) router.push(RUTAS.misReportes, 'root');
    else if (tipo === 'exito') volverAlDetalle();
  };

  return (
    <AppLayout>
      <div className="formulario-reporte editando">
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
            <span className="formulario-riesgo-titulo">Riesgo</span>
            <strong>{desglose.indice === null ? '-- %' : `${desglose.indice} %`}</strong>
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
            {!esBorrador && (
              <dl className="formulario-datos-fijos">
                <div>
                  <dt>Apoyos vecinales</dt>
                  <dd>
                    {reporte.votos} {reporte.votos === 1 ? 'apoyo' : 'apoyos'}
                  </dd>
                </div>
                <div>
                  <dt>Antigüedad</dt>
                  <dd>{antiguedad(reporte.fecha)}</dd>
                </div>
              </dl>
            )}
          </section>

          <section className="formulario-clima" aria-label="Clima al reportar">
            <h2>Clima al reportar</h2>
            {reporte.clima ? (
              <>
                <p className="formulario-clima-condicion">{reporte.clima.condicion}</p>
                <ul>
                  <li>
                    <IonIcon icon={thermometerOutline} aria-hidden="true" /> {reporte.clima.temperatura} °C
                  </li>
                  <li>
                    <IonIcon icon={waterOutline} aria-hidden="true" /> {reporte.clima.humedad} % humedad
                  </li>
                  <li>Viento {reporte.clima.viento} km/h</li>
                </ul>
                {esClimaDeRiesgo(reporte.clima) && (
                  <p className="formulario-clima-alerta">
                    <IonIcon icon={warningOutline} aria-hidden="true" /> Condiciones favorables para
                    incendios
                  </p>
                )}
              </>
            ) : (
              <p className="formulario-sin-datos">Sin información del clima.</p>
            )}
          </section>

          <div className="formulario-acciones formulario-acciones-lateral">
            <IonButton className="formulario-descartar" onClick={descartar} disabled={guardando}>
              Descartar cambios
            </IonButton>
            <IonButton className="formulario-aceptar" onClick={guardar} disabled={guardando}>
              {guardando ? <IonSpinner name="crescent" /> : 'Aceptar cambios'}
            </IonButton>
            {esBorrador || puedeEliminar(reporte) ? (
              <button type="button" className="formulario-eliminar" onClick={eliminar} disabled={guardando}>
                <IonIcon icon={trashOutline} aria-hidden="true" />
                {esBorrador ? 'Eliminar borrador' : 'Eliminar reporte'}
              </button>
            ) : (
              <p className="formulario-nota">
                El reporte ya fue revisado por el municipio, por eso no se puede eliminar.
              </p>
            )}
          </div>
        </aside>

        <div className="formulario-principal">
          <button type="button" className="formulario-volver" onClick={descartar}>
            <span>
              <IonIcon icon={arrowBackOutline} aria-hidden="true" />
            </span>
            {esBorrador ? 'Volver a Mis reportes' : 'Volver al reporte'}
          </button>

          <div className="formulario-titulo">
            <h1>
              <IonIcon icon={pencilOutline} aria-hidden="true" />
              {esBorrador ? 'Modificar borrador sin conexión' : 'Modificar reporte'}
            </h1>
            <IonTextarea
              aria-label="Título del reporte"
              fill="outline"
              autoGrow
              rows={1}
              value={titulo}
              maxlength={MAXIMO_TITULO}
              counter
              className={
                error('titulo')
                  ? 'formulario-titulo-campo campo-invalido ion-invalid ion-touched'
                  : 'formulario-titulo-campo'
              }
              errorText={error('titulo')}
              onIonInput={(e) => setTitulo(sinSaltosDeLinea(e.detail.value ?? ''))}
            />
          </div>

          <div className="formulario-etiquetas">
            <span>ID {reporte.id}</span>
            <span>{formatearFecha(reporte.fecha)}</span>
            <span>{categoria || reporte.categoria}</span>
            {reporte.editadoEn && <span>Modificado {formatearFecha(reporte.editadoEn)}</span>}
            {esBorrador ? (
              <span className="formulario-estado-etiqueta borrador">
                <IonIcon icon={cloudOfflineOutline} aria-hidden="true" />
                Sin enviar
              </span>
            ) : (
              <span
                className="formulario-estado-etiqueta"
                style={{ color: estado.color, borderColor: estado.color }}
              >
                <IonIcon icon={estado.icono} aria-hidden="true" />
                {reporte.estado}
              </span>
            )}
          </div>

          <GaleriaEditable
            imagenes={imagenes}
            error={error('imagenes')}
            onCambiar={setImagenes}
            onErrorCarga={setMensaje}
          />

          <div className="formulario-fila-inferior">
            <div className="formulario-textos">
              <div className="formulario-fila-sector">
                <IonInput
                  label="Sector o dirección"
                  labelPlacement="stacked"
                  fill="outline"
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
              <IonTextarea
                label="Descripción"
                labelPlacement="stacked"
                fill="outline"
                value={descripcion}
                autoGrow
                rows={5}
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
            </div>
            <div className="formulario-mapa">
              <SelectorUbicacion ubicacion={ubicacion} enfocar={enfoque} onCambiar={setUbicacion} />
              <p className="formulario-mapa-ayuda">Toca el mapa o arrastra el pin para corregir la ubicación.</p>
            </div>
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
        onAceptar={alAceptarAviso}
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
    </AppLayout>
  );
};

export default EditarReporte;
