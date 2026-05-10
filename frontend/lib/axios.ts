import axios from 'axios';
import Cookies from 'js-cookie';
import { AUTH_ROLE_COOKIE, AUTH_TOKEN_COOKIE } from './auth-constants';

const browserHost = typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1';
const defaultApiBaseUrl = `http://${browserHost}:8000/api`;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? defaultApiBaseUrl;
export const API_ROOT_URL = API_BASE_URL.replace(/\/api\/?$/, '');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export const csrfClient = axios.create({
  baseURL: API_ROOT_URL,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = Cookies.get(AUTH_TOKEN_COOKIE);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove(AUTH_TOKEN_COOKIE);
      Cookies.remove(AUTH_ROLE_COOKIE);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
