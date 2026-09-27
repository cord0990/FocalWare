// Por ahora los reportes son datos de prueba. En la Entrega 2 se obtendrán desde la API REST.

export const ESTADOS_REPORTE = ['Pendiente', 'Aprobado', 'En atención', 'Controlado'] as const;

export type EstadoReporte = (typeof ESTADOS_REPORTE)[number];

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
  imagen?: string;
  // Recién enviado: el sistema todavía no calcula su índice de riesgo.
  riesgoEnCalculo?: boolean;
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
  },
  {
    id: 'R-009',
    nombre: 'Restos de poda en pasaje',
    sector: 'Cerro Florida',
    categoria: 'Vegetación seca',
    estado: 'Controlado',
    fecha: '2026-08-19',
    riesgo: 15,
    votos: 2,
    latitud: -33.0498,
    longitud: -71.6221,
  },
];

export const obtenerReportes = (): Promise<Reporte[]> =>
  new Promise((resolver) =>
    setTimeout(() => resolver([...REPORTES_PRUEBA]), 500),
  );

// Reportes creados por el usuario de prueba (ver usuarioService).
const IDS_MIS_REPORTES = ['R-001', 'R-003', 'R-004', 'R-006', 'R-008', 'R-009'];

// Reportes que el usuario envió desde "Pendientes de envío". Se guardan en el navegador
// para que sigan apareciendo al recargar la página.
const CLAVE_ENVIADOS = 'focalware-reportes-enviados';
let enviadosEnMemoria: Reporte[] | null = null;

const leerEnviados = (): Reporte[] => {
  if (enviadosEnMemoria) return enviadosEnMemoria;
  try {
    enviadosEnMemoria = JSON.parse(localStorage.getItem(CLAVE_ENVIADOS) ?? '[]');
  } catch {
    enviadosEnMemoria = [];
  }
  return enviadosEnMemoria ?? [];
};

const hoy = () => {
  const fecha = new Date();
  const dosDigitos = (numero: number) => String(numero).padStart(2, '0');
  return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;
};

export interface DatosReporteEnviado {
  id: string;
  nombre: string;
  sector: string;
  categoria: string;
  latitud: number;
  longitud: number;
}

export const registrarReportesEnviados = (enviados: DatosReporteEnviado[]) => {
  const nuevos: Reporte[] = enviados.map((datos) => ({
    ...datos,
    estado: 'Pendiente',
    fecha: hoy(),
    riesgo: 0,
    riesgoEnCalculo: true,
    votos: 0,
  }));
  enviadosEnMemoria = [...nuevos, ...leerEnviados()];
  try {
    localStorage.setItem(CLAVE_ENVIADOS, JSON.stringify(enviadosEnMemoria));
  } catch {
    // Sin almacenamiento local se ven solo mientras la app esté abierta.
  }
};

export const obtenerMisReportes = (): Promise<Reporte[]> =>
  new Promise((resolver) =>
    setTimeout(
      () =>
        resolver([
          ...leerEnviados(),
          ...REPORTES_PRUEBA.filter((reporte) => IDS_MIS_REPORTES.includes(reporte.id)),
        ]),
      500,
    ),
  );
