import { useRef, useState } from 'react';

const PASO_TECLADO = 20;

export const leerAnchoGuardado = (clave: string): number | null => {
  try {
    const valor = Number(localStorage.getItem(clave));
    return valor > 0 ? valor : null;
  } catch {
    return null;
  }
};

const guardar = (clave: string, valor: number | null) => {
  try {
    if (valor) localStorage.setItem(clave, String(valor));
    else localStorage.removeItem(clave);
  } catch {
    // Si el navegador no permite guardar, el divisor funciona igual durante la visita.
  }
};

interface Opciones {
  clave: string;
  minimo: number;
  maximoProporcion: number;
  // Lado del contenedor donde está el panel que se redimensiona.
  lado?: 'izquierda' | 'derecha';
  // Permite compartir el ancho entre pantallas (por ejemplo, desde un contexto).
  estado?: [number | null, (ancho: number | null) => void];
}

// Permite cambiar el ancho de un panel arrastrando un divisor (o con las flechas del teclado).
// El ancho elegido se recuerda en el navegador. `null` significa "ancho por defecto".
export const useAnchoRedimensionable = ({
  clave,
  minimo,
  maximoProporcion,
  lado = 'derecha',
  estado,
}: Opciones) => {
  const contenedor = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLElement>(null);
  const estadoLocal = useState<number | null>(() => (estado ? null : leerAnchoGuardado(clave)));
  const [ancho, setAncho] = estado ?? estadoLocal;
  const [arrastrando, setArrastrando] = useState(false);

  const limitar = (valor: number) => {
    const total = contenedor.current?.clientWidth ?? window.innerWidth;
    return Math.round(Math.min(Math.max(valor, minimo), total * maximoProporcion));
  };

  const alPresionar = (evento: React.PointerEvent<HTMLElement>) => {
    if (!contenedor.current) return;
    evento.preventDefault();
    const borde = contenedor.current.getBoundingClientRect();
    let ultimo = ancho;

    setArrastrando(true);

    const mover = (e: PointerEvent) => {
      ultimo = limitar(lado === 'derecha' ? borde.right - e.clientX : e.clientX - borde.left);
      setAncho(ultimo);
    };
    const soltar = () => {
      window.removeEventListener('pointermove', mover);
      window.removeEventListener('pointerup', soltar);
      window.removeEventListener('pointercancel', soltar);
      setArrastrando(false);
      guardar(clave, ultimo);
    };

    // Se escucha en toda la ventana para que el arrastre no se corte si el puntero sale del divisor.
    window.addEventListener('pointermove', mover);
    window.addEventListener('pointerup', soltar);
    window.addEventListener('pointercancel', soltar);
  };

  const alTeclado = (evento: React.KeyboardEvent) => {
    // La flecha que "empuja" el divisor hacia el panel lo achica; la contraria lo agranda.
    const haciaElPanel = lado === 'derecha' ? 'ArrowRight' : 'ArrowLeft';
    const haciaAfuera = lado === 'derecha' ? 'ArrowLeft' : 'ArrowRight';
    const cambio =
      evento.key === haciaAfuera ? PASO_TECLADO : evento.key === haciaElPanel ? -PASO_TECLADO : 0;
    if (!cambio) return;
    evento.preventDefault();
    const actual = ancho ?? panel.current?.getBoundingClientRect().width ?? minimo;
    const nuevo = limitar(actual + cambio);
    setAncho(nuevo);
    guardar(clave, nuevo);
  };

  const restablecer = () => {
    setAncho(null);
    guardar(clave, null);
  };

  return { contenedor, panel, ancho, arrastrando, alPresionar, alTeclado, restablecer };
};
