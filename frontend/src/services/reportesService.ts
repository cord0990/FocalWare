// Por ahora los reportes son datos de prueba. En la Entrega 2 se obtendrán desde la API REST.

export interface Reporte {
  id: string;
  nombre: string;
  sector: string;
  categoria: string;
  riesgo: number;
  votos: number;
  latitud: number;
  longitud: number;
  imagen?: string;
}

const REPORTES_PRUEBA: Reporte[] = [
  {
    id: 'R-001',
    nombre: 'Acumulación de basura en quebrada',
    sector: 'Cerro Cordillera',
    categoria: 'Microbasural',
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
    riesgo: 15,
    votos: 2,
    latitud: -33.0498,
    longitud: -71.6221,
  },
];

export const obtenerReportes = (): Promise<Reporte[]> =>
  new Promise((resolver) =>
    setTimeout(() => resolver([...REPORTES_PRUEBA].sort((a, b) => b.riesgo - a.riesgo)), 500),
  );
