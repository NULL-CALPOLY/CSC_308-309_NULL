import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export interface RegisterData {
  name: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  city: string;
  email: string;
  password: string;
  location: {
    latitude: number;
    longitude: number;
  };
  interests: string[];
}

interface UserState {
  id: string;
  token: string;
  name?: string;
  profileImage?: string | null;
}

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const useProvideAuth = () => {
  const [user, setUser] = useState<UserState | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ── Helper: fetch full user profile (name + profileImage) ──
  const fetchUserProfile = async (id: string, token: string): Promise<Partial<UserState>> => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return {};
      const json = await res.json();
      return {
        name: json.data?.name || '',
        profileImage: json.data?.profileImage || null,
      };
    } catch {
      return {};
    }
  };

  // Check session using refresh token (HttpOnly cookie)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/users/refresh-token`,
          { method: 'POST', credentials: 'include' }
        );

        if (!res.ok) {
          setUser(null);
        } else {
          const data = await res.json();
          const profile = await fetchUserProfile(data.userId, data.accessToken);
          setUser({ id: data.userId, token: data.accessToken, ...profile });
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
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/users/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Login failed');
    }

    const data = await res.json();
    const profile = await fetchUserProfile(data.userId, data.accessToken);
    const newUser = { id: data.userId, token: data.accessToken, ...profile };
    setUser(newUser);
    return newUser;
  };

  const register = async (userData: RegisterData) => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include',
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 409) throw new Error('This email is already in use.');
        throw new Error(err.message || 'Registration failed');
      }

      const data = await res.json();
      const id = data.userId || data.user?._id;
      const token = data.token || data.accessToken;
      const profile = await fetchUserProfile(id, token);
      setUser({ id, token, ...profile });
      return data;
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout failed', err);
    }
    setUser(null);
    localStorage.removeItem('userToken');
    localStorage.removeItem('userId');
    sessionStorage.clear();
    navigate('/');
  };

  // ── Call this after a successful profile image upload ──
  const updateProfileImage = (imageUrl: string | null) => {
    setUser((prev) => prev ? { ...prev, profileImage: imageUrl } : prev);
  };

  // ── Call this after a successful profile name update ──
  const updateProfileName = (name: string) => {
    setUser((prev) => prev ? { ...prev, name } : prev);
  };

  return {
    user,
    login,
    register,
    logout,
    updateProfileImage,
    updateProfileName,
    isAuthenticated: !!user,
    loading,
    error,
  };
};