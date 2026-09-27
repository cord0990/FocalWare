import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IonIcon, IonSpinner, useIonRouter } from '@ionic/react';
import {
  arrowBackOutline,
  createOutline,
  helpCircleOutline,
  imagesOutline,
  mapOutline,
  thermometerOutline,
  waterOutline,
  warningOutline,
} from 'ionicons/icons';
import AppLayout from '../../components/layout/AppLayout';
import ExplicacionRiesgo from '../../components/reportes/ExplicacionRiesgo';
import MiniMapa from '../../components/reportes/MiniMapa';
import TarjetaReporte from '../../components/reportes/TarjetaReporte';
import { useAnchoRedimensionable } from '../../hooks/useAnchoRedimensionable';
import { RUTAS, rutaEditarReporte, rutaReporte } from '../../routes/rutas';
import { esClimaDeRiesgo } from '../../services/climaService';
import {
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

const DetalleReporte: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const router = useIonRouter();
  const [reporte, setReporte] = useState<Reporte | null>();
  const [otros, setOtros] = useState<Reporte[]>([]);
  const [fotoActiva, setFotoActiva] = useState(0);
  const [explicacionAbierta, setExplicacionAbierta] = useState(false);
  const divisor = useAnchoRedimensionable({
    clave: 'focalware-ancho-otros',
    minimo: 300,
    maximoProporcion: 0.5,
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

  const volver = () => (router.canGoBack() ? router.goBack() : router.push(RUTAS.inicio, 'back'));

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
          <button type="button" className="detalle-volver" onClick={() => router.push(RUTAS.inicio, 'root')}>
            <span>
              <IonIcon icon={arrowBackOutline} aria-hidden="true" />
            </span>
            Ir al mapa
          </button>
        </div>
      </AppLayout>
    );
  }

  const nivel = obtenerNivelRiesgo(reporte.riesgo);
  const desgloseIndice = calcularIndice({
    categoria: reporte.categoria,
    volumen: reporte.volumen,
    distancia: reporte.distanciaViviendas,
    votos: reporte.votos,
    fecha: reporte.fecha,
    clima: reporte.clima,
  });
  const estado = ESTILO_ESTADO[reporte.estado];
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
        ref={divisor.contenedor}
        className={divisor.arrastrando ? 'detalle-reporte arrastrando' : 'detalle-reporte'}
        style={divisor.ancho ? ({ '--ancho-otros': `${divisor.ancho}px` } as React.CSSProperties) : undefined}
      >
        <aside className="detalle-lateral">
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
            <strong>{reporte.riesgoEnCalculo ? 'En cálculo' : `${reporte.riesgo} %`}</strong>
            <span className="detalle-riesgo-tipo">
              {reporte.riesgoEnCalculo ? 'Pendiente de revisión' : `Riesgo ${nivel.etiqueta.toLowerCase()}`}
            </span>
          </div>

          <section className="detalle-desglose" aria-label="Desglose">
            <h2>Desglose</h2>
            <dl>
              {desglose.map((dato) => (
                <div key={dato.etiqueta}>
                  <dt>{dato.etiqueta}</dt>
                  <dd>{dato.valor}</dd>
                </div>
              ))}
            </dl>
          </section>

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

        <div className="detalle-principal">
          <div className="detalle-barra">
            <button type="button" className="detalle-volver" onClick={volver}>
              <span>
                <IonIcon icon={arrowBackOutline} aria-hidden="true" />
              </span>
              <IonIcon icon={mapOutline} aria-hidden="true" className="detalle-volver-mapa" />
              Volver
            </button>
            {puedeModificar(reporte) && (
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
                  onDetalles={() => router.push(rutaReporte(otro.id), 'forward')}
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
    </AppLayout>
  );
};

export default DetalleReporte;
