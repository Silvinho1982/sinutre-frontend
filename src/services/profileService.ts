import { api } from '@/lib/api';
import type { ProfileResponse } from '@/types/user';
import type { ProfileFormValues } from '@/types/metrics';

export async function getProfile(): Promise<ProfileResponse> {
  const response = await api.get<ProfileResponse>('/profile');
  return response.data;
}

export async function saveProfile(
  values: ProfileFormValues,
): Promise<ProfileResponse> {
  const response = await api.put<ProfileResponse>('/profile', values);
  return response.data;
}
