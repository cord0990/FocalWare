// Las fechas se guardan como AAAA-MM-DD y se muestran como DD-MM-AAAA.
export const formatearFecha = (fecha: string) => fecha.split('-').reverse().join('-');

// Días completos que pasaron desde una fecha AAAA-MM-DD hasta hoy.
export const diasDesde = (fecha: string) => {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const inicio = new Date(anio, mes - 1, dia);
  return Math.max(0, Math.floor((Date.now() - inicio.getTime()) / 86400000));
};

// Texto con el tiempo que pasó desde una fecha AAAA-MM-DD, por ejemplo "Hace 5 días".
export const antiguedad = (fecha: string) => {
  const dias = diasDesde(fecha);
  if (dias === 0) return 'Hoy';
  if (dias === 1) return 'Hace 1 día';
  if (dias < 30) return `Hace ${dias} días`;
  const meses = Math.floor(dias / 30);
  return meses === 1 ? 'Hace 1 mes' : `Hace ${meses} meses`;
};
