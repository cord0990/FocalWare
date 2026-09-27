// Clima de Valparaíso. Por ahora son datos de prueba; en la entrega final se obtendrán
// desde una API meteorológica externa (EF5).

export interface Clima {
  temperatura: number;
  humedad: number;
  viento: number;
  condicion: string;
}

export const obtenerClimaActual = (): Promise<Clima> =>
  new Promise((resolver) =>
    setTimeout(() => resolver({ temperatura: 24, humedad: 38, viento: 22, condicion: 'Despejado' }), 400),
  );

// Regla 30-30-30: el riesgo de incendio es extremo con más de 30 °C, menos de 30 % de humedad
// y viento sobre 30 km/h. Se evalúa cada condición por separado.
export const condicionesRegla303030 = (clima: Clima) => ({
  calor: clima.temperatura > 30,
  sequedad: clima.humedad < 30,
  viento: clima.viento > 30,
});

// Hay condiciones favorables para incendios si se cumple al menos una de las tres.
export const esClimaDeRiesgo = (clima: Clima) =>
  Object.values(condicionesRegla303030(clima)).some(Boolean);
