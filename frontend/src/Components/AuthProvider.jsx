import { AuthContext, useProvideAuth } from '../Hooks/UseAuth.ts';

export const AuthProvider = ({ children }) => {
  const auth = useProvideAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};
