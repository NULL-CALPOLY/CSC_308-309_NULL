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

// ── Session persistence ──
// The access token lives in memory only (React state) and is never written to
// localStorage, so an XSS payload has nothing durable to steal. Persistence
// comes from the HttpOnly `refreshToken` cookie, which JS cannot read: on page
// load we exchange it for a fresh access token via /users/refresh-token.
//
// Access tokens expire after 15 min on the server, so refresh on a shorter
// interval to keep long-lived tabs working.
const REFRESH_INTERVAL_MS = 13 * 60 * 1000;

// One-time cleanup for browsers that still hold a token from an earlier build
// that persisted sessions in localStorage.
function purgeLegacySession() {
  try {
    localStorage.removeItem('findr_session');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userId');
  } catch {}
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
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  // ── Helper: trade the HttpOnly refresh cookie for a fresh access token ──
  const refreshAccessToken = async (): Promise<{
    id: string;
    token: string;
  } | null> => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/users/refresh-token`,
        { method: 'POST', credentials: 'include' }
      );
      if (!res.ok) return null;
      const data = await res.json();
      if (!data?.accessToken || !data?.userId) return null;
      return { id: data.userId, token: data.accessToken };
    } catch {
      return null;
    }
  };

  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      // Google OAuth sends the browser back to /?auth=google. The refresh
      // cookie is already set by the callback, so there is no token in the URL
      // to consume — just clean the marker off and restore like any reload.
      const params = new URLSearchParams(window.location.search);
      const fromOAuth = params.get('auth') === 'google';
      if (fromOAuth) {
        params.delete('auth');
        const qs = params.toString();
        history.replaceState(
          null,
          '',
          window.location.pathname + (qs ? `?${qs}` : '')
        );
      }

      const session = await refreshAccessToken();
      if (cancelled) return;

      if (!session) {
        setUser(null);
        setLoading(false);
        return;
      }

      const profile = await fetchUserProfile(session.id, session.token);
      if (cancelled) return;

      setUser({ ...session, ...profile });
      setLoading(false);
      if (fromOAuth) navigate('/home');
    };

    purgeLegacySession();
    checkSession();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Keep the in-memory access token alive while the tab stays open ──
  // Without this the token would silently expire after 15 min. A failed
  // refresh means the 7-day refresh cookie is gone, so drop to logged out.
  const activeUserId = user?.id;
  useEffect(() => {
    if (!activeUserId) return;

    const timer = setInterval(async () => {
      const session = await refreshAccessToken();
      setUser((prev) => {
        if (!prev) return prev;
        return session ? { ...prev, ...session } : null;
      });
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeUserId]);

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
    // The refresh cookie is cleared server-side; drop the in-memory token and
    // any cached view state.
    purgeLegacySession();
    try {
      sessionStorage.clear();
    } catch {}
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
