import { AuthContext, useProvideAuth } from '../Hooks/useAuth';

export const AuthProvider = ({ children }) => {
  const auth = useProvideAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};
