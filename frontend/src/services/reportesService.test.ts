import { describe, expect, it } from 'vitest';
import {
  ESTADOS_REPORTE,
  ESTADOS_REVISION,
  construirFormularioReporte,
  esEstadoReporte,
  type DatosNuevoReporte,
} from './reportesService';

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

describe('formulario de creación de reportes', () => {
  const datos: DatosNuevoReporte = {
    nombre: 'Basura en la esquina',
    direccion: 'Calle 1',
    categoria: 'Microbasural',
    volumen: 'Mediano (un auto)',
    distanciaViviendas: 'Entre 10 y 50 m',
    descripcion: 'Bolsas acumuladas.',
    latitud: -33.04,
    longitud: -71.62,
    imagenes: [],
    // El formulario puede traerlos para la previsualización local, pero no
    // deben viajar al backend: el servidor es la autoridad.
    riesgo: 100,
    clima: { temperatura: 20, humedad: 50, viento: 10, condicion: 'Despejado' },
  };

  it('no envía el riesgo ni el clima al backend', async () => {
    const formulario = await construirFormularioReporte(datos);

    expect(formulario.get('riesgo')).toBeNull();
    expect(formulario.get('clima')).toBeNull();
  });

  it('sí envía los campos que el backend necesita', async () => {
    const formulario = await construirFormularioReporte(datos);

    expect(formulario.get('nombre')).toBe(datos.nombre);
    expect(formulario.get('categoria')).toBe(datos.categoria);
    expect(formulario.get('volumen')).toBe(datos.volumen);
    expect(formulario.get('distanciaViviendas')).toBe(datos.distanciaViviendas);
    expect(formulario.get('latitud')).toBe(String(datos.latitud));
    expect(formulario.get('longitud')).toBe(String(datos.longitud));
  });
});
