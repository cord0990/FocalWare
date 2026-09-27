// Niveles de riesgo ordenados de mayor a menor. Cada nivel parte desde el porcentaje indicado.
export const NIVELES_RIESGO = [
  { nivel: 'critico', etiqueta: 'Crítico', desde: 80, color: '#7a0b16', texto: '#fff' },
  { nivel: 'alto', etiqueta: 'Alto', desde: 60, color: '#e0283a', texto: '#fff' },
  { nivel: 'medio', etiqueta: 'Medio', desde: 30, color: '#f2b705', texto: '#1f1f1f' },
  { nivel: 'bajo', etiqueta: 'Bajo', desde: 0, color: '#2e9e4f', texto: '#fff' },
] as const;

export type NivelRiesgo = (typeof NIVELES_RIESGO)[number];

export const obtenerNivelRiesgo = (porcentaje: number): NivelRiesgo =>
  NIVELES_RIESGO.find((nivel) => porcentaje >= nivel.desde) ??
  NIVELES_RIESGO[NIVELES_RIESGO.length - 1];

// Texto del rango de porcentajes de un nivel, por ejemplo "30-59%".
export const rangoNivel = (nivel: NivelRiesgo): string => {
  const indice = NIVELES_RIESGO.indexOf(nivel);
  const hasta = indice === 0 ? 100 : NIVELES_RIESGO[indice - 1].desde - 1;
  return `${nivel.desde}-${hasta}%`;
};
