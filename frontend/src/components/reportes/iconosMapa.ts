import L from 'leaflet';
import { NIVELES_RIESGO } from '../../utils/riesgo';

// Marcador con forma de pin del color indicado.
export const crearIconoPin = (color: string) =>
  L.divIcon({
    className: 'marcador-reporte',
    html: `<svg viewBox="0 0 24 32" width="30" height="40"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="${color}" stroke="#fff" stroke-width="1.5"/><circle cx="12" cy="12" r="4.5" fill="#fff"/></svg>`,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -36],
  });

// Un pin por cada nivel de riesgo.
export const ICONOS_RIESGO = Object.fromEntries(
  NIVELES_RIESGO.map((nivel) => [nivel.nivel, crearIconoPin(nivel.color)]),
);
