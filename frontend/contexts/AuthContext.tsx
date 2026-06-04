'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  authService,
  getAuthErrorMessage,
  getRedirectPathForRole,
  isUnauthorizedError,
  type AuthUser,
  type LoginCredentials,
  type RegisterPayload,
} from '@/lib/auth';

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  error: string;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const SESSION_HEARTBEAT_INTERVAL_MS = 60_000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const lastHeartbeatAtRef = useRef(0);
  const heartbeatInFlightRef = useRef(false);
  const authVersionRef = useRef(0);

  const resetHeartbeat = useCallback(() => {
    heartbeatInFlightRef.current = false;
    lastHeartbeatAtRef.current = 0;
  }, []);

  const refreshUser = useCallback(async () => {
    const requestVersion = authVersionRef.current;

    try {
      setIsLoading(true);
      const currentUser = await authService.me();

      if (authVersionRef.current === requestVersion) {
        setUser(currentUser);
      }

      return currentUser;
    } catch (refreshError) {
      if (authVersionRef.current === requestVersion) {
        authService.clearSession();
        resetHeartbeat();
        setUser(null);

        if (!isUnauthorizedError(refreshError)) {
          setError(getAuthErrorMessage(refreshError, 'Sesi berakhir. Silakan login kembali.'));
        }
      }

      return null;
    } finally {
      if (authVersionRef.current === requestVersion) {
        setIsLoading(false);
      }
    }
  }, [resetHeartbeat]);

  useEffect(() => {
    Promise.resolve().then(refreshUser);
  }, [refreshUser]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const touchSession = () => {
      const now = Date.now();

      if (
        heartbeatInFlightRef.current ||
        now - lastHeartbeatAtRef.current < SESSION_HEARTBEAT_INTERVAL_MS
      ) {
        return;
      }

      lastHeartbeatAtRef.current = now;
      heartbeatInFlightRef.current = true;
      const requestVersion = authVersionRef.current;

      authService
        .touchSession()
        .then((currentUser) => {
          if (authVersionRef.current === requestVersion) {
            setUser(currentUser);
          }
        })
        .catch((heartbeatError) => {
          if (authVersionRef.current === requestVersion && isUnauthorizedError(heartbeatError)) {
            authService.clearSession();
            setUser(null);
          }
        })
        .finally(() => {
          heartbeatInFlightRef.current = false;
        });
    };

    const touchWhenVisible = () => {
      if (document.visibilityState === 'visible') {
        touchSession();
      }
    };

    const activityEvents: Array<keyof WindowEventMap> = [
      'click',
      'keydown',
      'mousemove',
      'scroll',
      'touchstart',
      'pointerdown',
    ];

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, touchSession, { passive: true });
    });
    document.addEventListener('visibilitychange', touchWhenVisible);

    return () => {
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, touchSession);
      });
      document.removeEventListener('visibilitychange', touchWhenVisible);
    };
  }, [user]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const requestVersion = authVersionRef.current + 1;
      authVersionRef.current = requestVersion;
      resetHeartbeat();

      try {
        setError('');
        setIsLoading(true);
        setUser(null);
        const loggedInUser = await authService.login(credentials);

        if (authVersionRef.current === requestVersion) {
          setUser(loggedInUser);
          router.replace(getRedirectPathForRole(loggedInUser.role));
        }

        return loggedInUser;
      } catch (loginError) {
        if (authVersionRef.current === requestVersion) {
          const message = getAuthErrorMessage(loginError, 'Login gagal. Periksa email dan password.');
          setError(message);
          setUser(null);
        }

        throw loginError;
      } finally {
        if (authVersionRef.current === requestVersion) {
          setIsLoading(false);
        }
      }
    },
    [resetHeartbeat, router]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const requestVersion = authVersionRef.current + 1;
      authVersionRef.current = requestVersion;
      resetHeartbeat();

      try {
        setError('');
        setIsLoading(true);
        setUser(null);
        const registeredUser = await authService.register(payload);

        if (authVersionRef.current === requestVersion) {
          setUser(registeredUser);

          if (registeredUser) {
            router.replace(getRedirectPathForRole(registeredUser.role));
          } else {
            router.replace('/login?registered=1');
          }
        }

        return registeredUser;
      } catch (registerError) {
        if (authVersionRef.current === requestVersion) {
          const message = getAuthErrorMessage(registerError, 'Register gagal. Periksa data yang diisi.');
          setError(message);
          setUser(null);
        }

        throw registerError;
      } finally {
        if (authVersionRef.current === requestVersion) {
          setIsLoading(false);
        }
      }
    },
    [resetHeartbeat, router]
  );

  const logout = useCallback(async () => {
    const requestVersion = authVersionRef.current + 1;
    authVersionRef.current = requestVersion;
    resetHeartbeat();

    setError('');
    setIsLoading(true);
    setUser(null);

    try {
      await authService.logout();
    } finally {
      if (authVersionRef.current === requestVersion) {
        setUser(null);
        router.replace('/login');
        setIsLoading(false);
      }
    }
  }, [resetHeartbeat, router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      error,
      login,
      register,
      logout,
      refreshUser,
      clearError: () => setError(''),
    }),
    [error, isLoading, login, logout, refreshUser, register, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider.');
  }

  return context;
}
