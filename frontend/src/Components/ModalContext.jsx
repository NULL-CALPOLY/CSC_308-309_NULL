import { createContext, useContext, useState } from 'react';

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [showSignIn, setShowSignIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const openSignIn = () => {
    setShowRegister(false);
    setShowSignIn(true);
  };
  const openRegister = () => {
    setShowSignIn(false);
    setShowRegister(true);
  };
  const closeAll = () => {
    setShowSignIn(false);
    setShowRegister(false);
  };

  return (
    <ModalContext.Provider
      value={{ showSignIn, showRegister, openSignIn, openRegister, closeAll }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  return useContext(ModalContext);
}
