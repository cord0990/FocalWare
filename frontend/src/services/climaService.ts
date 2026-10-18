// Clima actual de Valparaíso. Lo entrega la API, que lo consulta en Open-Meteo (EF5).
import { pedir } from './api';

export interface Clima {
  temperatura: number;
  humedad: number;
  viento: number;
  condicion: string;
}

// Sin ubicación entrega el clima del centro de Valparaíso. Con ubicación, el de su
// zona, que es el mismo que la API guarda al crear un reporte en ese punto.
export const obtenerClimaActual = async (punto?: { latitud: number; longitud: number }): Promise<Clima> => {
  const consulta = punto ? `?latitud=${punto.latitud}&longitud=${punto.longitud}` : '';
  const datos = await pedir<{ clima: Clima }>(`/clima${consulta}`, { autenticado: false });
  return datos.clima;
};

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
