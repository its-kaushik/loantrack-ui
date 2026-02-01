import apiClient from './client';
import type { PaginatedResponse } from '@/types/api';
import type { Penalty, PenaltyCalculationResponse, Waiver } from '@/types/entities';

export async function imposePenalty(
  loanId: string,
  body?: { overrideAmount?: number; notes?: string },
): Promise<PenaltyCalculationResponse> {
  const response = await apiClient.post<PenaltyCalculationResponse>(
    `/loans/${loanId}/penalties`,
    body ?? {},
  );
  return response.data;
}

export async function getLoanPenalties(
  loanId: string,
  params?: { page?: number; limit?: number },
): Promise<PaginatedResponse<Penalty>> {
  const response = await apiClient.get<PaginatedResponse<Penalty>>(
    `/loans/${loanId}/penalties`,
    { params },
  );
  return response.data;
}

export async function waivePenalty(
  penaltyId: string,
  body: { waiveAmount: number; notes?: string },
): Promise<Penalty> {
  const response = await apiClient.patch<Penalty>(
    `/penalties/${penaltyId}/waive`,
    body,
  );
  return response.data;
}

export async function waiveInterest(
  loanId: string,
  body: { effectiveDate: string; waiveAmount: number; notes?: string },
): Promise<Waiver> {
  const response = await apiClient.post<Waiver>(
    `/loans/${loanId}/waive-interest`,
    body,
  );
  return response.data;
}

export async function getLoanWaivers(
  loanId: string,
  params?: { page?: number; limit?: number },
): Promise<PaginatedResponse<Waiver>> {
  const response = await apiClient.get<PaginatedResponse<Waiver>>(
    `/loans/${loanId}/waivers`,
    { params },
  );
  return response.data;
}
