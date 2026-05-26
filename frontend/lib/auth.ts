import axios from 'axios';
import Cookies from 'js-cookie';
import {
  AUTH_REMEMBER_COOKIE,
  AUTH_ROLE_COOKIE,
  getRoleDashboardPath,
  isUserRole,
  type UserRole,
} from './auth-constants';
import apiClient, { csrfClient } from './axios';

export type AuthUser = {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  whatsapp?: string | null;
  pekerjaan?: string | null;
  address?: string | null;
  profile_completed: boolean;
  profile_photo?: string | null;
  profile_photo_url?: string | null;
};

export type LoginCredentials = {
  email: string;
  password: string;
  remember?: boolean;
};

export type RegisterPayload = {
  full_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  whatsapp?: string;
};

type ApiUser = {
  id: number;
  full_name?: string | null;
  name?: string | null;
  email: string;
  role: unknown;
  whatsapp?: string | null;
  phone?: string | null;
  pekerjaan?: string | null;
  job?: string | null;
  address?: string | null;
  profile_completed?: boolean | null;
  profile_photo?: string | null;
  profile_photo_url?: string | null;
};

type AuthResponse = {
  user?: ApiUser;
  data?: {
    user?: ApiUser;
  };
  message?: string;
};

const SESSION_IDLE_MINUTES = Number(process.env.NEXT_PUBLIC_SESSION_IDLE_MINUTES ?? 120);
const REMEMBER_SESSION_DAYS = 30;

function idleMinutesToCookieDays(minutes: number) {
  return minutes / 60 / 24;
}

export class AuthError extends Error {
  errors?: Record<string, string[]>;

  constructor(message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'AuthError';
    this.errors = errors;
  }
}

function normalizeUser(user?: ApiUser): AuthUser {
  if (!user || !isUserRole(user.role)) {
    throw new AuthError('Role user tidak valid.');
  }

  return {
    id: user.id,
    full_name: user.full_name || user.name || '',
    email: user.email,
    role: user.role,
    whatsapp: user.whatsapp ?? user.phone ?? null,
    pekerjaan: user.pekerjaan ?? user.job ?? null,
    address: user.address ?? null,
    profile_completed: Boolean(user.profile_completed),
    profile_photo: user.profile_photo ?? null,
    profile_photo_url: user.profile_photo_url ?? null,
  };
}

function getAuthUser(response: AuthResponse) {
  return response.user ?? response.data?.user;
}

function persistSession(user: AuthUser, remember = false) {
  const options: Cookies.CookieAttributes = {
    sameSite: 'lax',
    expires: remember ? REMEMBER_SESSION_DAYS : idleMinutesToCookieDays(SESSION_IDLE_MINUTES),
  };

  if (remember) {
    options.expires = 30;
    Cookies.set(AUTH_REMEMBER_COOKIE, '1', {
      expires: 30,
      sameSite: 'lax',
    });
  } else {
    Cookies.remove(AUTH_REMEMBER_COOKIE);
  }

  Cookies.set(AUTH_ROLE_COOKIE, user.role, options);
}

function isRememberedSession() {
  return Cookies.get(AUTH_REMEMBER_COOKIE) === '1';
}

function clearSessionCookies() {
  Cookies.remove(AUTH_ROLE_COOKIE);
  Cookies.remove(AUTH_REMEMBER_COOKIE);
}

async function ensureCsrfCookie() {
  await csrfClient.get('/sanctum/csrf-cookie');
}

export function getRedirectPathForRole(role: UserRole) {
  return getRoleDashboardPath(role);
}

export function getAuthErrorMessage(error: unknown, fallback = 'Terjadi kesalahan. Silakan coba lagi.') {
  if (error instanceof AuthError) {
    return error.message;
  }

  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined;
    const firstError = data?.errors ? Object.values(data.errors).flat()[0] : undefined;

    return firstError ?? data?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export function isUnauthorizedError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<AuthResponse>('/login', credentials);
    const user = normalizeUser(getAuthUser(data));

    persistSession(user, Boolean(credentials.remember));

    return user;
  },

  async register(payload: RegisterPayload) {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<AuthResponse>('/register', {
      ...payload,
      name: payload.full_name,
      phone: payload.whatsapp,
      role: 'tenant',
    });
    const apiUser = getAuthUser(data);

    if (!apiUser) {
      return null;
    }

    const user = normalizeUser(apiUser);
    persistSession(user);

    return user;
  },

  async me() {
    const { data } = await apiClient.get<{ user?: ApiUser; data?: { user?: ApiUser } }>('/me');

    const user = normalizeUser(data.user ?? data.data?.user);
    persistSession(user, isRememberedSession());

    return user;
  },

  async touchSession() {
    const { data } = await apiClient.get<{ user?: ApiUser; data?: { user?: ApiUser } }>('/me');
    const user = normalizeUser(data.user ?? data.data?.user);
    persistSession(user, isRememberedSession());

    return user;
  },

  async logout() {
    try {
      await ensureCsrfCookie();
      await apiClient.post('/logout');
    } finally {
      clearSessionCookies();
    }
  },

  clearSession: clearSessionCookies,
};
