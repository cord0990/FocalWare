// Actividad del vecino que se muestra en el menú de cuenta ("Tu aporte").
// El nombre y el rol vienen de la sesión (ver sesionService); estas cifras, de la API.
import { pedir } from './api';

export interface ActividadUsuario {
  reportesCreados: number;
  votosDados: number;
  apoyosRecibidos: number;
}

export const obtenerMiActividad = () => pedir<ActividadUsuario>('/estadisticas/mi-actividad');
