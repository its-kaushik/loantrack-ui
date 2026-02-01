import apiClient from './client';
import type { TodaySummary, OverdueSummary, DefaultersSummary } from '@/features/dashboard/types';
import type { FundSummary } from '@/types/entities';

export async function getTodaySummary(): Promise<TodaySummary> {
  const response = await apiClient.get<TodaySummary>('/dashboard/today');
  return response.data;
}

export async function getOverdueSummary(): Promise<OverdueSummary> {
  const response = await apiClient.get<OverdueSummary>('/dashboard/overdue');
  return response.data;
}

export async function getDefaultersSummary(): Promise<DefaultersSummary> {
  const response = await apiClient.get<DefaultersSummary>('/dashboard/defaulters');
  return response.data;
}

export async function getFundSummary(): Promise<FundSummary> {
  const response = await apiClient.get<FundSummary>('/dashboard/fund-summary');
  return response.data;
}
