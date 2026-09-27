// Por ahora el usuario es de prueba. En la Entrega 2 se obtendrá desde la sesión iniciada (JWT).

export interface ResumenUsuario {
  nombre: string;
  iniciales: string;
  rol: string;
  sector: string;
  reportesCreados: number;
  votosDados: number;
  apoyosRecibidos: number;
  notificacionesSinLeer: number;
}

export const USUARIO_PRUEBA: ResumenUsuario = {
  nombre: 'Valentina',
  iniciales: 'VR',
  rol: 'Vecina',
  sector: 'Cerro Cordillera',
  reportesCreados: 6,
  votosDados: 12,
  apoyosRecibidos: 128,
  notificacionesSinLeer: 3,
};
