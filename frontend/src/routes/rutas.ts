// Rutas de la aplicación, según la arquitectura de navegación (EP 1.4).
export const RUTAS = {
  // Públicas: se pueden ver sin iniciar sesión.
  inicio: '/',
  mapa: '/mapa',
  detalleMapa: '/mapa/:id',
  login: '/login',
  registro: '/registro',
  recuperar: '/recuperar',
  recuperarCodigo: '/recuperar/codigo',
  recuperarNueva: '/recuperar/nueva',
  ayuda: '/ayuda',

  // Compartidas: requieren sesión de Vecino o Funcionario.
  reportar: '/reportar',
  misReportes: '/mis-reportes',
  detalleMiReporte: '/mis-reportes/:id',
  editarMiReporte: '/mis-reportes/:id/editar',
  editarEnLocal: '/mis-reportes/en-local/:id',
  perfil: '/mi-perfil',
  perfilConfiguracion: '/mi-perfil/configuracion',
  perfilTerminos: '/mi-perfil/terminos',

  // Solo Funcionario: todas cuelgan de /municipal.
  municipalReporte: '/municipal/reporte/:id',
  municipalEstadisticas: '/municipal/estadisticas',
} as const;

// Detalle de un reporte con las opciones de gestión del Funcionario.
export const rutaMunicipalReporte = (id: string) => `/municipal/reporte/${id}`;

// Detalle de un reporte abierto desde el mapa (público).
export const rutaDetalleMapa = (id: string) => `/mapa/${id}`;

// Detalle de un reporte propio, abierto desde Mis reportes.
export const rutaMiReporte = (id: string) => `/mis-reportes/${id}`;

// El autor modifica un reporte ya enviado.
export const rutaEditarReporte = (id: string) => `/mis-reportes/${id}/editar`;

// El autor modifica un reporte guardado sin conexión que aún no se envía (RF-13).
export const rutaEditarEnLocal = (id: string) => `/mis-reportes/en-local/${id}`;

// El mapa con un reporte seleccionado.
export const rutaMapaConReporte = (id: string) => `/mapa?reporte=${id}`;
