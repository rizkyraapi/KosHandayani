'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  authService,
  getAuthErrorMessage,
  getRedirectPathForRole,
  getStoredToken,
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();

    if (!token) {
      setUser(null);
      setIsLoading(false);
      return null;
    }

    try {
      setIsLoading(true);
      const currentUser = await authService.me();
      setUser(currentUser);
      return currentUser;
    } catch (refreshError) {
      authService.clearSession();
      setUser(null);
      setError(getAuthErrorMessage(refreshError, 'Sesi berakhir. Silakan login kembali.'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(refreshUser);
  }, [refreshUser]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        setError('');
        setIsLoading(true);
        const loggedInUser = await authService.login(credentials);
        setUser(loggedInUser);
        router.replace(getRedirectPathForRole(loggedInUser.role));
        return loggedInUser;
      } catch (loginError) {
        const message = getAuthErrorMessage(loginError, 'Login gagal. Periksa email dan password.');
        setError(message);
        throw loginError;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      try {
        setError('');
        setIsLoading(true);
        const registeredUser = await authService.register(payload);
        setUser(registeredUser);

        if (registeredUser) {
          router.replace(getRedirectPathForRole(registeredUser.role));
        } else {
          router.replace('/login?registered=1');
        }

        return registeredUser;
      } catch (registerError) {
        const message = getAuthErrorMessage(registerError, 'Register gagal. Periksa data yang diisi.');
        setError(message);
        throw registerError;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    setError('');
    setIsLoading(true);

    try {
      await authService.logout();
      setUser(null);
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } finally {
      setIsLoading(false);
    }
  }, [pathname, router]);

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
