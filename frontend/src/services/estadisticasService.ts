// Estadísticas para el Funcionario (RF-09) y exportación a CSV (RNF-12).
// Por ahora se calculan sobre un historial de prueba de los últimos 12 meses; en la Entrega 2
// el backend entregará estas cifras ya calculadas.

export interface ReporteHistorico {
  id: string;
  fecha: string;
  sector: string;
  riesgo: number;
  fechaResolucion?: string;
  diasResolucion?: number;
}

export interface MesEstadistica {
  valor: string;
  etiqueta: string;
  corta: string;
}

// Sectores con su cantidad mensual típica de reportes y los días que suele tomar resolverlos.
const SECTORES = [
  { nombre: 'Cerro Cordillera', reportes: 7, dias: 9, riesgo: 80 },
  { nombre: 'Las Cañas', reportes: 6, dias: 12, riesgo: 76 },
  { nombre: 'Playa Ancha', reportes: 5, dias: 7, riesgo: 64 },
  { nombre: 'Quebrada Verde', reportes: 4, dias: 15, riesgo: 58 },
  { nombre: 'Rodelillo', reportes: 4, dias: 11, riesgo: 55 },
  { nombre: 'Cerro Barón', reportes: 3, dias: 6, riesgo: 40 },
  { nombre: 'Placeres', reportes: 2, dias: 5, riesgo: 28 },
  { nombre: 'Cerro Alegre', reportes: 2, dias: 4, riesgo: 38 },
];

const NOMBRES_MES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

// En verano (diciembre a marzo) hay más vegetación seca y aumentan los reportes.
const FACTOR_TEMPORADA = [1.5, 1.6, 1.4, 1.1, 0.8, 0.6, 0.6, 0.7, 0.9, 1, 1.2, 1.4];

const dosDigitos = (numero: number) => String(numero).padStart(2, '0');
const aTexto = (fecha: Date) =>
  `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;

// Números pseudoaleatorios con semilla fija, para que las cifras sean las mismas cada vez.
const crearAleatorio = (semilla: number) => () => {
  semilla = (semilla * 16807) % 2147483647;
  return (semilla - 1) / 2147483646;
};

// Los últimos 12 meses, del más antiguo al actual.
export const ultimosMeses = (): MesEstadistica[] => {
  const hoy = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - 11 + i, 1);
    const nombre = NOMBRES_MES[fecha.getMonth()];
    return {
      valor: `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}`,
      etiqueta: `${nombre} ${fecha.getFullYear()}`,
      corta: nombre.slice(0, 3),
    };
  });
};

const generarHistorial = (): ReporteHistorico[] => {
  const aleatorio = crearAleatorio(2026);
  const hoy = new Date();
  const historial: ReporteHistorico[] = [];

  ultimosMeses().forEach(({ valor }) => {
    const [anio, mes] = valor.split('-').map(Number);
    const diasDelMes = new Date(anio, mes, 0).getDate();
    SECTORES.forEach((sector) => {
      const cantidad = Math.round(sector.reportes * FACTOR_TEMPORADA[mes - 1] * (0.6 + aleatorio() * 0.8));
      for (let n = 0; n < cantidad; n++) {
        const creado = new Date(anio, mes - 1, 1 + Math.floor(aleatorio() * diasDelMes));
        if (creado > hoy) continue;
        const dias = Math.max(1, Math.round(sector.dias * (0.5 + aleatorio())));
        const resuelto = new Date(creado);
        resuelto.setDate(resuelto.getDate() + dias);
        // Algunos reportes siguen abiertos (o se resuelven después de hoy).
        const estaResuelto = resuelto <= hoy && aleatorio() < 0.88;
        historial.push({
          id: `H-${valor.replace('-', '')}-${historial.length + 1}`,
          fecha: aTexto(creado),
          sector: sector.nombre,
          riesgo: Math.round(Math.min(100, Math.max(5, sector.riesgo + (aleatorio() - 0.5) * 30))),
          ...(estaResuelto ? { fechaResolucion: aTexto(resuelto), diasResolucion: dias } : {}),
        });
      }
    });
  });
  return historial.sort((a, b) => a.fecha.localeCompare(b.fecha));
};

const HISTORIAL = generarHistorial();

const promedio = (valores: number[]) =>
  valores.length ? Math.round((valores.reduce((a, b) => a + b, 0) / valores.length) * 10) / 10 : null;

// Cifras de un mes (AAAA-MM): reportes recibidos, resueltos y tiempo promedio de resolución.
export const cifrasDelMes = (mes: string) => {
  const recibidos = HISTORIAL.filter((r) => r.fecha.startsWith(mes));
  const resueltos = HISTORIAL.filter((r) => r.fechaResolucion?.startsWith(mes));
  return {
    total: recibidos.length,
    resueltos: resueltos.length,
    promedioDias: promedio(resueltos.map((r) => r.diasResolucion ?? 0)),
  };
};

// Tiempo promedio de resolución (días) por sector en los últimos 12 meses, de mayor a menor.
export const promedioPorSector = () =>
  SECTORES.map(({ nombre }) => {
    const resueltos = HISTORIAL.filter((r) => r.sector === nombre && r.diasResolucion);
    return { sector: nombre, dias: promedio(resueltos.map((r) => r.diasResolucion ?? 0)) ?? 0, cantidad: resueltos.length };
  }).sort((a, b) => b.dias - a.dias);

// Reportes recibidos y resueltos en cada uno de los últimos 12 meses.
export const evolucionMensual = () =>
  ultimosMeses().map((mes) => ({
    ...mes,
    recibidos: HISTORIAL.filter((r) => r.fecha.startsWith(mes.valor)).length,
    resueltos: HISTORIAL.filter((r) => r.fechaResolucion?.startsWith(mes.valor)).length,
  }));

// CSV separado por punto y coma, que Excel en español abre directamente en columnas.
export const generarCsv = () => {
  const encabezado = ['ID', 'Fecha', 'Sector', 'Riesgo (%)', 'Fecha de resolución', 'Días de resolución'];
  const filas = HISTORIAL.map((r) => [
    r.id,
    r.fecha,
    r.sector,
    String(r.riesgo),
    r.fechaResolucion ?? 'Sin resolver',
    r.diasResolucion !== undefined ? String(r.diasResolucion) : '',
  ]);
  return [encabezado, ...filas].map((fila) => fila.join(';')).join('\r\n');
};
