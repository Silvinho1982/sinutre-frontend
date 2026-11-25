import { api } from '@/lib/api';
import type { AuthResponse, ProfileResponse } from '@/types/user';

export async function loginRequest(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', {
    email,
    password,
  });
  return response.data;
}

export async function registerRequest(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/register', {
    name,
    email,
    password,
  });
  return response.data;
}

export async function meRequest(): Promise<ProfileResponse> {
  const response = await api.get<ProfileResponse>('/auth/me');
  return response.data;
}

export async function providersRequest(): Promise<{
  github: boolean;
  credentials: boolean;
}> {
  const response = await api.get('/auth/providers');
  return response.data;
}

export async function logoutRequest(): Promise<void> {
  await api.post('/auth/logout');
}
