import type { Imc, LevelActivity, Profile, User } from './user';

export interface DashboardData {
  date: string;
  targetDietDaily: number | null;
  hasTarget: boolean;
  consumed: {
    calories: number;
    carbs: number;
    proteins: number;
    fats: number;
  };
  remainingCalories: number | null;
  consumedPercentage: number | null;
  exceeded: boolean;
  meals: {
    today: number;
    total: number;
  };
}

export interface MetricsDay {
  date: string;
  weekday: string;
  shortDate: string;
  isToday: boolean;
  calories: number;
}

export interface MetricsSummary {
  imc: Imc | null;
  profile: Profile;
  last7Days: {
    days: MetricsDay[];
    totalCalories: number;
    averageCalories: number;
    target: number | null;
    difference: number | null;
    percentageOfTarget: number | null;
    status: 'SEM_META' | 'ABAIXO' | 'DENTRO' | 'ACIMA';
    statusLabel: string;
  };
}

export interface ProfileFormValues {
  targetDietDaily: number;
  height: number;
  weight: number;
  levelActivity: LevelActivity;
}

export type { User, Profile };
