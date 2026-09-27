import { useState } from 'react';
import { leerAnchoGuardado } from '../hooks/useAnchoRedimensionable';
import { MenuContext } from './MenuContext';

export const CLAVE_ANCHO_MENU = 'focalware-ancho-menu';

const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [colapsado, setColapsado] = useState(false);
  const [ancho, setAncho] = useState<number | null>(() => leerAnchoGuardado(CLAVE_ANCHO_MENU));
  const alternar = () => setColapsado((actual) => !actual);

  return (
    <MenuContext.Provider value={{ colapsado, alternar, ancho, setAncho }}>
      {children}
    </MenuContext.Provider>
  );
};

export default MenuProvider;
