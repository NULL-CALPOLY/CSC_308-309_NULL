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
  emailNotifications?: boolean;
}

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// ── localStorage session persistence ──
// Access tokens expire in 15 min on the server; we store them for 14 min so
// we always have a chance to refresh before an API call fails.
const SESSION_KEY = 'findr_session';
const TOKEN_EXPIRY_MS = 14 * 60 * 1000;

function saveSession(id: string, token: string) {
  try {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ id, token, expiresAt: Date.now() + TOKEN_EXPIRY_MS })
    );
  } catch {}
}

function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('userToken');
    localStorage.removeItem('userId');
    sessionStorage.clear();
  } catch {}
}

function loadSession(): { id: string; token: string } | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.token || !parsed?.id) return null;
    if (parsed.expiresAt && parsed.expiresAt <= Date.now()) return null;
    return { id: parsed.id, token: parsed.token };
  } catch {
    return null;
  }
}

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
        emailNotifications: json.data?.emailNotifications !== false,
      };
    } catch {
      return {};
    }
  };

  // ── Helper: consume an access token handed back via the URL hash ──
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
      saveSession(userId, token);
      setUser({ id: userId, token, ...profile });
    } catch {
      setUser({ id: userId, token });
    }

    history.replaceState(null, '', window.location.pathname + window.location.search);
    navigate('/home');
    return true;
  };

  // ── Silently try cookie-based refresh; update localStorage if it succeeds ──
  const tryRefreshInBackground = () => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/users/refresh-token`, {
      method: 'POST',
      credentials: 'include',
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.accessToken && data?.userId) {
          saveSession(data.userId, data.accessToken);
          setUser((prev) =>
            prev ? { ...prev, id: data.userId, token: data.accessToken } : prev
          );
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        if (await consumeHashToken()) return;

        // 1. Try localStorage first — instant restoration, no network needed.
        const stored = loadSession();
        if (stored) {
          const profile = await fetchUserProfile(stored.id, stored.token);
          setUser({ id: stored.id, token: stored.token, ...profile });
          setLoading(false);
          // Kick off a background refresh to extend the cookie session.
          tryRefreshInBackground();
          return;
        }

        // 2. No valid localStorage entry — fall back to cookie-based refresh.
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/users/refresh-token`,
          { method: 'POST', credentials: 'include' }
        );

        if (!res.ok) {
          setUser(null);
        } else {
          const data = await res.json();
          const profile = await fetchUserProfile(data.userId, data.accessToken);
          saveSession(data.userId, data.accessToken);
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
      const error: any = new Error(err.message || 'Login failed');
      if (err.requiresVerification) {
        error.requiresVerification = true;
        error.email = err.email || email;
      }
      throw error;
    }

    const data = await res.json();
    const profile = await fetchUserProfile(data.userId, data.accessToken);
    const newUser = { id: data.userId, token: data.accessToken, ...profile };
    saveSession(data.userId, data.accessToken);
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

      // Email verification required — do NOT log the user in yet.
      if (data.requiresVerification) {
        return { requiresVerification: true, email: data.email };
      }

      const id = data.userId || data.user?._id;
      const token = data.token || data.accessToken;
      const profile = await fetchUserProfile(id, token);
      saveSession(id, token);
      setUser({ id, token, ...profile });
      return data;
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async (email: string) => {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/users/resend-verification`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to resend email');
    }
    return res.json();
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
    clearSession();
    setUser(null);
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
    resendVerificationEmail,
    logout,
    updateProfileImage,
    updateProfileName,
    isAuthenticated: !!user,
    loading,
    error,
  };
};
