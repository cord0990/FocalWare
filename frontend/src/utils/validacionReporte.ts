// Reglas compartidas por las pantallas de crear y modificar un reporte.
export const MAXIMO_FOTOS = 5;
export const MINIMO_DESCRIPCION = 10;
export const MINIMO_TITULO = 5;
export const MAXIMO_TITULO = 80;

interface DatosFormulario {
  titulo: string;
  sector: string;
  ubicacion: unknown;
  categoria: string;
  volumen: string;
  distancia: string;
  imagenes: string[];
  descripcion: string;
}

const validarTitulo = (titulo: string) => {
  const largo = titulo.trim().length;
  if (largo === 0) return 'Escribe un título para el reporte.';
  return largo < MINIMO_TITULO ? `El título debe tener al menos ${MINIMO_TITULO} caracteres.` : '';
};

// Devuelve el mensaje de error de cada campo, o un texto vacío si está bien.
export const validarReporte = (datos: DatosFormulario) => ({
  titulo: validarTitulo(datos.titulo),
  sector: datos.sector.trim().length < 3 ? 'Escribe el sector o la dirección aproximada.' : '',
  ubicacion: !datos.ubicacion ? 'Marca en el mapa dónde está el problema.' : '',
  categoria: !datos.categoria ? 'Elige una categoría.' : '',
  volumen: !datos.volumen ? 'Elige el volumen estimado.' : '',
  distancia: !datos.distancia ? 'Elige la distancia a las viviendas.' : '',
  imagenes: datos.imagenes.length === 0 ? 'Agrega al menos una foto de portada.' : '',
  descripcion:
    datos.descripcion.trim().length < MINIMO_DESCRIPCION
      ? `Describe el problema (mínimo ${MINIMO_DESCRIPCION} caracteres).`
      : '',
});

export type ErroresReporte = ReturnType<typeof validarReporte>;
