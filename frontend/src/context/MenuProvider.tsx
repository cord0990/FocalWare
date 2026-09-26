import { useState } from 'react';
import { MenuContext } from './MenuContext';

const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [colapsado, setColapsado] = useState(false);
  const alternar = () => setColapsado((actual) => !actual);

  return <MenuContext.Provider value={{ colapsado, alternar }}>{children}</MenuContext.Provider>;
};

export default MenuProvider;
