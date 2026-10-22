import { useCallback, useEffect, useState } from 'react';
import { useIonRouter, useIonToast } from '@ionic/react';
import { borrarSesion, guardarSesion, leerSesion, type Usuario } from '../services/sesionService';
import { alExpirarSesion, MENSAJE_SESION_EXPIRADA } from '../services/api';
import { RUTAS } from '../routes/rutas';
import { SesionContext } from './SesionContext';

// Al abrir la app se recupera la sesión guardada, para no pedir el login cada vez.
const SesionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(leerSesion);
  const [mostrarAviso] = useIonToast();
  const router = useIonRouter();

  const iniciarSesion = useCallback((nuevo: Usuario, token?: string) => {
    guardarSesion(nuevo, token);
    setUsuario(nuevo);
  }, []);

  const cerrarSesion = useCallback(() => {
    borrarSesion();
    setUsuario(null);
  }, []);

  // Cuando la API responde 401 con un token enviado (venció o no es válido), api.ts avisa acá.
  // Se cierra la sesión, se informa a la persona y se la lleva al login, sin importar
  // en qué pantalla estuviera.
  useEffect(() => {
    alExpirarSesion(() => {
      cerrarSesion();
      mostrarAviso({
        message: MENSAJE_SESION_EXPIRADA,
        duration: 4000,
        position: 'top',
        color: 'warning',
      });
      router.push(RUTAS.login, 'root', 'replace');
    });
    return () => alExpirarSesion(null);
  }, [cerrarSesion, mostrarAviso, router]);

  return (
    <SesionContext.Provider value={{ usuario, iniciarSesion, cerrarSesion }}>
      {children}
    </SesionContext.Provider>
  );
};

export default SesionProvider;
