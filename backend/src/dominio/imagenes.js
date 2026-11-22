// Detección del tipo real de una imagen por sus primeros bytes (magic bytes).
// Nunca se usa el nombre ni el Content-Type que envía el cliente.
const EXTENSIONES_IMAGEN = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
]);

const errorInvalido = () => {
  const error = new Error('Solo se permiten imágenes JPG, PNG o WEBP');
  error.estado = 400;
  return error;
};

// file-type es un módulo ESM, así que se carga con import() desde CommonJS.
const detectarExtension = async (buffer) => {
  const { fileTypeFromBuffer } = await import('file-type');
  const tipo = await fileTypeFromBuffer(buffer);
  const extension = tipo ? EXTENSIONES_IMAGEN.get(tipo.mime) : undefined;

  if (!extension) {
    throw errorInvalido();
  }

  return extension;
};

module.exports = { detectarExtension };
