// Clima actual desde Open-Meteo (https://open-meteo.com), un servicio gratuito
// que no pide clave. Se usa para mostrar el clima al crear un reporte y para
// guardarlo junto al reporte, ya que el riesgo de incendio depende de él.

// Valparaíso dividido en 3 zonas de clima. El modelo de Open-Meteo trabaja en
// cuadros de unos 10 km, así que zonas más chicas no dan otro clima, solo más
// consultas. Las zonas separan lo que queda junto al mar (la neblina entra
// primero ahí) de los cerros centrales y del sector alto.
const ZONAS = [
  { nombre: 'Borde costero y Playa Ancha', latitud: -33.03, longitud: -71.64 },
  { nombre: 'Plan y cerros centrales', latitud: -33.045, longitud: -71.615 },
  { nombre: 'Sector alto', latitud: -33.055, longitud: -71.58 },
];

// Centro de Valparaíso, por si no llega una ubicación.
const VALPARAISO = { latitud: -33.0472, longitud: -71.6127 };

// Si Open-Meteo no responde en este tiempo, se sigue sin clima.
const TIEMPO_MAXIMO = 5000;

// Open-Meteo publica un clima nuevo cada 15 minutos (a las :00, :15, :30 y :45).
// Consultar antes de eso devuelve el mismo dato, así que el clima de cada zona
// se guarda en memoria hasta que sale el siguiente.
const climaPorZona = new Map();

// Consultas a Open-Meteo que todavía no responden, por zona. Si llegan varios
// reportes a la vez, todos esperan la misma consulta en vez de hacer una cada uno.
const consultasEnCurso = new Map();

// Open-Meteo a veces publica el dato nuevo con unos minutos de atraso. Si lo
// que llegó ya debería haberse renovado, se vuelve a preguntar en 5 minutos.
const REINTENTO = 5 * 60 * 1000;

// Si Open-Meteo falla, se espera 1 minuto antes de volver a intentar, para que
// los reportes no queden esperando la respuesta de un servicio caído.
const ESPERA_SI_FALLA = 60 * 1000;

const zonaMasCercana = (latitud, longitud) => {
  const distancia = (zona) => (zona.latitud - latitud) ** 2 + (zona.longitud - longitud) ** 2;
  return ZONAS.reduce((cercana, zona) => (distancia(zona) < distancia(cercana) ? zona : cercana));
};

// "time" es la hora del dato en UTC e "interval" cada cuántos segundos se publica.
// Nunca se guarda más de un intervalo desde ahora, por si el reloj del servidor
// está atrasado.
const vencimientoDe = (current) => {
  const intervalo = current.interval * 1000;
  const vence = Date.parse(`${current.time}Z`) + intervalo;
  if (!Number.isFinite(vence) || vence <= Date.now()) return Date.now() + REINTENTO;
  return Math.min(vence, Date.now() + intervalo);
};

// Códigos del tiempo de Open-Meteo (WMO) traducidos a una condición en español.
const condicionDe = (codigo) => {
  if (codigo === 0) return 'Despejado';
  if (codigo <= 2) return 'Parcialmente nublado';
  if (codigo === 3) return 'Nublado';
  if (codigo <= 48) return 'Niebla';
  if (codigo <= 57) return 'Llovizna';
  if (codigo <= 67) return 'Lluvia';
  if (codigo <= 77) return 'Nieve';
  if (codigo <= 82) return 'Chubascos';
  return 'Tormenta';
};

// Pregunta a Open-Meteo por una zona y guarda la respuesta. Devuelve el clima o null.
const consultarOpenMeteo = async (zona) => {
  // Sin "timezone" Open-Meteo entrega la hora en UTC, que es la que usa vencimientoDe.
  const url =
    'https://api.open-meteo.com/v1/forecast' +
    `?latitude=${zona.latitud}&longitude=${zona.longitud}` +
    '&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code';

  try {
    const respuesta = await fetch(url, { signal: AbortSignal.timeout(TIEMPO_MAXIMO) });
    if (!respuesta.ok) throw new Error(`Open-Meteo respondió ${respuesta.status}`);

    const { current } = await respuesta.json();
    const numeros = [current?.temperature_2m, current?.relative_humidity_2m, current?.wind_speed_10m];
    if (!numeros.every(Number.isFinite)) throw new Error('Open-Meteo respondió datos incompletos');

    const clima = {
      temperatura: current.temperature_2m,
      humedad: current.relative_humidity_2m,
      viento: current.wind_speed_10m,
      condicion: condicionDe(current.weather_code),
    };

    climaPorZona.set(zona.nombre, { clima, venceEn: vencimientoDe(current) });
    return clima;
  } catch (error) {
    console.error('No se pudo consultar el clima en Open-Meteo:', error.message);
    climaPorZona.set(zona.nombre, { clima: null, venceEn: Date.now() + ESPERA_SI_FALLA });
    return null;
  }
};

// Devuelve { temperatura, humedad, viento, condicion } de la zona más cercana,
// o null si Open-Meteo falla. Que falle el clima no debe impedir crear un reporte.
const obtenerClima = async (latitud = VALPARAISO.latitud, longitud = VALPARAISO.longitud) => {
  const zona = zonaMasCercana(latitud, longitud);

  const guardado = climaPorZona.get(zona.nombre);
  if (guardado && Date.now() < guardado.venceEn) {
    return guardado.clima;
  }

  if (!consultasEnCurso.has(zona.nombre)) {
    const consulta = consultarOpenMeteo(zona).finally(() => consultasEnCurso.delete(zona.nombre));
    consultasEnCurso.set(zona.nombre, consulta);
  }
  return consultasEnCurso.get(zona.nombre);
};

module.exports = { obtenerClima, VALPARAISO };
