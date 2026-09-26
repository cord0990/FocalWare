// Las fechas se guardan como AAAA-MM-DD y se muestran como DD-MM-AAAA.
export const formatearFecha = (fecha: string) => fecha.split('-').reverse().join('-');
