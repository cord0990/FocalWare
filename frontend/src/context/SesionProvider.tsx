import { useState } from 'react';
import { borrarSesion, guardarSesion, leerSesion, type Usuario } from '../services/sesionService';
import { SesionContext } from './SesionContext';

// Al abrir la app se recupera la sesión guardada, para no pedir el login cada vez.
const SesionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(leerSesion);

  const iniciarSesion = (nuevo: Usuario) => {
    guardarSesion(nuevo);
    setUsuario(nuevo);
  };

  const cerrarSesion = () => {
    borrarSesion();
    setUsuario(null);
  };

  return (
    <SesionContext.Provider value={{ usuario, iniciarSesion, cerrarSesion }}>
      {children}
    </SesionContext.Provider>
  );
};

export default SesionProvider;
