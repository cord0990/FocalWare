import { useEffect, useState } from 'react';
import { useIonToast } from '@ionic/react';
import { borrarSesion, guardarSesion, leerSesion, type Usuario } from '../services/sesionService';
import { alExpirarSesion, MENSAJE_SESION_EXPIRADA } from '../services/api';
import { SesionContext } from './SesionContext';

// Al abrir la app se recupera la sesión guardada, para no pedir el login cada vez.
const SesionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(leerSesion);
  const [mostrarAviso] = useIonToast();

  const iniciarSesion = (nuevo: Usuario, token?: string) => {
    guardarSesion(nuevo, token);
    setUsuario(nuevo);
  };

  const cerrarSesion = () => {
    borrarSesion();
    setUsuario(null);
  };

  // Cuando la API responde 401 con un token enviado (venció o no es válido), api.ts avisa acá.
  // Se cierra la sesión y se informa a la persona. Las pantallas que exigen sesión
  // la mandan al login porque ya no hay usuario.
  useEffect(() => {
    alExpirarSesion(() => {
      borrarSesion();
      setUsuario(null);
      mostrarAviso({
        message: MENSAJE_SESION_EXPIRADA,
        duration: 3500,
        position: 'top',
        color: 'warning',
      });
    });
    return () => alExpirarSesion(null);
  }, [mostrarAviso]);

  return (
    <SesionContext.Provider value={{ usuario, iniciarSesion, cerrarSesion }}>
      {children}
    </SesionContext.Provider>
  );
};

export default SesionProvider;
