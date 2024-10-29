import React, { createContext, useState } from "react";

// Cria o contexto
export const AppContext = createContext();

// Componente provedor para envolver a aplicação
export const AppProvider = ({ children }) => {
  const [userUid, setUserUid] = useState(null);
  return (
    <AppContext.Provider value={{ userUid, setUserUid }}>
      {children}
    </AppContext.Provider>
  );
};
