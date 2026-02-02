import { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

// Hook to access auth context in components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Hook that contains all authentication logic
export const useProvideAuth = () => {
  const [user, setUser] = useState<{ id: string; token: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Check session using refresh token (HttpOnly cookie)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('http://localhost:3000/users/refresh-token', {
          method: 'POST',
          credentials: 'include', // send cookies
        });

        if (!res.ok) {
          setUser(null);
        } else {
          const data = await res.json();
          setUser({ id: data.userId, token: data.userToken });
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch('http://localhost:3000/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include', // cookies
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Login failed');
    }

    const data = await res.json();
    setUser({ id: data.userId, token: data.accessToken });
    return { id: data.userId, token: data.accessToken };
  };

  const register = async (email: string, password: string) => {
    const res = await fetch('http://localhost:3000/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Registration failed');
    }

    return await res.json();
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:3000/users/logout', {
        method: 'POST',
        credentials: 'include', // clear HttpOnly cookie
      });
    } catch (err) {
      console.error('Logout failed', err);
    }

    // Clear all authentication data
    setUser(null);
    localStorage.removeItem('userToken');
    localStorage.removeItem('userId');
    sessionStorage.clear(); // Clear any session data
  };

  return {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    loading,
  };
};
