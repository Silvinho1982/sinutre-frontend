export interface Imc {
  value: number;
  label: string;
  tone: 'low' | 'normal' | 'overweight' | 'obesity';
  description: string;
  min: number;
  max: number | null;
}

export const LEVEL_ACTIVITY_OPTIONS = [
  { value: 'SEDENTARIO', label: 'Sedentário' },
  { value: 'LEVEMENTE_ATIVO', label: 'Levemente ativo' },
  { value: 'MODERADAMENTE_ATIVO', label: 'Moderadamente ativo' },
  { value: 'MUITO_ATIVO', label: 'Muito ativo' },
  { value: 'EXTREMAMENTE_ATIVO', label: 'Extremamente ativo' },
] as const;

export type LevelActivity = (typeof LEVEL_ACTIVITY_OPTIONS)[number]['value'];

export interface User {
  id: number;
  name: string;
  email: string | null;
  githubLogin: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface Profile {
  targetDietDaily: number | null;
  height: number | null;
  weight: number | null;
  levelActivity: LevelActivity | null;
  levelActivityLabel: string | null;
  imc: Imc | null;
  hasProfile: boolean;
  updatedAt: string | null;
}

export interface ProfileResponse {
  user: User;
  profile: Profile;
}

export interface AuthResponse {
  token: string;
  user: User;
}
