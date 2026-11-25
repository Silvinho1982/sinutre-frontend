import { api } from '@/lib/api';
import type { DashboardData, MetricsSummary } from '@/types/metrics';

export async function getDashboard(): Promise<DashboardData> {
  const response = await api.get<DashboardData>('/metrics/dashboard');
  return response.data;
}

export async function getMetrics(): Promise<MetricsSummary> {
  const response = await api.get<MetricsSummary>('/metrics/summary');
  return response.data;
}
