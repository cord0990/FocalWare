import { createContext } from 'react';

interface MenuContextValor {
  colapsado: boolean;
  alternar: () => void;
  // Ancho elegido por el usuario al arrastrar el borde del menú (null = ancho por defecto).
  ancho: number | null;
  setAncho: (ancho: number | null) => void;
}

// Estado del menú lateral compartido entre todas las pantallas.
export const MenuContext = createContext<MenuContextValor>({
  colapsado: false,
  alternar: () => {},
  ancho: null,
  setAncho: () => {},
});
