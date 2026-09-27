export const CENTRO_VALPARAISO: [number, number] = [-33.045, -71.615];

// Estilos de mapa disponibles. "Simple" muestra menos detalles para que resalten los reportes.
export const ESTILOS_MAPA = {
  simple: {
    nombre: 'Mapa simple',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    atribucion: 'Tiles &copy; Esri · Esri, HERE, Garmin, &copy; OpenStreetMap',
  },
  detallado: {
    nombre: 'Mapa detallado',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    atribucion: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
};
