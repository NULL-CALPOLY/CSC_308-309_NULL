import { useProvideAuth, AuthContext } from './useAuth';

export const AuthProvider = ({ children }) => {
  const auth = useProvideAuth();

  return (
  <AuthContext.Provider 
      value={auth}>{children}
  </AuthContext.Provider>
  );
};
