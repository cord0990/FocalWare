// Reportes de FocalWare contra la API REST del backend.
import { pedir, ErrorApi, urlDeImagen } from './api';
import type { Clima } from './climaService';
import { MAXIMO_FOTOS } from '../utils/validacionReporte';

export const ESTADOS_REPORTE = ['Pendiente', 'Aprobado', 'En atención', 'Controlado', 'Rechazado'] as const;

export type EstadoReporte = (typeof ESTADOS_REPORTE)[number];

// Decisiones del Funcionario sobre un reporte (RF-12, RF-16, RF-17, RF-18).
export interface GestionReporte {
  aprobacion?: {
    cuadrilla: string;
    fechaAtencion: string;
    detalle: string;
    funcionario: string;
    fecha: string;
  };
  rechazo?: { motivo: string; funcionario: string; fecha: string };
  // Reporte de control: evidencia de que el problema se resolvió.
  control?: { detalle: string; imagenes: string[]; funcionario: string; fecha: string };
}

export interface Reporte {
  id: string;
  nombre: string;
  sector: string;
  categoria: string;
  estado: EstadoReporte;
  // Id de la revisión que lleva este reporte. Solo llega si el reporte es del
  // vecino que lo creó o si quien lo pide es un funcionario; en las respuestas
  // públicas viene undefined. Es null (no ausente) cuando sí se lo manda y el
  // reporte todavía no fue revisado.
  // Lo usa la gestión municipal para registrar el control con
  // PUT /api/revisiones/:id.
  idRevision?: string | null;
  fecha: string;
  riesgo: number;
  votos: number;
  latitud: number;
  longitud: number;
  descripcion: string;
  volumen: string;
  distanciaViviendas: string;
  // Rutas de las fotos en el servidor, no data URL.
  imagenes: string[];
  clima?: Clima;
  // true cuando el reporte todavía no tiene índice de riesgo calculado.
  // el backend lo manda como null y acá se traduce a un booleano, que es como lo
  // venía usando la app antes de conectarse a la API.
  riesgoEnCalculo?: boolean;
  // Solo lo reciben el dueño del reporte y los funcionarios.
  nombreVecino?: string;
  emailVecino?: string;
  // true si el vecino conectado ya apoyan este reporte. Sin sesión viene false.
  miVoto?: boolean;
  // true si el reporte es del vecino conectado. Sirve para no ofrecer el botón de
  // apoyar en el reporte propio. Sin sesión viene false.
  esMio?: boolean;
  gestion?: GestionReporte;
  editadoEn?: string;
}

// Datos que el autor puede modificar de su reporte.
export type CambiosReporte = Pick<
  Reporte,
  | 'nombre'
  | 'sector'
  | 'categoria'
  | 'volumen'
  | 'distanciaViviendas'
  | 'descripcion'
  | 'latitud'
  | 'longitud'
  | 'imagenes'
>;

export interface DatosNuevoReporte {
  nombre: string;
  sector: string;
  categoria: string;
  volumen: string;
  distanciaViviendas: string;
  descripcion: string;
  latitud: number;
  longitud: number;
  imagenes: string[];
  riesgo: number | null;
  clima?: Clima;
}

// Aviso para que las pantallas abiertas vuelvan a cargar los reportes cuando cambian.
export const EVENTO_REPORTES = 'focalware-reportes-cambiaron';
const avisarCambio = () => window.dispatchEvent(new Event(EVENTO_REPORTES));

// Las fotos llegan al frontend como data URL (para poder verlas sin servidor),
// pero el backend las quiere como archivos. Esta función hace la conversión.
const dataUrlABlob = async (dataUrl: string): Promise<Blob> => {
  const respuesta = await fetch(dataUrl);
  return respuesta.blob();
};

const aFormulario = async (datos: DatosNuevoReporte): Promise<FormData> => {
  const formulario = new FormData();

  formulario.append('nombre', datos.nombre);
  formulario.append('sector', datos.sector);
  formulario.append('categoria', datos.categoria);
  formulario.append('volumen', datos.volumen);
  formulario.append('descripcion', datos.descripcion);
  formulario.append('latitud', String(datos.latitud));
  formulario.append('longitud', String(datos.longitud));

  if (datos.distanciaViviendas) formulario.append('distanciaViviendas', datos.distanciaViviendas);
  if (datos.riesgo !== null && datos.riesgo !== undefined) {
    formulario.append('riesgo', String(datos.riesgo));
  }

  // El clima no se manda: el backend lo consulta en Open-Meteo al guardar el reporte.
  const fotos = datos.imagenes.filter((foto) => typeof foto === 'string' && foto.startsWith('data:'));
  for (const [indice, foto] of fotos.slice(0, MAXIMO_FOTOS).entries()) {
    const blob = await dataUrlABlob(foto);
    formulario.append('fotos', blob, `foto-${indice + 1}.jpg`);
  }

  return formulario;
};

// cambios es parcial a propósito: el Funcionario que corrige el desglose solo
// manda categoría, volumen y distancia, y el resto debe quedar como estaba.
const aFormularioDeEdicion = async (
  cambios: Partial<CambiosReporte>,
  imagenes: string[],
): Promise<FormData> => {
  const formulario = new FormData();

  // Filtra los campos que no vienen o vienen vacíos, para no mandarlos.
const soloTexto = (valor: string | undefined): valor is string => valor !== undefined && valor !== '';

  if (soloTexto(cambios.nombre)) formulario.append('nombre', cambios.nombre);
  if (soloTexto(cambios.descripcion)) formulario.append('descripcion', cambios.descripcion);
  if (soloTexto(cambios.categoria)) formulario.append('categoria', cambios.categoria);
  if (soloTexto(cambios.volumen)) formulario.append('volumen', cambios.volumen);
  if (soloTexto(cambios.sector)) formulario.append('sector', cambios.sector);
  if (soloTexto(cambios.distanciaViviendas)) {
    formulario.append('distanciaViviendas', cambios.distanciaViviendas);
  }
  if (cambios.latitud !== undefined) formulario.append('latitud', String(cambios.latitud));
  if (cambios.longitud !== undefined) formulario.append('longitud', String(cambios.longitud));

  const sonNuevas = imagenes.filter((foto) => foto.startsWith('data:'));
  const yaEstaban = imagenes.filter((foto) => !foto.startsWith('data:'));

  // El orden importa. La primera foto es la portada.
  formulario.append('imagenesActuales', JSON.stringify(yaEstaban));

  for (const [indice, foto] of sonNuevas.slice(0, MAXIMO_FOTOS).entries()) {
    const blob = await dataUrlABlob(foto);
    formulario.append('fotos', blob, `foto-nueva-${indice + 1}.jpg`);
  }

  return formulario;
};

// Todos los reportes: los creados por el usuario más los de prueba.
type ReporteApi = Omit<Reporte, 'riesgo' | 'riesgoEnCalculo'> & { riesgo: number | null };

const aReporte = (dato: ReporteApi): Reporte => {
  const { riesgo, gestion, imagenes, ...resto } = dato;

  // La API puede mandar una aprobación sin cuadrilla o sin funcionario (por
  // ejemplo, una revisión rechazada). Las pantallas usan esos campos como
  // texto, así que se completan con cadena vacía en vez de undefined.
  let gestionCompleta: GestionReporte | undefined = gestion?.aprobacion
    ? {
      ...gestion,
      aprobacion: {
        cuadrilla: gestion.aprobacion.cuadrilla ?? '',
        fechaAtencion: gestion.aprobacion.fechaAtencion ?? '',
        detalle: gestion.aprobacion.detalle ?? '',
        funcionario: gestion.aprobacion.funcionario ?? '',
        fecha: gestion.aprobacion.fecha ?? '',
      },
    }
    : gestion;

  // El control llega con las rutas de las fotos de evidencia ("controles/x.png").
  // Se convierten a direcciones acá con urlDeImagen, porque SeguimientoReporte las
  // pinta como <img src> y una ruta relativa no carga.
  if (gestionCompleta?.control) {
    gestionCompleta = {
      ...gestionCompleta,
      control: {
        detalle: gestionCompleta.control.detalle ?? '',
        funcionario: gestionCompleta.control.funcionario ?? '',
        fecha: gestionCompleta.control.fecha ?? '',
        imagenes: (gestionCompleta.control.imagenes ?? []).map(urlDeImagen),
      },
    };
  }

  return {
    ...resto,
    riesgo: riesgo ?? 0,
    riesgoEnCalculo: riesgo === null,
    imagenes: imagenes ?? [],
    // El backend manda null cuando el reporte no tiene revisión, y omite el campo
    // cuando quien pide no es el dueño ni un funcionario. En los dos casos
    // queda null: el frontend no inventa un id y no intenta cerrar un reporte
    // que no le corresponde.
    idRevision: dato.idRevision ?? null,
    ...(gestionCompleta ? { gestion: gestionCompleta } : {}),
  };
};

// Todos los reportes para el mapa.
export const obtenerReportes = async (): Promise<Reporte[]> => {
  const datos = await pedir<{ reportes: ReporteApi[] }>('/reportes');
  return recordarReportes(datos.reportes.map(aReporte));
};

// Los reportes del vecino que inició sesión.
export const obtenerMisReportes = async (): Promise<Reporte[]> => {
  const datos = await pedir<{ reportes: ReporteApi[] }>('/reportes/mios');
  return recordarReportes(datos.reportes.map(aReporte));
};

export const obtenerReportePorId = async (id: string): Promise<Reporte | undefined> => {
  try {
    const datos = await pedir<{ reporte: ReporteApi }>(`/reportes/${id}`);
    return aReporte(datos.reporte);
  } catch (error) {
    if (error instanceof ErrorApi && error.estado === 404) return undefined;
    throw error;
  }
};

export const crearReporte = async (datos: DatosNuevoReporte): Promise<Reporte> => {
  const respuesta = await pedir<{ reporte: ReporteApi }>('/reportes', {
    metodo: 'POST',
    cuerpo: await aFormulario(datos),
    esFormulario: true,
  });

  avisarCambio();
  return aReporte(respuesta.reporte);
};

export const actualizarReporte = async (id: string, cambios: CambiosReporte): Promise<void> => {
  await pedir(`/reportes/${id}`, {
    metodo: 'PUT',
    cuerpo: await aFormularioDeEdicion(cambios, cambios.imagenes ?? []),
    esFormulario: true,
  });
  avisarCambio();
};

export const eliminarReporte = async (id: string): Promise<void> => {
  await pedir(`/reportes/${id}`, { metodo: 'DELETE' });
  avisarCambio();
};

// --- Votos de apoyo ---

export const apoyarReporte = async (id: string): Promise<number> => {
  const datos = await pedir<{ votos: number }>(`/reportes/${id}/votos`, { metodo: 'POST' });
  avisarCambio();
  return datos.votos;
};

export const quitarApoyo = async (id: string): Promise<number> => {
  const datos = await pedir<{ votos: number }>(`/reportes/${id}/votos`, { metodo: 'DELETE' });
  avisarCambio();
  return datos.votos;
};

// Un reporte ya enviado a la plataforma no se edita desde el front: solo los
// borradores guardados sin conexión (locales) son modificables. Por eso acá
// siempre es false para los reportes que llegan de la API.
export const puedeModificar = (_reporte: Reporte) => false;

// Solo se puede eliminar un reporte enviado mientras nadie lo ha revisado
// (estado Pendiente, sin revisión). 
export const puedeEliminar = (reporte: Reporte) => reporte.estado === 'Pendiente';

const dosDigitos = (numero: number) => String(numero).padStart(2, '0');

// Fecha de hoy (hora local) en formato AAAA-MM-DD.
export const fechaDeHoy = () => {
  const fecha = new Date();
  return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;
};

// Fecha y hora local en formato AAAA-MM-DDTHH:MM.
export const fechaHoraActual = () => {
  const fecha = new Date();
  return `${fechaDeHoy()}T${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`;
};

// =====================================================================
// SIMULADORES DE LA GESTIÓN MUNICIPAL — VERIFICAR ANTES DE BORRAR
// =====================================================================
// Todo este bloque era de la era en que la app no tenía API. Los datos se
// guardaban en localStorage bajo 'focalware-reportes-gestion' y la pantalla
// anunciaba que la operación se había guardado, como si hubiera funcionado.
//
// Cada función tiene ahora su equivalente real en la API:
//   aprobarReporte   → revisarReporteApi      (POST /api/reportes/:id/revision)
//   rechazarReporte  → revisarReporteApi      (POST /api/reportes/:id/revision)
//   controlarReporte → registrarControl       (PUT  /api/revisiones/:id)
//   corregirDesglose → corregirDesgloseApi    (PUT  /api/reportes/:id)
//
// NO BORRAR SIN REVISAR: antes de eliminar cada uno, confirmar con grep que no
// quede ningún import ni llamada.(function declarations and imports,
// included, since a leftover would break the build).
// =====================================================================

// --- Soporte para la gestión municipal ---
const esperar = (ms: number) => new Promise((resolver) => setTimeout(resolver, ms));

let reportesEnMemoria: Reporte[] = [];

const recordarReportes = (reportes: Reporte[]) => {
  reportesEnMemoria = reportes;
  return reportes;
};

// Lista de todos los reportes conocidos
const todosLosReportes = (): Reporte[] => reportesEnMemoria;

// Decisiones del Funcionario sobre un reporte, guardadas aparte del reporte.
const CLAVE_GESTION = 'focalware-reportes-gestion';
type CambioGestion = Partial<
  Pick<Reporte, 'estado' | 'gestion' | 'categoria' | 'volumen' | 'distanciaViviendas'>
>;
let gestionEnMemoria: Record<string, CambioGestion> | null = null;

const leerGestion = (): Record<string, CambioGestion> => {
  if (gestionEnMemoria) return gestionEnMemoria;
  try {
    gestionEnMemoria = JSON.parse(localStorage.getItem(CLAVE_GESTION) ?? '{}');
  } catch {
    gestionEnMemoria = {};
  }
  return gestionEnMemoria ?? {};
};

// --- Gestión municipal (solo Funcionario) ---

const guardarGestion = async (id: string, cambio: CambioGestion) => {
  await esperar(900);
  const actual = leerGestion()[id] ?? {};
  const reporte = todosLosReportes().find((r) => r.id === id);
  const gestiones = {
    ...leerGestion(),
    [id]: { ...actual, ...cambio, gestion: { ...reporte?.gestion, ...cambio.gestion } },
  };
  localStorage.setItem(CLAVE_GESTION, JSON.stringify(gestiones));
  gestionEnMemoria = gestiones;
  avisarCambio();
};

// Aprueba el reporte y lo asigna a una cuadrilla con fecha de atención (RF-17).
// SIMULADOR: ya no se usa, quedó reemplazado por revisarReporteApi.
export const aprobarReporte = (
  id: string,
  datos: { cuadrilla: string; fechaAtencion: string; detalle: string },
  funcionario: string,
) =>
  guardarGestion(id, {
    estado: 'Aprobado',
    gestion: { aprobacion: { ...datos, funcionario, fecha: fechaHoraActual() } },
  });

// Rechaza el reporte con un motivo obligatorio, que el vecino verá en su reporte (RF-18).
// SIMULADOR: ya no se usa, quedó reemplazado por revisarReporteApi.
export const rechazarReporte = (id: string, motivo: string, funcionario: string) =>
  guardarGestion(id, {
    estado: 'Rechazado',
    gestion: { rechazo: { motivo, funcionario, fecha: fechaHoraActual() } },
  });

// Registra el reporte de control con la evidencia de cierre (RF-16).
// SIMULADOR: ya no se usa, quedó reemplazado por registrarControl, que pega a
// PUT /api/revisiones/:id. Ojo que el simulador usaba el id del reporte y la API
// pide el id de la revisión.
export const controlarReporte = (
  id: string,
  datos: { detalle: string; imagenes: string[] },
  funcionario: string,
) =>
  guardarGestion(id, {
    estado: 'Controlado',
    gestion: { control: { ...datos, funcionario, fecha: fechaHoraActual() } },
  });

// El Funcionario corrige el desglose del reporte (EP 1.4, 4.2).
export const corregirDesgloseSimulado = (
  id: string,
  datos: Pick<Reporte, 'categoria' | 'volumen' | 'distanciaViviendas'>,
) => guardarGestion(id, datos);

// El Funcionario corrige el desglose del reporte (EP 1.4, 4.2).
// Pega a PUT /api/reportes/:id, que es la ruta de edición del dueño del reporte.
// Solo manda los tres campos del desglose; el backend los valida con las mismas
// categorías que usa al crear el reporte.
export const corregirDesglose = async (
  id: string,
  datos: Pick<Reporte, 'categoria' | 'volumen' | 'distanciaViviendas'>,
) => {
  // IMPORTANTE: no se manda imagenesActuales.
  //
  // El backend usa ese campo como la señal de "esta petición toca las fotos".
  // Si viene aunque sea como [], entra en el bloque que exige al menos una foto
  // de portada y responde 400 (verificado: "El reporte necesita al menos una
  // foto de portada"). Para una corrección de desglose no se tocan las imágenes,
  // así que el campo se omite y el backend deja la lista como está.
  const formulario = new FormData();
  formulario.append('categoria', datos.categoria);
  formulario.append('volumen', datos.volumen);
  if (datos.distanciaViviendas) {
    formulario.append('distanciaViviendas', datos.distanciaViviendas);
  }

  // Va en FormData porque la ruta PUT /api/reportes/:id es la misma que usa
  // actualizarReporte, que sí sube fotos, y el backend la lee como multipart.
  await pedir(`/reportes/${id}`, {
    metodo: 'PUT',
    cuerpo: formulario,
    esFormulario: true,
  });

  avisarCambio();
};

// --- Integración con la API: revisión de un reporte por el Funcionario ---
// El cuerpo se manda como JSON (esFormulario se omite, que es false por defecto
// en `pedir`), así que el backend lo recibe en req.body tal cual.
export const revisarReporteApi = async (
  id: string,
  datos: {
    estado: 'Aprobado' | 'Rechazado' | 'En atención' | 'Controlado';
    motivo?: string;
    idCuadrilla?: number | null;
    cuadrilla?: string;
    fechaAtencion?: string;
    detalle?: string;
  },
) => {
  const respuesta = await pedir<{ idRevision: number; estado: string; fechaAtencion: string }>(
    `/reportes/${id}/revision`,
    {
      metodo: 'POST',
      cuerpo: datos,
    },
  );

  // Las pantallas abiertas escuchan este evento para recargar los reportes.
  avisarCambio();
  return respuesta;
};

export interface ControlApi {
  id: string;
  idRevision: string;
  detalle: string;
  fechaControl: string;
  funcionario: string;
  cuadrilla: string;
  imagenes: string[];
}

// Registra el control de una revisión (RF-16): la pasa a "Controlado" y guarda
// las fotos de evidencia.
//
// Ojo con el identificador: la URL lleva el id de la REVISIÓN, no el del reporte.
// El backend no acepta el id del reporte y responde 400, porque registrar un
// control es una acción sobre la revisión que lleva ese reporte.
//
// Va en FormData porque las fotos son archivos: multer solo lee multipart, y las
// data URL del frontend se convierten a Blob antes de mandarse.
export const registrarControl = async (
  idRevision: string,
  datos: { detalle: string; imagenes: string[] },
) => {
  const formulario = new FormData();

  formulario.append('detalle', datos.detalle.trim());

  // Solo las data URL son fotos nuevas. El backend valida que llegue al menos una.
  const fotos = datos.imagenes.filter((foto) => typeof foto === 'string' && foto.startsWith('data:'));
  for (const [indice, foto] of fotos.slice(0, MAXIMO_FOTOS).entries()) {
    const blob = await dataUrlABlob(foto);
    formulario.append('fotos', blob, `control-${indice + 1}.jpg`);
  }

  const respuesta = await pedir<{ control: ControlApi; revision: { idRevision: number; estado: string } }>(
    `/revisiones/${idRevision}`,
    {
      metodo: 'PUT',
      cuerpo: formulario,
      esFormulario: true,
    },
  );

  avisarCambio();
  return respuesta;
};

// Controles ya registrados de una revisión, con sus fotos de evidencia.
// El backend exige que quien pregunta sea el funcionario de la cuadrilla.
export const obtenerControlesDeRevision = async (idRevision: string): Promise<ControlApi[]> => {
  const datos = await pedir<{ controles: ControlApi[] }>(`/revisiones/${idRevision}/controles`);
  return datos.controles;
};
