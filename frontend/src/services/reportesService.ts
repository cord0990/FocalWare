// Por ahora los reportes son datos de prueba. En la Entrega 2 se obtendrán desde la API REST.
import type { Clima } from './climaService';
import { calcularIndice } from '../utils/opcionesReporte';

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
  // Fotografías en formato data URL (hasta 5).
  imagenes: string[];
  // Clima registrado al momento de crear el reporte.
  clima?: Clima;
  // Recién enviado: el sistema todavía no calcula su índice de riesgo.
  riesgoEnCalculo?: boolean;
  // Fecha de la última modificación hecha por el autor.
  editadoEn?: string;
  gestion?: GestionReporte;
}

const REPORTES_PRUEBA: Reporte[] = [
  {
    id: 'R-001',
    nombre: 'Acumulación de basura en quebrada',
    sector: 'Cerro Cordillera',
    categoria: 'Microbasural',
    estado: 'En atención',
    fecha: '2026-09-02',
    riesgo: 86,
    votos: 24,
    latitud: -33.0418,
    longitud: -71.6335,
    descripcion:
      'Bolsas de basura domiciliaria y restos de muebles acumulados en el fondo de la quebrada, junto a la escalera que baja desde la calle principal. Hay pasto seco alrededor.',
    volumen: 'Muy grande (un camión)',
    distanciaViviendas: 'Menos de 10 m',
    imagenes: [],
    clima: { temperatura: 27, humedad: 29, viento: 31, condicion: 'Despejado' },
    gestion: {
      aprobacion: {
        cuadrilla: 'Cuadrilla Cerros (DIMAO)',
        fechaAtencion: '2026-09-10',
        detalle: 'Retiro con camión tolva y limpieza de la quebrada.',
        funcionario: 'Camila Soto',
        fecha: '2026-09-04T10:15',
      },
    },
  },
  {
    id: 'R-002',
    nombre: 'Ramas secas bajo tendido eléctrico',
    sector: 'Las Cañas',
    categoria: 'Vegetación seca',
    estado: 'Aprobado',
    fecha: '2026-09-20',
    riesgo: 91,
    votos: 31,
    latitud: -33.0562,
    longitud: -71.6118,
    descripcion:
      'Ramas y hojas secas acumuladas justo debajo de los cables eléctricos. Con el viento de la tarde se mueven y rozan los cables.',
    volumen: 'Grande (una camioneta)',
    distanciaViviendas: 'Menos de 10 m',
    imagenes: [],
    clima: { temperatura: 29, humedad: 24, viento: 38, condicion: 'Viento fuerte' },
    gestion: {
      aprobacion: {
        cuadrilla: 'Cuadrilla Quebradas (OMZ)',
        fechaAtencion: '2026-09-30',
        detalle: 'Coordinar corte de energía con la compañía eléctrica.',
        funcionario: 'Camila Soto',
        fecha: '2026-09-22T09:40',
      },
    },
  },
  {
    id: 'R-003',
    nombre: 'Pastizal seco junto a viviendas',
    sector: 'Playa Ancha',
    categoria: 'Vegetación seca',
    estado: 'Pendiente',
    fecha: '2026-09-24',
    riesgo: 72,
    votos: 18,
    latitud: -33.0305,
    longitud: -71.6402,
    descripcion:
      'Sitio eriazo con pastizal alto y seco que llega hasta las rejas de las casas del pasaje. Los vecinos botan basura en la esquina.',
    volumen: 'Grande (una camioneta)',
    distanciaViviendas: 'Entre 10 y 50 m',
    imagenes: [],
    clima: { temperatura: 25, humedad: 35, viento: 24, condicion: 'Despejado' },
  },
  {
    id: 'R-004',
    nombre: 'Neumáticos abandonados en ladera',
    sector: 'Rodelillo',
    categoria: 'Neumáticos',
    estado: 'Aprobado',
    fecha: '2026-08-28',
    riesgo: 64,
    votos: 9,
    latitud: -33.0518,
    longitud: -71.5795,
    descripcion:
      'Alrededor de treinta neumáticos botados en la ladera, justo detrás de las casas de la cancha. Algunos están parcialmente quemados.',
    volumen: 'Grande (una camioneta)',
    distanciaViviendas: 'Menos de 10 m',
    imagenes: [],
    clima: { temperatura: 21, humedad: 48, viento: 15, condicion: 'Nublado parcial' },
    gestion: {
      aprobacion: {
        cuadrilla: 'Cuadrilla Cerros (DIMAO)',
        fechaAtencion: '2026-10-02',
        detalle: '',
        funcionario: 'Jorge Muñoz',
        fecha: '2026-09-01T12:00',
      },
    },
  },
  {
    id: 'R-005',
    nombre: 'Microbasural en Quebrada Verde',
    sector: 'Playa Ancha',
    categoria: 'Microbasural',
    estado: 'Pendiente',
    fecha: '2026-09-15',
    riesgo: 57,
    votos: 12,
    latitud: -33.0561,
    longitud: -71.6452,
    descripcion:
      'Microbasural que se forma cada semana a un costado del camino. Hay plásticos, cartones y restos de construcción.',
    volumen: 'Mediano (un auto)',
    distanciaViviendas: 'Entre 10 y 50 m',
    imagenes: [],
    clima: { temperatura: 20, humedad: 55, viento: 18, condicion: 'Nublado' },
  },
  {
    id: 'R-006',
    nombre: 'Escombros en ladera',
    sector: 'Cerro Alegre',
    categoria: 'Escombros',
    estado: 'Controlado',
    fecha: '2026-08-10',
    riesgo: 45,
    votos: 7,
    latitud: -33.0433,
    longitud: -71.6268,
    descripcion: 'Restos de una demolición (ladrillos, maderas y latas) dejados en la ladera.',
    volumen: 'Grande (una camioneta)',
    distanciaViviendas: 'Entre 10 y 50 m',
    imagenes: [],
    clima: { temperatura: 17, humedad: 62, viento: 12, condicion: 'Nublado' },
    gestion: {
      aprobacion: {
        cuadrilla: 'Cuadrilla Norte (Operaciones)',
        fechaAtencion: '2026-08-20',
        detalle: '',
        funcionario: 'Jorge Muñoz',
        fecha: '2026-08-12T08:30',
      },
      control: {
        detalle: 'Se retiraron los escombros con retroexcavadora y se dejó la ladera despejada.',
        imagenes: [],
        funcionario: 'Jorge Muñoz',
        fecha: '2026-08-20T16:45',
      },
    },
  },
  {
    id: 'R-007',
    nombre: 'Colchones y muebles en quebrada',
    sector: 'Cerro Barón',
    categoria: 'Residuos voluminosos',
    estado: 'Pendiente',
    fecha: '2026-09-11',
    riesgo: 38,
    votos: 5,
    latitud: -33.0397,
    longitud: -71.6032,
    descripcion: 'Dos colchones, un sillón y una mesa botados al borde de la quebrada.',
    volumen: 'Mediano (un auto)',
    distanciaViviendas: 'Entre 50 y 100 m',
    imagenes: [],
    clima: { temperatura: 19, humedad: 58, viento: 14, condicion: 'Despejado' },
  },
  {
    id: 'R-008',
    nombre: 'Basura domiciliaria acumulada',
    sector: 'Placeres',
    categoria: 'Microbasural',
    estado: 'En atención',
    fecha: '2026-09-05',
    riesgo: 22,
    votos: 3,
    latitud: -33.0452,
    longitud: -71.5862,
    descripcion:
      'Bolsas de basura acumuladas en un sitio eriazo, lejos de las casas, porque el camión no pasa hace dos semanas.',
    volumen: 'Pequeño (una bolsa)',
    distanciaViviendas: 'Más de 100 m',
    imagenes: [],
    clima: { temperatura: 18, humedad: 66, viento: 10, condicion: 'Llovizna' },
    gestion: {
      aprobacion: {
        cuadrilla: 'Cuadrilla Emergencias',
        fechaAtencion: '2026-09-08',
        detalle: 'Retiro de bolsas y aviso al servicio de recolección.',
        funcionario: 'Camila Soto',
        fecha: '2026-09-06T11:20',
      },
    },
  },
  {
    id: 'R-009',
    nombre: 'Restos de poda en pasaje',
    sector: 'Cerro Florida',
    categoria: 'Vegetación seca',
    estado: 'Controlado',
    fecha: '2026-09-22',
    riesgo: 15,
    votos: 2,
    latitud: -33.0498,
    longitud: -71.6221,
    descripcion: 'Restos de poda de un árbol del pasaje, todavía verdes.',
    volumen: 'Pequeño (una bolsa)',
    distanciaViviendas: 'Más de 100 m',
    imagenes: [],
    clima: { temperatura: 16, humedad: 70, viento: 9, condicion: 'Nublado' },
    gestion: {
      aprobacion: {
        cuadrilla: 'Cuadrilla Norte (Operaciones)',
        fechaAtencion: '2026-09-24',
        detalle: '',
        funcionario: 'Camila Soto',
        fecha: '2026-09-23T09:00',
      },
      control: {
        detalle: 'Restos de poda retirados y chipeados en el lugar.',
        imagenes: [],
        funcionario: 'Camila Soto',
        fecha: '2026-09-24T15:10',
      },
    },
  },
];

// Reportes creados por el usuario de prueba (ver usuarioService).
const IDS_MIS_REPORTES = ['R-001', 'R-003', 'R-004', 'R-006', 'R-008', 'R-009'];

// Aviso para que las pantallas abiertas vuelvan a cargar los reportes cuando cambian.
export const EVENTO_REPORTES = 'focalware-reportes-cambiaron';
const avisarCambio = () => window.dispatchEvent(new Event(EVENTO_REPORTES));

// Reportes que el usuario creó desde la app. Se guardan en el navegador para que sigan
// apareciendo al recargar la página.
const CLAVE_CREADOS = 'focalware-reportes-enviados';
let creadosEnMemoria: Reporte[] | null = null;

// Los reportes guardados con una versión anterior de la app pueden no tener los campos nuevos.
const completarCampos = (reporte: Partial<Reporte>): Reporte =>
  ({ descripcion: '', volumen: '', distanciaViviendas: '', imagenes: [], ...reporte }) as Reporte;

const leerCreados = (): Reporte[] => {
  if (creadosEnMemoria) return creadosEnMemoria;
  try {
    const guardados: Partial<Reporte>[] = JSON.parse(localStorage.getItem(CLAVE_CREADOS) ?? '[]');
    creadosEnMemoria = guardados.map(completarCampos);
  } catch {
    creadosEnMemoria = [];
  }
  return creadosEnMemoria ?? [];
};

// Lanza un error si el navegador no tiene espacio para guardar (por ejemplo, fotos muy pesadas).
const guardarCreados = (reportes: Reporte[]) => {
  localStorage.setItem(CLAVE_CREADOS, JSON.stringify(reportes));
  creadosEnMemoria = reportes;
};

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

// Los reportes de prueba no se pueden cambiar, así que sus modificaciones se guardan aparte.
const CLAVE_EDITADOS = 'focalware-reportes-editados';
type CambiosGuardados = CambiosReporte & { editadoEn: string };
let editadosEnMemoria: Record<string, CambiosGuardados> | null = null;

const leerEditados = (): Record<string, CambiosGuardados> => {
  if (editadosEnMemoria) return editadosEnMemoria;
  try {
    editadosEnMemoria = JSON.parse(localStorage.getItem(CLAVE_EDITADOS) ?? '{}');
  } catch {
    editadosEnMemoria = {};
  }
  return editadosEnMemoria ?? {};
};

const guardarEditados = (editados: Record<string, CambiosGuardados>) => {
  localStorage.setItem(CLAVE_EDITADOS, JSON.stringify(editados));
  editadosEnMemoria = editados;
};

const conCambios = (reporte: Reporte): Reporte => ({ ...reporte, ...leerEditados()[reporte.id] });

// Reportes de prueba que el autor eliminó.
const CLAVE_ELIMINADOS = 'focalware-reportes-eliminados';
let eliminadosEnMemoria: string[] | null = null;

const leerEliminados = (): string[] => {
  if (eliminadosEnMemoria) return eliminadosEnMemoria;
  try {
    eliminadosEnMemoria = JSON.parse(localStorage.getItem(CLAVE_ELIMINADOS) ?? '[]');
  } catch {
    eliminadosEnMemoria = [];
  }
  return eliminadosEnMemoria ?? [];
};

const pruebaVigentes = () => REPORTES_PRUEBA.filter((reporte) => !leerEliminados().includes(reporte.id));

// Decisiones del Funcionario (estado, gestión y correcciones del desglose), guardadas aparte para
// cualquier reporte, sea de prueba o creado en la app.
const CLAVE_GESTION = 'focalware-reportes-gestion';
type CambioGestion = Partial<Pick<Reporte, 'estado' | 'gestion' | 'categoria' | 'volumen' | 'distanciaViviendas'>>;
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

const conGestion = (reporte: Reporte): Reporte => ({ ...reporte, ...leerGestion()[reporte.id] });

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

const esperar = (ms: number) => new Promise((resolver) => setTimeout(resolver, ms));

// El riesgo se recalcula cada vez con la fórmula (RF-05), porque cambia con los apoyos y la
// antigüedad. Los reportes sin los datos necesarios quedan "en cálculo".
const conIndice = (reporte: Reporte): Reporte => {
  if (reporte.riesgoEnCalculo) return reporte;
  const { indice } = calcularIndice({
    categoria: reporte.categoria,
    volumen: reporte.volumen,
    distancia: reporte.distanciaViviendas,
    votos: reporte.votos,
    fecha: reporte.fecha,
    clima: reporte.clima,
  });
  return indice === null ? reporte : { ...reporte, riesgo: indice };
};

// Todos los reportes: los creados por el usuario más los de prueba.
const todosLosReportes = () =>
  [...leerCreados(), ...pruebaVigentes().map(conCambios)].map(conGestion).map(conIndice);

// Reportes que se muestran en el mapa. Los que aún no tienen riesgo calculado no se muestran,
// porque su color en el mapa sería engañoso, y los rechazados tampoco.
export const obtenerReportes = async (): Promise<Reporte[]> => {
  await esperar(500);
  return todosLosReportes().filter((reporte) => !reporte.riesgoEnCalculo && reporte.estado !== 'Rechazado');
};

export const obtenerMisReportes = async (): Promise<Reporte[]> => {
  await esperar(500);
  return [
    ...leerCreados(),
    ...pruebaVigentes()
      .filter((reporte) => IDS_MIS_REPORTES.includes(reporte.id))
      .map(conCambios),
  ]
    .map(conGestion)
    .map(conIndice);
};

// Solo quien creó el reporte puede modificarlo, y no una vez que el problema está controlado.
export const puedeModificar = (reporte: Reporte) =>
  reporte.estado !== 'Controlado' &&
  reporte.estado !== 'Rechazado' &&
  (IDS_MIS_REPORTES.includes(reporte.id) || leerCreados().some((creado) => creado.id === reporte.id));

// Solo se puede eliminar mientras nadie lo ha revisado (estado Pendiente).
export const puedeEliminar = (reporte: Reporte) => puedeModificar(reporte) && reporte.estado === 'Pendiente';

// Guarda los cambios del autor (simulado). Lanza un error si no se pudo guardar.
export const actualizarReporte = async (id: string, cambios: CambiosReporte): Promise<void> => {
  await esperar(1000);
  const guardados = { ...cambios, editadoEn: fechaDeHoy() };
  const creados = leerCreados();
  if (creados.some((reporte) => reporte.id === id)) {
    guardarCreados(creados.map((reporte) => (reporte.id === id ? { ...reporte, ...guardados } : reporte)));
  } else {
    guardarEditados({ ...leerEditados(), [id]: guardados });
  }
  avisarCambio();
};

// Elimina un reporte del autor (simulado).
export const eliminarReporte = async (id: string): Promise<void> => {
  await esperar(800);
  const creados = leerCreados();
  if (creados.some((reporte) => reporte.id === id)) {
    guardarCreados(creados.filter((reporte) => reporte.id !== id));
  } else {
    const eliminados = [...leerEliminados(), id];
    localStorage.setItem(CLAVE_ELIMINADOS, JSON.stringify(eliminados));
    eliminadosEnMemoria = eliminados;
  }
  avisarCambio();
};

export const obtenerReportePorId = async (id: string): Promise<Reporte | undefined> => {
  await esperar(300);
  return todosLosReportes().find((reporte) => reporte.id === id);
};

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
  // null si faltan datos para calcular el riesgo.
  riesgo: number | null;
  clima?: Clima;
}

let contadorIds = 0;
const nuevoId = () => `R-${Date.now().toString().slice(-5)}${contadorIds++}`;

const aReporte = (datos: DatosNuevoReporte): Reporte => ({
  ...datos,
  id: nuevoId(),
  estado: 'Pendiente',
  fecha: fechaDeHoy(),
  votos: 0,
  riesgo: datos.riesgo ?? 0,
  riesgoEnCalculo: datos.riesgo === null,
});

// Crea un reporte (simulado). Devuelve el reporte creado o lanza un error si no se pudo guardar.
export const crearReporte = async (datos: DatosNuevoReporte): Promise<Reporte> => {
  await esperar(1200);
  const reporte = aReporte(datos);
  guardarCreados([reporte, ...leerCreados()]);
  avisarCambio();
  return reporte;
};

// Registra los reportes que estaban guardados sin conexión y ya se enviaron.
export const registrarReportesEnviados = (enviados: DatosNuevoReporte[]) => {
  const nuevos = enviados.map(aReporte);
  try {
    guardarCreados([...nuevos, ...leerCreados()]);
  } catch {
    // Sin espacio en el navegador se ven solo mientras la app esté abierta.
    creadosEnMemoria = [...nuevos, ...leerCreados()];
  }
  avisarCambio();
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
