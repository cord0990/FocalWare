import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IonButton, IonIcon, IonSpinner, IonToast, useIonRouter } from '@ionic/react';
import {
  arrowBackOutline,
  createOutline,
  folderOpenOutline,
  helpCircleOutline,
  imagesOutline,
  mapOutline,
  thermometerOutline,
  waterOutline,
  warningOutline,
} from 'ionicons/icons';
import AppLayout from '../../components/layout/AppLayout';
import AvisoGestion from '../../components/municipal/AvisoGestion';
import ModalGestion from '../../components/municipal/ModalGestion';
import OpcionesFuncionario, { type AccionFuncionario } from '../../components/municipal/OpcionesFuncionario';
import CamposDesglose from '../../components/reportes/CamposDesglose';
import SeguimientoReporte from '../../components/reportes/SeguimientoReporte';
import ExplicacionRiesgo from '../../components/reportes/ExplicacionRiesgo';
import MiniMapa from '../../components/reportes/MiniMapa';
import TarjetaReporte from '../../components/reportes/TarjetaReporte';
import { useAnchoRedimensionable } from '../../hooks/useAnchoRedimensionable';
import { useSesion } from '../../hooks/useSesion';
import { RUTAS, rutaDetalleMapa, rutaEditarReporte, rutaMunicipalReporte } from '../../routes/rutas';
import { esClimaDeRiesgo } from '../../services/climaService';
import {
  corregirDesglose,
  EVENTO_REPORTES,
  obtenerReportePorId,
  obtenerReportes,
  puedeModificar,
  type Reporte,
} from '../../services/reportesService';
import { ESTILO_ESTADO } from '../../utils/estados';
import { antiguedad, formatearFecha } from '../../utils/fechas';
import { calcularIndice } from '../../utils/opcionesReporte';
import { obtenerNivelRiesgo } from '../../utils/riesgo';
import './DetalleReporte.css';

interface DetalleReporteProps {
  // Desde el mapa (público, /mapa/:id), desde Mis reportes (/mis-reportes/:id) o la vista de
  // gestión del Funcionario (/municipal/reporte/:id), que suma sus opciones.
  origen: 'mapa' | 'mis-reportes' | 'municipal';
}

const DetalleReporte: React.FC<DetalleReporteProps> = ({ origen }) => {
  const { id = '' } = useParams<{ id: string }>();
  const router = useIonRouter();
  const { usuario } = useSesion();
  const esGestion = origen === 'municipal';
  const rutaListado = origen === 'mis-reportes' ? RUTAS.misReportes : RUTAS.mapa;
  const rutaDeOtro = esGestion ? rutaMunicipalReporte : rutaDetalleMapa;
  const [accion, setAccion] = useState<AccionFuncionario | null>(null);
  // Acción recién guardada, para mostrar su aviso de confirmación.
  const [resultado, setResultado] = useState<AccionFuncionario | null>(null);
  const [modificando, setModificando] = useState(false);
  const [edicion, setEdicion] = useState({ categoria: '', volumen: '', distancia: '' });
  const [guardandoDesglose, setGuardandoDesglose] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [reporte, setReporte] = useState<Reporte | null>();
  const [otros, setOtros] = useState<Reporte[]>([]);
  const [fotoActiva, setFotoActiva] = useState(0);
  const [explicacionAbierta, setExplicacionAbierta] = useState(false);
  const divisor = useAnchoRedimensionable({
    clave: 'focalware-ancho-otros',
    minimo: 300,
    maximoProporcion: 0.5,
  });
  // La columna izquierda (riesgo, desglose y opciones) también se puede ensanchar.
  const divisorLateral = useAnchoRedimensionable({
    clave: 'focalware-ancho-lateral-detalle',
    minimo: 260,
    maximoProporcion: 0.4,
    lado: 'izquierda',
  });

  useEffect(() => {
    let vigente = true;
    const cargar = () =>
      Promise.all([obtenerReportePorId(id), obtenerReportes()]).then(([encontrado, todos]) => {
        if (!vigente) return;
        setReporte(encontrado ?? null);
        setOtros(todos.filter((otro) => otro.id !== id).sort((a, b) => b.riesgo - a.riesgo));
      });
    const recargar = () => {
      setFotoActiva(0);
      cargar();
    };
    setReporte(undefined);
    setFotoActiva(0);
    cargar();
    // Si el autor modifica el reporte, se vuelve a cargar con los datos nuevos.
    window.addEventListener(EVENTO_REPORTES, recargar);
    // Evita mostrar datos de un reporte anterior si el usuario cambia rápido de reporte.
    return () => {
      vigente = false;
      window.removeEventListener(EVENTO_REPORTES, recargar);
    };
  }, [id]);

  const volver = () => (router.canGoBack() ? router.goBack() : router.push(rutaListado, 'back'));

  if (reporte === undefined) {
    return (
      <AppLayout>
        <div className="detalle-cargando">
          <IonSpinner name="crescent" /> Cargando reporte...
        </div>
      </AppLayout>
    );
  }

  if (reporte === null) {
    return (
      <AppLayout>
        <div className="detalle-no-encontrado">
          <h1>No encontramos este reporte</h1>
          <p>Puede que haya sido eliminado o que el enlace esté incompleto.</p>
          <button type="button" className="detalle-volver" onClick={() => router.push(RUTAS.mapa, 'root')}>
            <span>
              <IonIcon icon={arrowBackOutline} aria-hidden="true" />
            </span>
            Ir al mapa
          </button>
        </div>
      </AppLayout>
    );
  }

  // Mientras el funcionario modifica el desglose, el riesgo se muestra con los valores nuevos.
  const valores = modificando
    ? edicion
    : { categoria: reporte.categoria, volumen: reporte.volumen, distancia: reporte.distanciaViviendas };
  const desgloseIndice = calcularIndice({
    categoria: valores.categoria,
    volumen: valores.volumen,
    distancia: valores.distancia,
    votos: reporte.votos,
    fecha: reporte.fecha,
    clima: reporte.clima,
  });
  const riesgo = desgloseIndice.indice ?? reporte.riesgo;
  const nivel = obtenerNivelRiesgo(riesgo);
  const estado = ESTILO_ESTADO[reporte.estado];

  const empezarAModificar = () => {
    setEdicion({
      categoria: reporte.categoria,
      volumen: reporte.volumen,
      distancia: reporte.distanciaViviendas,
    });
    setModificando(true);
  };

  const guardarDesglose = async () => {
    setGuardandoDesglose(true);
    await corregirDesglose(reporte.id, {
      categoria: edicion.categoria,
      volumen: edicion.volumen,
      distanciaViviendas: edicion.distancia,
    });
    setGuardandoDesglose(false);
    setModificando(false);
    setMensaje('Desglose actualizado. El riesgo se recalculó con los nuevos datos.');
  };
  const fotos = reporte.imagenes;

  const desglose = [
    { etiqueta: 'Categoría', valor: reporte.categoria },
    { etiqueta: 'Volumen estimado', valor: reporte.volumen || 'Sin información' },
    { etiqueta: 'Distancia de viviendas', valor: reporte.distanciaViviendas || 'Sin información' },
    { etiqueta: 'Apoyos vecinales', valor: `${reporte.votos} ${reporte.votos === 1 ? 'apoyo' : 'apoyos'}` },
    { etiqueta: 'Antigüedad', valor: antiguedad(reporte.fecha) },
  ];

  return (
    <AppLayout>
      <div
        ref={(elemento) => {
          // Los dos divisores miden sobre la misma grilla.
          divisor.contenedor.current = elemento;
          divisorLateral.contenedor.current = elemento;
        }}
        className={
          divisor.arrastrando || divisorLateral.arrastrando ? 'detalle-reporte arrastrando' : 'detalle-reporte'
        }
        style={
          {
            ...(divisor.ancho ? { '--ancho-otros': `${divisor.ancho}px` } : {}),
            ...(divisorLateral.ancho ? { '--ancho-lateral': `${divisorLateral.ancho}px` } : {}),
          } as React.CSSProperties
        }
      >
        <aside ref={divisorLateral.panel} className="detalle-lateral">
          <div
            className="detalle-riesgo"
            style={reporte.riesgoEnCalculo ? undefined : { background: nivel.color, color: nivel.texto }}
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
            <span className="detalle-riesgo-titulo">Riesgo</span>
            <strong>{reporte.riesgoEnCalculo ? 'En cálculo' : `${riesgo} %`}</strong>
            <span className="detalle-riesgo-tipo">
              {reporte.riesgoEnCalculo ? 'Pendiente de revisión' : `Riesgo ${nivel.etiqueta.toLowerCase()}`}
            </span>
          </div>

          {esGestion && (
            <OpcionesFuncionario
              reporte={reporte}
              modificando={modificando}
              onAccion={setAccion}
              onModificar={() => (modificando ? setModificando(false) : empezarAModificar())}
            />
          )}

          <section className="detalle-desglose" aria-label="Desglose">
            <h2>Desglose</h2>
            {modificando && (
              <div className="detalle-desglose-edicion">
                <CamposDesglose
                  categoria={edicion.categoria}
                  volumen={edicion.volumen}
                  distancia={edicion.distancia}
                  errores={{ categoria: '', volumen: '', distancia: '' }}
                  onCategoria={(categoria) => setEdicion({ ...edicion, categoria })}
                  onVolumen={(volumen) => setEdicion({ ...edicion, volumen })}
                  onDistancia={(distancia) => setEdicion({ ...edicion, distancia })}
                />
              </div>
            )}
            <dl hidden={modificando}>
              {desglose.map((dato) => (
                <div key={dato.etiqueta}>
                  <dt>{dato.etiqueta}</dt>
                  <dd>{dato.valor}</dd>
                </div>
              ))}
            </dl>
          </section>

          {modificando && (
            <div className="detalle-gestion-botones">
              <IonButton
                className="detalle-descartar"
                onClick={() => setModificando(false)}
                disabled={guardandoDesglose}
              >
                Descartar cambios
              </IonButton>
              <IonButton className="detalle-aceptar" onClick={guardarDesglose} disabled={guardandoDesglose}>
                {guardandoDesglose ? <IonSpinner name="crescent" /> : 'Aceptar cambios'}
              </IonButton>
            </div>
          )}

          <section className="detalle-clima" aria-label="Clima al reportar">
            <h2>Clima al reportar</h2>
            {reporte.clima ? (
              <>
                <p className="detalle-clima-condicion">{reporte.clima.condicion}</p>
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
                  <p className="detalle-clima-alerta">
                    <IonIcon icon={warningOutline} aria-hidden="true" /> Condiciones favorables para
                    incendios
                  </p>
                )}
              </>
            ) : (
              <p className="detalle-sin-datos">Sin información del clima.</p>
            )}
          </section>
        </aside>

        {/* Solo se muestra en PC: se arrastra para cambiar el ancho de la columna izquierda */}
        <div
          className="detalle-divisor lateral"
          role="separator"
          aria-orientation="vertical"
          aria-label="Cambiar el ancho de la columna de riesgo y desglose"
          tabIndex={0}
          title="Arrastra para cambiar el ancho. Doble clic para restablecer."
          onPointerDown={divisorLateral.alPresionar}
          onKeyDown={divisorLateral.alTeclado}
          onDoubleClick={divisorLateral.restablecer}
        >
          <span aria-hidden="true" />
        </div>

        <div className="detalle-principal">
          <div className="detalle-barra">
            <button type="button" className="detalle-volver" onClick={volver}>
              <span>
                <IonIcon icon={arrowBackOutline} aria-hidden="true" />
              </span>
              <IonIcon
                icon={origen === 'mis-reportes' ? folderOpenOutline : mapOutline}
                aria-hidden="true"
                className="detalle-volver-mapa"
              />
              {origen === 'mis-reportes' ? 'Volver a Mis reportes' : 'Volver al mapa'}
            </button>
            {usuario?.rol === 'vecino' && puedeModificar(reporte) && (
              <button
                type="button"
                className="detalle-modificar"
                onClick={() => router.push(rutaEditarReporte(reporte.id), 'forward')}
              >
                <IonIcon icon={createOutline} aria-hidden="true" />
                Modificar reporte
              </button>
            )}
          </div>

          <h1 className="detalle-titulo">{reporte.nombre}</h1>

          <div className="detalle-etiquetas">
            <span>ID {reporte.id}</span>
            <span>{formatearFecha(reporte.fecha)}</span>
            <span>{reporte.categoria}</span>
            {reporte.editadoEn && <span>Modificado {formatearFecha(reporte.editadoEn)}</span>}
            <span className="detalle-estado" style={{ color: estado.color, borderColor: estado.color }}>
              <IonIcon icon={estado.icono} aria-hidden="true" />
              {reporte.estado}
            </span>
          </div>

          <SeguimientoReporte gestion={reporte.gestion} />

          <div className={fotos.length > 1 ? 'detalle-galeria con-miniaturas' : 'detalle-galeria'}>
            <div className="detalle-foto-principal">
              {fotos.length > 0 ? (
                <img src={fotos[fotoActiva]} alt={`${reporte.nombre}, fotografía ${fotoActiva + 1}`} />
              ) : (
                <div className="detalle-sin-fotos">
                  <IonIcon icon={imagesOutline} aria-hidden="true" />
                  Sin fotografías
                </div>
              )}
            </div>
            {fotos.length > 1 && (
              <div className="detalle-miniaturas" aria-label="Otras fotografías">
                {fotos.map((foto, indice) => (
                  <button
                    key={indice}
                    type="button"
                    className={indice === fotoActiva ? 'activa' : ''}
                    onClick={() => setFotoActiva(indice)}
                    aria-label={indice === 0 ? 'Ver portada' : `Ver foto complementaria ${indice}`}
                    aria-pressed={indice === fotoActiva}
                  >
                    <img src={foto} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="detalle-inferior">
            <section className="detalle-descripcion" aria-label="Descripción">
              <h2>Descripción</h2>
              <p>{reporte.descripcion || 'El vecino no agregó una descripción.'}</p>
              <p className="detalle-sector">Sector: {reporte.sector}</p>
            </section>
            <MiniMapa latitud={reporte.latitud} longitud={reporte.longitud} nivel={nivel} />
          </div>
        </div>

        {/* Solo se muestra en PC: se arrastra para cambiar el ancho de otros reportes */}
        <div
          className="detalle-divisor"
          role="separator"
          aria-orientation="vertical"
          aria-label="Cambiar el ancho de otros reportes"
          tabIndex={0}
          title="Arrastra para cambiar el ancho. Doble clic para restablecer."
          onPointerDown={divisor.alPresionar}
          onKeyDown={divisor.alTeclado}
          onDoubleClick={divisor.restablecer}
        >
          <span aria-hidden="true" />
        </div>

        <section ref={divisor.panel} className="detalle-otros" aria-label="Otros reportes">
          <h2>Otros reportes</h2>
          <div className="detalle-otros-lista">
            {otros.map((otro) => (
              <div key={otro.id} className="detalle-otros-celda">
                <TarjetaReporte
                  reporte={otro}
                  puedeVotar={false}
                  onDetalles={() => router.push(rutaDeOtro(otro.id), 'forward')}
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      <ExplicacionRiesgo
        abierto={explicacionAbierta}
        desglose={desgloseIndice}
        onCerrar={() => setExplicacionAbierta(false)}
      />

      {esGestion && usuario && (
        <ModalGestion
          accion={accion}
          reporte={reporte}
          funcionario={usuario.nombre}
          onCerrar={() => setAccion(null)}
          onHecho={() => {
            setResultado(accion);
            setAccion(null);
          }}
        />
      )}

      {esGestion && (
        <AvisoGestion
          resultado={resultado}
          reporte={reporte}
          onVolverAlMapa={() => {
            setResultado(null);
            router.push(RUTAS.mapa, 'back');
          }}
          onCerrar={() => setResultado(null)}
        />
      )}

      <IonToast
        isOpen={!!mensaje}
        message={mensaje}
        duration={3000}
        color="success"
        position="top"
        onDidDismiss={() => setMensaje('')}
      />
    </AppLayout>
  );
};

export default DetalleReporte;
