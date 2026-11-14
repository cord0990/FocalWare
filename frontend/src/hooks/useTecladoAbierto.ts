import { useEffect, useState } from 'react';

// Diferencia de alto (en px) desde la que se considera que el teclado está abierto.
const ALTO_MINIMO_TECLADO = 150;

// Indica si el teclado del celular está abierto. Al abrirse, el área visible
// (visualViewport) queda mucho más baja que la ventana; al cerrarse vuelven a medir lo mismo.
export const useTecladoAbierto = () => {
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const vista = window.visualViewport;
    if (!vista) return;

    const revisar = () => setAbierto(window.innerHeight - vista.height > ALTO_MINIMO_TECLADO);
    vista.addEventListener('resize', revisar);
    return () => vista.removeEventListener('resize', revisar);
  }, []);

  return abierto;
};
