// Achica una foto antes de guardarla, para que ocupe poco espacio (los celulares sacan
// fotos de varios MB). Devuelve la imagen como texto (data URL) en formato JPEG.
export const comprimirImagen = (archivo: File, ladoMaximo = 900, calidad = 0.72): Promise<string> =>
  new Promise((resolver, rechazar) => {
    const url = URL.createObjectURL(archivo);
    const imagen = new Image();

    imagen.onload = () => {
      const escala = Math.min(1, ladoMaximo / Math.max(imagen.width, imagen.height));
      const lienzo = document.createElement('canvas');
      lienzo.width = Math.round(imagen.width * escala);
      lienzo.height = Math.round(imagen.height * escala);
      lienzo.getContext('2d')?.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
      URL.revokeObjectURL(url);
      resolver(lienzo.toDataURL('image/jpeg', calidad));
    };
    imagen.onerror = () => {
      URL.revokeObjectURL(url);
      rechazar(new Error('No se pudo leer la imagen.'));
    };

    imagen.src = url;
  });
