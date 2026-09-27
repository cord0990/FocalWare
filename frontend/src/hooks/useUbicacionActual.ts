import { useState } from 'react';
import type { Ubicacion } from '../components/reportes/SelectorUbicacion';

// Obtiene la ubicación del dispositivo con el GPS del navegador.
export const useUbicacionActual = () => {
  const [buscando, setBuscando] = useState(false);

  const obtener = (alEncontrar: (punto: Ubicacion) => void, alFallar: (mensaje: string) => void) => {
    if (!navigator.geolocation) {
      alFallar('Tu dispositivo no permite obtener la ubicación. Marca el punto en el mapa.');
      return;
    }
    setBuscando(true);
    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        setBuscando(false);
        alEncontrar({ latitud: posicion.coords.latitude, longitud: posicion.coords.longitude });
      },
      () => {
        setBuscando(false);
        alFallar('No pudimos obtener tu ubicación. Revisa los permisos o marca el punto en el mapa.');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return { buscando, obtener };
};
