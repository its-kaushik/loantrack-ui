import apiClient from './client';
import type { PaginatedResponse } from '@/types/api';
import type { FundEntry, FundSummary } from '@/types/entities';
import type { CreateFundEntryRequest } from '@/types/requests';

export interface ListFundEntriesParams {
  entryType?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export async function listFundEntries(
  params?: ListFundEntriesParams,
): Promise<PaginatedResponse<FundEntry>> {
  const response = await apiClient.get<PaginatedResponse<FundEntry>>('/fund/entries', { params });
  return response.data;
}

export async function createFundEntry(body: CreateFundEntryRequest): Promise<FundEntry> {
  const response = await apiClient.post<FundEntry>('/fund/entries', body);
  return response.data;
}

export async function getFundSummary(): Promise<FundSummary> {
  const response = await apiClient.get<FundSummary>('/fund/summary');
  return response.data;
}
