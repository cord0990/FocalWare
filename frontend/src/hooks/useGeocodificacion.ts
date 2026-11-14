import { useCallback, useRef, useState } from 'react';
import {
  buscarDirecciones,
  consultarPunto,
  type SugerenciaDireccion,
} from '../services/geocodificacionService';
import type { Ubicacion } from '../components/reportes/SelectorUbicacion';

const DEBOUNCE_MS = 700;

// funcion: centraliza el estado y la logica de geocodificacion (sector, ubicacion, sugerencias, debounce, abort).
export function useGeocodificacion(
  initialSector = '',
  initialUbicacion: Ubicacion | null = null,
  onError?: (mensaje: string) => void,
) {
  const [sector, setSector] = useState(initialSector);
  const [ubicacion, setUbicacion] = useState<Ubicacion | null>(initialUbicacion);
  const [enfocar, setEnfocar] = useState<Ubicacion | null>(initialUbicacion);
  const [sectorEditado, setSectorEditado] = useState(false);
  const [sugerencias, setSugerencias] = useState<SugerenciaDireccion[]>([]);
  const [buscandoSugerencias, setBuscandoSugerencias] = useState(false);
  const [validandoUbicacion, setValidandoUbicacion] = useState(false);
  const [errorUbicacion, setErrorUbicacion] = useState('');

  const abortRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Última ubicación aceptada. Si el usuario arrastra el pin fuera de Chile, se
  // vuelve a esta y no a la posición inválida que se mostró mientras validaba.
  const ubicacionValidaRef = useRef<Ubicacion | null>(initialUbicacion);

  // Setter para cargar una ubicación ya conocida (por ejemplo, al editar un
  // reporte existente). No dispara validación porque viene de la base.
  const establecerUbicacion = useCallback((punto: Ubicacion | null) => {
    abortRef.current?.abort();
    setValidandoUbicacion(false);
    setErrorUbicacion('');
    ubicacionValidaRef.current = punto;
    setUbicacion(punto);
  }, []);

  // funcion: actualiza ubicacion/enfoque, valida el país y autocompleta el sector.
  const cambiarUbicacion = useCallback(
    async (punto: Ubicacion) => {
      abortRef.current?.abort();
      const controlador = new AbortController();
      abortRef.current = controlador;

      const anterior = ubicacionValidaRef.current;
      setUbicacion(punto);
      setEnfocar(punto);
      setValidandoUbicacion(true);
      setErrorUbicacion('');

      const resultado = await consultarPunto(punto.latitud, punto.longitud, controlador.signal);

      if (controlador.signal.aborted) return false;

      setValidandoUbicacion(false);

      if (resultado.estado === 'otro') {
        setUbicacion(anterior);
        setEnfocar(anterior);
        const mensaje = 'La ubicación debe estar dentro de Chile.';
        setErrorUbicacion(mensaje);
        onError?.(mensaje);
        return false;
      }

      // Chile o desconocido (sin conexión): se acepta el punto. Si no se pudo
      // verificar el país, se permite seguir para no romper el modo offline.
      ubicacionValidaRef.current = punto;
      if (resultado.direccion) setSector(resultado.direccion);
      return true;
    },
    [onError],
  );

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
  // La búsqueda ya está restringida a Chile con countrycodes=cl.
  const seleccionarSugerencia = useCallback((sugerencia: SugerenciaDireccion) => {
    abortRef.current?.abort();
    setValidandoUbicacion(false);
    setSector(sugerencia.texto);
    const punto = { latitud: sugerencia.latitud, longitud: sugerencia.longitud };
    ubicacionValidaRef.current = punto;
    setUbicacion(punto);
    setEnfocar(punto);
    setSugerencias([]);
    setSectorEditado(false);
    setErrorUbicacion('');
  }, []);

  // funcion: resetea el estado de geocodificacion y cancela temporizadores(abort).
  const limpiar = useCallback(() => {
    setSector('');
    setUbicacion(null);
    setEnfocar(null);
    ubicacionValidaRef.current = null;
    setSectorEditado(false);
    setSugerencias([]);
    setValidandoUbicacion(false);
    setErrorUbicacion('');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    abortRef.current?.abort();
  }, []);

  return {
    sector,
    setSector,
    ubicacion,
    setUbicacion: establecerUbicacion,
    enfocar,
    setEnfocar,
    sectorEditado,
    sugerencias,
    buscandoSugerencias,
    validandoUbicacion,
    errorUbicacion,
    cambiarUbicacion,
    onSectorChange,
    seleccionarSugerencia,
    limpiar,
  };
}
