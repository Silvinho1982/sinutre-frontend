// Cliente HTTP do front para o sinutre-back.
import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';

export const API_URL = rawBaseUrl.replace(/\/$/, '');

export const api = axios.create({
  baseURL: API_URL,
});

const TOKEN_KEY = 'sinutre.token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

interface ApiErrorBody {
  error?: string;
  details?: Record<string, string>;
}

export function getApiErrorDetails(error: unknown): Record<string, string> {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.details ?? {};
  }
  return {};
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Não foi possível concluir a operação. Tente novamente.',
): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (!error.response) {
      return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
    }

    const body = error.response.data;
    if (body?.error) return body.error;

    if (error.response.status === 401) {
      return 'Sua sessão expirou. Faça login novamente.';
    }
  }

  return fallback;
}
