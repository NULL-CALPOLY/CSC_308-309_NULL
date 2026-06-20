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
  avatar?: string | null;
  isAdmin?: boolean;
  isVerifiedStudent?: boolean;
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

  // ── Helper: fetch full user profile (name + avatar) ──
  const fetchUserProfile = async (
    id: string,
    token: string
  ): Promise<Partial<UserState>> => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/users/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) return {};
      const json = await res.json();
      return {
        name: json.data?.name || '',
        avatar: json.data?.avatar || null,
        isAdmin: !!json.data?.isAdmin,
        isVerifiedStudent: !!json.data?.isVerifiedStudent,
      };
    } catch {
      return {};
    }
  };

  // ── Helper: consume an access token handed back via the URL hash ──
  // Google OAuth redirects to `/#token=<jwt>&userId=<id>`. When present we
  // adopt that token (same JWT model as email/password login), fetch the
  // user profile, clean the hash, and land on /home.
  const consumeHashToken = async (): Promise<boolean> => {
    const hash = window.location.hash;
    if (!hash || !hash.includes('token=')) return false;

    const params = new URLSearchParams(hash.replace(/^#/, ''));
    const token = params.get('token');
    const userId = params.get('userId');
    if (!token || !userId) return false;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/users/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const profile: Partial<UserState> = res.ok
        ? await res
            .json()
            .then((json) => ({
              name: json.data?.name || '',
              avatar: json.data?.avatar || null,
            }))
            .catch(() => ({}))
        : {};
      setUser({ id: userId, token, ...profile });
    } catch {
      setUser({ id: userId, token });
    }

    // Strip the token from the URL so it isn't left in history/bookmarks.
    history.replaceState(null, '', window.location.pathname + window.location.search);
    navigate('/home');
    return true;
  };

  // Check session: first try a Google OAuth hash token, then fall back to the
  // refresh token (HttpOnly cookie).
  useEffect(() => {
    const checkSession = async () => {
      try {
        if (await consumeHashToken()) return;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Redirect the browser to start the Google OAuth flow ──
  const loginWithGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
  };

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
        if (res.status === 409)
          throw new Error('This email is already in use.');
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
    setUser((prev) => (prev ? { ...prev, avatar: imageUrl } : prev));
  };

  // ── Call this after a successful profile name update ──
  const updateProfileName = (name: string) => {
    setUser((prev) => (prev ? { ...prev, name } : prev));
  };

  return {
    user,
    login,
    loginWithGoogle,
    register,
    logout,
    updateProfileImage,
    updateProfileName,
    isAuthenticated: !!user,
    loading,
    error,
  };
};
