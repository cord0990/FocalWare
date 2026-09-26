import { useState } from 'react';

// Guarda qué campos ya tocó el usuario, para mostrar el error solo después de
// que salga del campo o intente enviar el formulario.
export const useCamposTocados = () => {
  const [tocados, setTocados] = useState<Record<string, boolean>>({});

  const tocar = (...campos: string[]) =>
    setTocados((previos) => ({
      ...previos,
      ...Object.fromEntries(campos.map((campo) => [campo, true])),
    }));

  // Ionic muestra el errorText de IonInput cuando tiene estas dos clases.
  const claseCampo = (campo: string, error: string) =>
    tocados[campo] && error ? 'ion-invalid ion-touched' : '';

  const reiniciar = () => setTocados({});

  return { tocar, claseCampo, reiniciar };
};