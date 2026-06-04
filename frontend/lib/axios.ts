import axios from 'axios';
import Cookies from 'js-cookie';
import { AUTH_REMEMBER_COOKIE, AUTH_ROLE_COOKIE, AUTH_TOKEN_COOKIE } from './auth-constants';

const browserHost = typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1';
const defaultApiBaseUrl = `http://${browserHost}:8000/api`;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? defaultApiBaseUrl;
export const API_ROOT_URL = API_BASE_URL.replace(/\/api\/?$/, '');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  withXSRFToken: false,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export const csrfClient = axios.create({
  baseURL: API_ROOT_URL,
  withCredentials: false,
  withXSRFToken: false,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    Accept: 'application/json',
  },
});

function clearBrowserAuthStorage() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.clear();
  } catch {
    // Ignore restricted storage contexts.
  }

  try {
    window.sessionStorage.clear();
  } catch {
    // Ignore restricted storage contexts.
  }
}

function removeAuthCookie(cookieName: string) {
  Cookies.remove(cookieName);
  Cookies.remove(cookieName, { path: '/' });
}

apiClient.interceptors.request.use((config) => {
  const token = Cookies.get(AUTH_TOKEN_COOKIE);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    if (typeof config.headers.delete === 'function') {
      config.headers.delete('Content-Type');
    } else {
      delete config.headers['Content-Type'];
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      [AUTH_ROLE_COOKIE, AUTH_TOKEN_COOKIE, AUTH_REMEMBER_COOKIE].forEach(removeAuthCookie);
      clearBrowserAuthStorage();
    }

    return Promise.reject(error);
  }
);

export default apiClient;
