// Quita tildes y mayúsculas para que "valparaíso" y "Valparaiso" coincidan en las búsquedas.
export const normalizarTexto = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
