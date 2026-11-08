import { useCallback, useRef, useState } from 'react';
import {
  buscarDirecciones,
  obtenerDireccionDesdePunto,
  type SugerenciaDireccion,
} from '../services/geocodificacionService';
import type { Ubicacion } from '../components/reportes/SelectorUbicacion';

const DEBOUNCE_MS = 700;

// funcion: centraliza el estado y la logica de geocodificacion (sector, ubicacion, sugerencias, debounce, abort).
export function useGeocodificacion(initialSector = '', initialUbicacion: Ubicacion | null = null) {
  const [sector, setSector] = useState(initialSector);
  const [ubicacion, setUbicacion] = useState<Ubicacion | null>(initialUbicacion);
  const [enfocar, setEnfocar] = useState<Ubicacion | null>(initialUbicacion);
  const [sectorEditado, setSectorEditado] = useState(false);
  const [sugerencias, setSugerencias] = useState<SugerenciaDireccion[]>([]);
  const [buscandoSugerencias, setBuscandoSugerencias] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // funcion: consulta la direccion del punto y actualiza el sector si hay resultado.
  const autocompletarDesdePunto = useCallback((punto: Ubicacion) => {
    abortRef.current?.abort();
    const controlador = new AbortController();
    abortRef.current = controlador;
    obtenerDireccionDesdePunto(punto.latitud, punto.longitud, controlador.signal).then((direccion) => {
      if (direccion) setSector(direccion);
    });
  }, []);

  // funcion: actualiza ubicacion/enfoque y dispara autocompletado del sector.
  const cambiarUbicacion = useCallback((punto: Ubicacion) => {
    setUbicacion(punto);
    setEnfocar(punto);
    autocompletarDesdePunto(punto);
  }, [autocompletarDesdePunto]);

  // funcion: actualiza el sector, marca edicion manual y busca sugerencias con debounce.
  const onSectorChange = useCallback((valor: string) => {
    setSector(valor);
    setSectorEditado(true);
    setSugerencias([]);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const texto = valor.trim();
    if (texto.length < 3) {
      setBuscandoSugerencias(false);
      return;
    }
    setBuscandoSugerencias(true);
    timeoutRef.current = setTimeout(() => {
      const controlador = new AbortController();
      abortRef.current = controlador;
      buscarDirecciones(texto, controlador.signal).then((resultado) => {
        setSugerencias(resultado);
        setBuscandoSugerencias(false);
      });
    }, DEBOUNCE_MS);
  }, []);

  // funcion: aplica una sugerencia al sector y mueve el pin a esa ubicacion.
  const seleccionarSugerencia = useCallback((sugerencia: SugerenciaDireccion) => {
    setSector(sugerencia.texto);
    const punto = { latitud: sugerencia.latitud, longitud: sugerencia.longitud };
    setUbicacion(punto);
    setEnfocar(punto);
    setSugerencias([]);
    setSectorEditado(false);
  }, []);

  // funcion: resetea el estado de geocodificacion y cancela temporizadores(abort).
  const limpiar = useCallback(() => {
    setSector('');
    setUbicacion(null);
    setEnfocar(null);
    setSectorEditado(false);
    setSugerencias([]);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    abortRef.current?.abort();
  }, []);

  return {
    sector,
    setSector,
    ubicacion,
    setUbicacion,
    enfocar,
    setEnfocar,
    sectorEditado,
    sugerencias,
    buscandoSugerencias,
    cambiarUbicacion,
    onSectorChange,
    seleccionarSugerencia,
    limpiar,
  };
}
