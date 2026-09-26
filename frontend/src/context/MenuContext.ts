import { createContext } from 'react';

interface MenuContextValor {
  colapsado: boolean;
  alternar: () => void;
}

// Guarda si el menú lateral está colapsado, compartido entre todas las pantallas.
export const MenuContext = createContext<MenuContextValor>({
  colapsado: false,
  alternar: () => {},
});
