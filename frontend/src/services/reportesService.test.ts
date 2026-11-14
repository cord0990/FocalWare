import { describe, expect, it } from 'vitest';
import { ESTADOS_REPORTE, ESTADOS_REVISION, esEstadoReporte } from './reportesService';

describe('estados de reporte', () => {
  it('incluye Pendiente como estado derivado y los estados guardados', () => {
    expect(ESTADOS_REPORTE).toContain('Pendiente');
    for (const estado of ESTADOS_REVISION) {
      expect(ESTADOS_REPORTE).toContain(estado);
    }
  });

  it('reconoce solo los estados del catálogo', () => {
    expect(esEstadoReporte('Pendiente')).toBe(true);
    expect(esEstadoReporte('En atención')).toBe(true);
    expect(esEstadoReporte('Controlado')).toBe(true);
    expect(esEstadoReporte('controlado')).toBe(false);
    expect(esEstadoReporte('Otro')).toBe(false);
    expect(esEstadoReporte(null)).toBe(false);
  });
});
