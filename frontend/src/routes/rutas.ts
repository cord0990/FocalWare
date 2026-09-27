export const RUTAS = {
  login: '/login',
  registro: '/registro',
  recuperar: '/recuperar-contrasena',
  inicio: '/inicio',
  misReportes: '/mis-reportes',
  crearReporte: '/crear-reporte',
  perfil: '/perfil',
  ayuda: '/ayuda',
  detalleReporte: '/reporte/:id',
  editarReporte: '/reporte/:id/editar',
} as const;

// Ruta del detalle de un reporte en particular.
export const rutaReporte = (id: string) => `/reporte/${id}`;

// Pestaña del perfil que se abre directamente.
export const rutaPerfil = (seccion: 'notificaciones' | 'configuracion' | 'info') =>
  `/perfil?seccion=${seccion}`;

// Ruta para que el autor modifique su reporte.
export const rutaEditarReporte = (id: string) => `/reporte/${id}/editar`;
