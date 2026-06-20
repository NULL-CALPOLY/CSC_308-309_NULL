import { createContext, useContext, useState, useEffect } from 'react';

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [showSignIn, setShowSignIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [signInError, setSignInError] = useState('');

  const openSignIn = (message = '') => {
    setSignInError(typeof message === 'string' ? message : '');
    setShowRegister(false);
    setShowSignIn(true);
  };
  const openRegister = () => {
    setSignInError('');
    setShowSignIn(false);
    setShowRegister(true);
  };
  const closeAll = () => {
    setSignInError('');
    setShowSignIn(false);
    setShowRegister(false);
  };

  // Surface OAuth failures redirected back as ?authError=… by opening the
  // sign-in modal with the message, then cleaning the URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get('authError');
    if (authError) {
      openSignIn(authError);
      params.delete('authError');
      const qs = params.toString();
      const newUrl =
        window.location.pathname + (qs ? `?${qs}` : '') + window.location.hash;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  return (
    <ModalContext.Provider
      value={{
        showSignIn,
        showRegister,
        signInError,
        openSignIn,
        openRegister,
        closeAll,
      }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  return useContext(ModalContext);
}
