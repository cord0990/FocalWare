import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  IonAccordion,
  IonAccordionGroup,
  IonIcon,
  IonItem,
  IonLabel,
  IonSearchbar,
  useIonRouter,
} from '@ionic/react';
import {
  arrowForwardOutline,
  callOutline,
  chatbubblesOutline,
  documentLockOutline,
  flameOutline,
  folderOpenOutline,
  helpBuoyOutline,
  leafOutline,
  locationOutline,
  mailOutline,
  peopleOutline,
  timeOutline,
} from 'ionicons/icons';
import AppLayout from '../../components/layout/AppLayout';
import { RUTAS } from '../../routes/rutas';
import { normalizarTexto } from '../../utils/texto';
import './Ayuda.css';

const SECCIONES = [
  {
    clave: 'ayuda',
    titulo: 'Ayuda y contacto',
    descripcion: 'Preguntas frecuentes y canales de atención.',
    icono: helpBuoyOutline,
  },
  {
    clave: 'terminos',
    titulo: 'Términos y privacidad',
    descripcion: 'Reglas de uso y cómo cuidamos tus datos.',
    icono: documentLockOutline,
  },
  {
    clave: 'acerca',
    titulo: 'Acerca de FocalWare',
    descripcion: 'Nuestro propósito y el equipo detrás.',
    icono: peopleOutline,
  },
] as const;

type SeccionAyuda = (typeof SECCIONES)[number]['clave'];

const PREGUNTAS = [
  {
    pregunta: '¿Cómo creo un reporte?',
    respuesta:
      'Entra a "Crear reporte" en el menú, marca la ubicación en el mapa, agrega una fotografía y elige la categoría del residuo. Todo el proceso toma menos de un minuto.',
  },
  {
    pregunta: '¿Qué significa el porcentaje de riesgo?',
    respuesta:
      'Es un índice que calcula el sistema según el tipo de residuo, la cercanía a viviendas, los reportes cercanos, la antigüedad y las condiciones del clima. Mientras más alto, antes debería atenderse.',
  },
  {
    pregunta: '¿Para qué sirven los votos?',
    respuesta:
      'Si un reporte ya existe, puedes votar a favor en vez de crear uno nuevo. Cada voto le da más relevancia en la cola de atención municipal.',
  },
  {
    pregunta: '¿Qué pasa si no tengo conexión?',
    respuesta:
      'El reporte se guarda en tu teléfono y queda en "Pendientes de envío". Se envía automáticamente cuando vuelvas a tener internet.',
  },
  {
    pregunta: '¿Otras personas pueden ver quién hizo un reporte?',
    respuesta:
      'No. Los reportes públicos nunca muestran el nombre ni los datos de contacto de quien los creó.',
  },
  {
    pregunta: '¿Cómo sé si mi reporte fue atendido?',
    respuesta:
      'Te enviaremos una notificación cada vez que cambie su estado: aprobado, en atención o controlado. También puedes revisarlo en "Mis reportes".',
  },
];

const TERMINOS = [
  {
    titulo: 'Uso de la plataforma',
    texto:
      'FocalWare es una herramienta ciudadana para informar acumulaciones de residuos con riesgo de incendio. Al usarla te comprometes a entregar información verídica y actual.',
  },
  {
    titulo: 'Contenido de los reportes',
    texto:
      'Las fotografías no deben mostrar rostros, patentes ni datos que identifiquen a otras personas. Los reportes falsos, ofensivos o publicitarios serán rechazados.',
  },
  {
    titulo: 'Datos que recopilamos',
    texto:
      'Solo pedimos lo necesario para identificarte y contactarte: nombre, correo y, de forma opcional, teléfono. La ubicación se usa únicamente para situar el reporte en el mapa.',
  },
  {
    titulo: 'Privacidad y anonimato',
    texto:
      'Tu identidad nunca se muestra en los reportes públicos, conforme a la Ley N° 19.628 sobre protección de la vida privada. Tu contraseña se guarda cifrada y nadie puede verla.',
  },
  {
    titulo: 'Tus derechos',
    texto:
      'Puedes solicitar en cualquier momento el acceso, la corrección o la eliminación de tus datos escribiendo a nuestro correo de soporte.',
  },
];

// Correo de soporte que aparece en la sección de contacto.
const CORREO_SOPORTE = 'contacto@focalware.cl';

// Cada integrante tiene su propio color para distinguirlos aunque las iniciales se parezcan.
const EQUIPO = [
  {
    nombre: 'Diego Cordova',
    iniciales: 'DCo',
    rol: 'Desarrollo web · Diseño UI/UX',
    color: 'linear-gradient(135deg, #e8283f, #f7924f)',
  },
  {
    nombre: 'Macarena Catalan',
    iniciales: 'MC',
    rol: 'Diseño UI/UX · Documentación',
    color: 'linear-gradient(135deg, #7a0b16, #e0283a)',
  },
  {
    nombre: 'Agustín Guzmán',
    iniciales: 'AG',
    rol: 'Desarrollo web · Diseño UI/UX',
    color: 'linear-gradient(135deg, #f36f4f, #fcba62)',
  },
  {
    nombre: 'Daniel Castro',
    iniciales: 'DCa',
    rol: 'Diseño UI/UX · Documentación',
    color: 'linear-gradient(135deg, #463e3e, #8b6b6b)',
  },
];

const TECNOLOGIAS = ['Ionic', 'React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Leaflet'];


const irASeccion = (clave: SeccionAyuda) =>
  document.getElementById(`seccion-${clave}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

// Una sola página con tres secciones. El menú de la cuenta abre /ayuda?seccion=...
// y la página se desplaza a esa sección.
const Ayuda: React.FC = () => {
  const { search } = useLocation();
  const router = useIonRouter();
  const seccion = new URLSearchParams(search).get('seccion') as SeccionAyuda | null;
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    if (!seccion) return;
    // Espera a que termine la animación de entrada de la página antes de desplazarse.
    const espera = setTimeout(() => irASeccion(seccion), 350);
    return () => clearTimeout(espera);
  }, [seccion]);

  const termino = normalizarTexto(busqueda.trim());
  const preguntasFiltradas = PREGUNTAS.filter((item) =>
    normalizarTexto(`${item.pregunta} ${item.respuesta}`).includes(termino),
  );

  const claseSeccion = (clave: SeccionAyuda) =>
    seccion === clave ? 'ayuda-seccion destacada' : 'ayuda-seccion';

  return (
    <AppLayout>
      <div className="ayuda">
        <header className="ayuda-portada">
          <span className="ayuda-etiqueta">Centro de ayuda</span>
          <h1>¿Cómo podemos ayudarte?</h1>
          <p>Encuentra respuestas rápidas, revisa nuestras políticas o conoce al equipo detrás de FocalWare.</p>
          <IonSearchbar
            className="ayuda-buscador"
            placeholder="Busca una pregunta, por ejemplo: votos"
            value={busqueda}
            debounce={200}
            onIonInput={(e) => {
              setBusqueda(e.detail.value ?? '');
              if (e.detail.value) irASeccion('ayuda');
            }}
          />
        </header>

        <nav className="ayuda-atajos" aria-label="Secciones de ayuda">
          {SECCIONES.map((item) => (
            <button
              key={item.clave}
              type="button"
              className={seccion === item.clave ? 'ayuda-atajo activo' : 'ayuda-atajo'}
              onClick={() => irASeccion(item.clave)}
            >
              <span className="ayuda-atajo-icono">
                <IonIcon icon={item.icono} aria-hidden="true" />
              </span>
              <span className="ayuda-atajo-texto">
                <strong>{item.titulo}</strong>
                <small>{item.descripcion}</small>
              </span>
              <IonIcon icon={arrowForwardOutline} className="ayuda-atajo-flecha" aria-hidden="true" />
            </button>
          ))}
        </nav>

        <section id="seccion-ayuda" className={claseSeccion('ayuda')}>
          <div className="ayuda-titulo">
            <span className="ayuda-etiqueta">Soporte</span>
            <h2>Preguntas frecuentes</h2>
          </div>

          {preguntasFiltradas.length > 0 ? (
            <IonAccordionGroup className="ayuda-preguntas">
              {preguntasFiltradas.map((item) => (
                <IonAccordion key={item.pregunta} value={item.pregunta}>
                  <IonItem slot="header" lines="none">
                    <IonLabel className="ion-text-wrap">{item.pregunta}</IonLabel>
                  </IonItem>
                  <p slot="content">{item.respuesta}</p>
                </IonAccordion>
              ))}
            </IonAccordionGroup>
          ) : (
            <p className="ayuda-sin-resultados">
              No encontramos preguntas sobre “{busqueda}”. Escríbenos y te ayudaremos.
            </p>
          )}

          <h3 className="ayuda-subtitulo">¿No encontraste lo que buscabas?</h3>
          <div className="ayuda-contacto">
            <article className="ayuda-tarjeta">
              <span className="ayuda-tarjeta-icono">
                <IonIcon icon={mailOutline} aria-hidden="true" />
              </span>
              <h4>Escríbenos</h4>
              <p>Resolvemos dudas sobre tu cuenta y el uso de la aplicación.</p>
              <p className="ayuda-tarjeta-dato">
                <IonIcon icon={timeOutline} aria-hidden="true" /> Respuesta en 48 horas hábiles
              </p>
              <a className="ayuda-boton" href={`mailto:${CORREO_SOPORTE}`}>
                {CORREO_SOPORTE}
              </a>
            </article>

            <article className="ayuda-tarjeta">
              <span className="ayuda-tarjeta-icono">
                <IonIcon icon={folderOpenOutline} aria-hidden="true" />
              </span>
              <h4>Seguimiento de reportes</h4>
              <p>Revisa el estado y el historial de cada reporte que has enviado.</p>
              <p className="ayuda-tarjeta-dato">
                <IonIcon icon={chatbubblesOutline} aria-hidden="true" /> Notificaciones en cada cambio
              </p>
              <button
                type="button"
                className="ayuda-boton"
                onClick={() => router.push(RUTAS.misReportes, 'root')}
              >
                Ir a Mis reportes
              </button>
            </article>
          </div>

          <aside className="ayuda-emergencia">
            <span className="ayuda-emergencia-icono">
              <IonIcon icon={flameOutline} aria-hidden="true" />
            </span>
            <div className="ayuda-emergencia-texto">
              <strong>¿Hay un incendio en curso?</strong>
              <p>FocalWare no reemplaza a los servicios de emergencia. Llama de inmediato:</p>
            </div>
            <div className="ayuda-emergencia-numeros">
              <a href="tel:132">
                <IonIcon icon={callOutline} aria-hidden="true" /> Bomberos 132
              </a>
              <a href="tel:130">
                <IonIcon icon={callOutline} aria-hidden="true" /> CONAF 130
              </a>
            </div>
          </aside>
        </section>

        <section id="seccion-terminos" className={claseSeccion('terminos')}>
          <div className="ayuda-titulo">
            <span className="ayuda-etiqueta">Legal</span>
            <h2>Términos y privacidad</h2>
            <p className="ayuda-actualizacion">Última actualización: 26 de septiembre de 2026</p>
          </div>

          <ol className="ayuda-terminos">
            {TERMINOS.map((item) => (
              <li key={item.titulo}>
                <h3>{item.titulo}</h3>
                <p>{item.texto}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="seccion-acerca" className={claseSeccion('acerca')}>
          <div className="ayuda-acerca">
            <div>
              <div className="ayuda-titulo">
                <span className="ayuda-etiqueta">Nosotros</span>
                <h2>Acerca de FocalWare</h2>
              </div>
              <p>
                Las quebradas de Valparaíso son corredores por donde el fuego sube con rapidez y, al mismo
                tiempo, lugares donde se acumula basura. FocalWare permite a los vecinos reportar estos
                puntos y ayuda al municipio a atender primero los más peligrosos, según su riesgo de
                incendio y no por orden de llegada.
              </p>
            </div>
            <div className="ayuda-acerca-logo">
              <img src="/logo-focalware.webp" alt="Logo de FocalWare" />
              <strong>FocalWare</strong>
              <span>Versión 0.1</span>
            </div>
          </div>

          <div className="ayuda-cifras">
            <div>
              <IonIcon icon={flameOutline} aria-hidden="true" />
              <strong>7.000</strong>
              <span>personas evacuadas en el incendio de 2015, originado en un vertedero ilegal</span>
            </div>
            <div>
              <IonIcon icon={locationOutline} aria-hidden="true" />
              <strong>Cerros</strong>
              <span>de Valparaíso como foco principal de los reportes ciudadanos</span>
            </div>
            <div>
              <IonIcon icon={leafOutline} aria-hidden="true" />
              <strong>#11 y #30</strong>
              <span>desafíos CTD Litoral: manejo de residuos y gestión de riesgos</span>
            </div>
          </div>

          <h3 className="ayuda-subtitulo">Nuestro equipo</h3>
          <ul className="ayuda-equipo">
            {EQUIPO.map((integrante) => (
              <li key={integrante.nombre}>
                <span
                  className="ayuda-equipo-avatar"
                  style={{ '--color-avatar': integrante.color } as React.CSSProperties}
                  aria-hidden="true"
                >
                  {integrante.iniciales}
                </span>
                <strong>{integrante.nombre}</strong>
                <span>{integrante.rol}</span>
              </li>
            ))}
          </ul>

          <h3 className="ayuda-subtitulo">Tecnologías</h3>
          <ul className="ayuda-tecnologias">
            {TECNOLOGIAS.map((tecnologia) => (
              <li key={tecnologia}>{tecnologia}</li>
            ))}
          </ul>

          <p className="ayuda-pie">Hecho en Valparaíso · Proyecto de Ingeniería Web y Móvil</p>
        </section>
      </div>
    </AppLayout>
  );
};

export default Ayuda;
