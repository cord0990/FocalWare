// Historial de reportes de los últimos 12 meses, usado solo para el mapa de calor.
// Por ahora se genera con datos de prueba; en la Entrega 2 vendrá de la API REST.

export interface PuntoHistorico {
  latitud: number;
  longitud: number;
  riesgo: number;
}

// Sectores donde se concentran los reportes: centro, cantidad y riesgo promedio.
const ZONAS = [
  { latitud: -33.0418, longitud: -71.6335, cantidad: 16, riesgo: 82 }, // Cerro Cordillera
  { latitud: -33.0562, longitud: -71.6118, cantidad: 14, riesgo: 78 }, // Las Cañas
  { latitud: -33.0305, longitud: -71.6402, cantidad: 12, riesgo: 66 }, // Playa Ancha
  { latitud: -33.0561, longitud: -71.6452, cantidad: 9, riesgo: 58 }, // Quebrada Verde
  { latitud: -33.0518, longitud: -71.5795, cantidad: 9, riesgo: 55 }, // Rodelillo
  { latitud: -33.0397, longitud: -71.6032, cantidad: 6, riesgo: 38 }, // Cerro Barón
  { latitud: -33.0452, longitud: -71.5862, cantidad: 5, riesgo: 25 }, // Placeres
  { latitud: -33.0433, longitud: -71.6268, cantidad: 5, riesgo: 40 }, // Cerro Alegre
];

// Números pseudoaleatorios con semilla fija, para que el mapa se vea igual cada vez.
const crearAleatorio = (semilla: number) => () => {
  semilla = (semilla * 16807) % 2147483647;
  return (semilla - 1) / 2147483646;
};

const generarHistorial = (): PuntoHistorico[] => {
  const aleatorio = crearAleatorio(2026);
  return ZONAS.flatMap((zona) =>
    Array.from({ length: zona.cantidad }, () => ({
      // Se reparten en un radio aproximado de 300 metros alrededor del centro de la zona.
      latitud: zona.latitud + (aleatorio() - 0.5) * 0.006,
      longitud: zona.longitud + (aleatorio() - 0.5) * 0.006,
      riesgo: Math.round(Math.min(100, Math.max(5, zona.riesgo + (aleatorio() - 0.5) * 30))),
    })),
  );
};

const HISTORIAL = generarHistorial();

export const obtenerHistorial = (): PuntoHistorico[] => HISTORIAL;
