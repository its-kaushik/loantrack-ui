import apiClient from './client';
import type { PaginatedResponse } from '@/types/api';
import type { Transaction, TransactionDetail } from '@/types/entities';
import type { CreateTransactionRequest } from '@/types/requests';

export interface ListTransactionsParams {
  approvalStatus?: string;
  transactionType?: string;
  loanId?: string;
  collectedBy?: string;
  page?: number;
  limit?: number;
}

export async function createTransaction(
  body: CreateTransactionRequest,
): Promise<Transaction[]> {
  const response = await apiClient.post<Transaction[]>('/transactions', body);
  return response.data;
}

export async function bulkCollect(
  body: { collections: Array<{ loanId: string; amount: number; transactionDate: string; notes?: string }> },
  idempotencyKey: string,
): Promise<{ created: number; failed: number; results: Array<{ success: boolean; transaction?: Transaction; error?: string }> }> {
  const response = await apiClient.post('/transactions/bulk', body, {
    headers: { 'Idempotency-Key': idempotencyKey },
  });
  return response.data;
}

export async function listTransactions(
  params: ListTransactionsParams,
): Promise<PaginatedResponse<TransactionDetail>> {
  const response = await apiClient.get<PaginatedResponse<TransactionDetail>>(
    '/transactions',
    { params },
  );
  return response.data;
}

export async function listPendingTransactions(
  params?: { page?: number; limit?: number },
): Promise<PaginatedResponse<TransactionDetail>> {
  const response = await apiClient.get<PaginatedResponse<TransactionDetail>>(
    '/transactions/pending',
    { params },
  );
  return response.data;
}

export async function approveTransaction(id: string): Promise<TransactionDetail> {
  const response = await apiClient.patch<TransactionDetail>(
    `/transactions/${id}/approve`,
  );
  return response.data;
}

export async function rejectTransaction(
  id: string,
  reason: string,
): Promise<TransactionDetail> {
  const response = await apiClient.patch<TransactionDetail>(
    `/transactions/${id}/reject`,
    { rejectionReason: reason },
  );
  return response.data;
}
