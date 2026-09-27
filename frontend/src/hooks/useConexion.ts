import { useEffect, useState } from 'react';

// Indica si el dispositivo tiene conexión a internet y se actualiza cuando cambia.
export const useConexion = () => {
  const [enLinea, setEnLinea] = useState(() => navigator.onLine);

  useEffect(() => {
    const conectar = () => setEnLinea(true);
    const desconectar = () => setEnLinea(false);
    window.addEventListener('online', conectar);
    window.addEventListener('offline', desconectar);
    return () => {
      window.removeEventListener('online', conectar);
      window.removeEventListener('offline', desconectar);
    };
  }, []);

  return enLinea;
};
