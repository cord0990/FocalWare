import L from 'leaflet';

// El plugin leaflet.heat busca a Leaflet en la variable global `L`, así que se expone
// antes de cargarlo. Este archivo debe importarse antes que 'leaflet.heat'.
(window as unknown as { L: typeof L }).L = L;
