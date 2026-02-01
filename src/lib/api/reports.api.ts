import apiClient from './client';
import type { ProfitLossReport, CollectorSummaryItem, LoanBookItem } from '@/features/reports/types';

export async function getProfitLoss(from: string, to: string): Promise<ProfitLossReport> {
  const response = await apiClient.get<ProfitLossReport>('/reports/profit-loss', {
    params: { from, to },
  });
  return response.data;
}

export async function getCollectorSummary(
  from: string,
  to: string,
): Promise<CollectorSummaryItem[]> {
  const response = await apiClient.get<CollectorSummaryItem[]>('/reports/collector-summary', {
    params: { from, to },
  });
  return response.data;
}

export async function getLoanBook(): Promise<LoanBookItem[]> {
  const response = await apiClient.get<LoanBookItem[]>('/reports/loan-book');
  return response.data;
}
