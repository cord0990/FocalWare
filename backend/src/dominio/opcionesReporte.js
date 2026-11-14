// Valores cerrados de reportes y revisiones.
// Se usan tanto para validar lo que llega por la API como para comparar estados en los servicios,
// sin repetir textos que pueden diferir por una tilde o una mayúscula.

const ESTADOS = Object.freeze({
  PENDIENTE: 'Pendiente',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
  EN_ATENCION: 'En atención',
  CONTROLADO: 'Controlado',
});

const ESTADOS_REVISION = Object.freeze([
  ESTADOS.APROBADO,
  ESTADOS.RECHAZADO,
  ESTADOS.EN_ATENCION,
  ESTADOS.CONTROLADO,
]);

// Al crear una revisión no se puede saltar directo a Controlado:
// ese estado solo lo pone el flujo de control,
// que además exige fotos de evidencia.
const ESTADOS_INICIALES = Object.freeze([
  ESTADOS.APROBADO,
  ESTADOS.RECHAZADO,
  ESTADOS.EN_ATENCION,
]);

const ESTADOS_APROBADOS = Object.freeze([ESTADOS.APROBADO, ESTADOS.EN_ATENCION]);
const ESTADOS_CONTROLABLES = ESTADOS_APROBADOS;

const CATEGORIAS_REPORTE = Object.freeze([
  'Vegetación seca',
  'Neumáticos',
  'Microbasural',
  'Residuos voluminosos',
  'Escombros',
]);

const VOLUMENES_REPORTE = Object.freeze([
  'Pequeño (una bolsa)',
  'Mediano (un auto)',
  'Grande (una camioneta)',
  'Muy grande (un camión)',
]);

const DISTANCIAS = Object.freeze({
  MENOS_10: 'Menos de 10 m',
  ENTRE_10_50: 'Entre 10 y 50 m',
  ENTRE_50_100: 'Entre 50 y 100 m',
  MAS_100: 'Más de 100 m',
});

const DISTANCIAS_REPORTE = Object.freeze(Object.values(DISTANCIAS));

const esUnoDe = (valores, valor) =>
  typeof valor === 'string' && valores.includes(valor);

const esEstadoRevision = (valor) => esUnoDe(ESTADOS_REVISION, valor);
const esEstadoInicial = (valor) => esUnoDe(ESTADOS_INICIALES, valor);
const esEstadoControlable = (valor) => esUnoDe(ESTADOS_CONTROLABLES, valor);
const esCategoriaReporte = (valor) => esUnoDe(CATEGORIAS_REPORTE, valor);
const esVolumenReporte = (valor) => esUnoDe(VOLUMENES_REPORTE, valor);
const esDistanciaReporte = (valor) => esUnoDe(DISTANCIAS_REPORTE, valor);

module.exports = {
  ESTADOS,
  ESTADOS_REVISION,
  ESTADOS_INICIALES,
  ESTADOS_APROBADOS,
  ESTADOS_CONTROLABLES,
  CATEGORIAS_REPORTE,
  VOLUMENES_REPORTE,
  DISTANCIAS,
  DISTANCIAS_REPORTE,
  esEstadoRevision,
  esEstadoInicial,
  esEstadoControlable,
  esCategoriaReporte,
  esVolumenReporte,
  esDistanciaReporte,
};
