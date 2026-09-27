// Actividad del vecino que se muestra en el menú de cuenta. Por ahora son datos de prueba;
// el nombre y el rol ya vienen de la sesión (ver sesionService). En la Entrega 2 esta
// información se obtendrá desde la API.

export interface ActividadUsuario {
  reportesCreados: number;
  votosDados: number;
  apoyosRecibidos: number;
  notificacionesSinLeer: number;
}

export const ACTIVIDAD_PRUEBA: ActividadUsuario = {
  reportesCreados: 6,
  votosDados: 12,
  apoyosRecibidos: 128,
  notificacionesSinLeer: 3,
};
