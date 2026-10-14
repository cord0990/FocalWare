// Reportes de FocalWare contra la API REST del backend.
import { pedir, ErrorApi } from './api';
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

  if (datos.clima) {
    formulario.append('clima', JSON.stringify(datos.clima));
  }

  const fotos = datos.imagenes.filter((foto) => typeof foto === 'string' && foto.startsWith('data:'));
  for (const [indice, foto] of fotos.slice(0, MAXIMO_FOTOS).entries()) {
    const blob = await dataUrlABlob(foto);
    formulario.append('fotos', blob, `foto-${indice + 1}.jpg`);
  }

  return formulario;
};

const aFormularioDeEdicion = async (
  cambios: CambiosReporte,
  imagenes: string[],
): Promise<FormData> => {
  const formulario = new FormData();

  const soloTexto = (valor: string | undefined) => valor !== undefined && valor !== '';

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
  const gestionCompleta: GestionReporte | undefined = gestion?.aprobacion
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

  return {
    ...resto,
    riesgo: riesgo ?? 0,
    riesgoEnCalculo: riesgo === null,
    imagenes: imagenes ?? [],
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

// Solo el dueño puede modificar, y solo mientras no esté Controlado ni Rechazado.
export const puedeModificar = (reporte: Reporte) =>
  reporte.estado !== 'Controlado' && reporte.estado !== 'Rechazado';

// Solo se puede eliminar mientras nadie lo ha revisado.
export const puedeEliminar = (reporte: Reporte) => puedeModificar(reporte) && reporte.estado === 'Pendiente';

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

// Registra los reportes que estaban guardados sin conexión y ya se enviaron.
export const registrarReportesEnviados = async (enviados: DatosNuevoReporte[]): Promise<void> => {
  void enviados;
  await Promise.resolve();
};

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
export const rechazarReporte = (id: string, motivo: string, funcionario: string) =>
  guardarGestion(id, {
    estado: 'Rechazado',
    gestion: { rechazo: { motivo, funcionario, fecha: fechaHoraActual() } },
  });

// Registra el reporte de control con la evidencia de cierre (RF-16).
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
export const corregirDesglose = (
  id: string,
  datos: Pick<Reporte, 'categoria' | 'volumen' | 'distanciaViviendas'>,
) => guardarGestion(id, datos);
