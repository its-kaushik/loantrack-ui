import apiClient from './client';
import type { PaginatedResponse } from '@/types/api';
import type { Loan, MonthlyLoanDetail, DailyLoanDetail, Transaction } from '@/types/entities';
import type { CreateLoanRequest, MigrateLoanRequest } from '@/types/requests';
import type { ListLoansParams, MonthlyPaymentStatus, DailyPaymentStatus } from '@/features/loans/types';

export async function listLoans(
  params: ListLoansParams,
): Promise<PaginatedResponse<Loan>> {
  const response = await apiClient.get<PaginatedResponse<Loan>>('/loans', { params });
  return response.data;
}

export async function getLoan(id: string): Promise<MonthlyLoanDetail | DailyLoanDetail> {
  const response = await apiClient.get<MonthlyLoanDetail | DailyLoanDetail>(`/loans/${id}`);
  return response.data;
}

export async function createLoan(
  body: CreateLoanRequest,
): Promise<MonthlyLoanDetail | DailyLoanDetail> {
  const response = await apiClient.post<MonthlyLoanDetail | DailyLoanDetail>('/loans', body);
  return response.data;
}

export async function getLoanTransactions(
  id: string,
  params?: { page?: number; limit?: number },
): Promise<PaginatedResponse<Transaction>> {
  const response = await apiClient.get<PaginatedResponse<Transaction>>(
    `/loans/${id}/transactions`,
    { params },
  );
  return response.data;
}

export async function getLoanPaymentStatus(
  id: string,
): Promise<MonthlyPaymentStatus | DailyPaymentStatus> {
  const response = await apiClient.get<MonthlyPaymentStatus | DailyPaymentStatus>(
    `/loans/${id}/payment-status`,
  );
  return response.data;
}

export async function closeLoan(id: string): Promise<MonthlyLoanDetail | DailyLoanDetail> {
  const response = await apiClient.patch<MonthlyLoanDetail | DailyLoanDetail>(
    `/loans/${id}/close`,
  );
  return response.data;
}

export async function defaultLoan(id: string): Promise<MonthlyLoanDetail | DailyLoanDetail> {
  const response = await apiClient.patch<MonthlyLoanDetail | DailyLoanDetail>(
    `/loans/${id}/default`,
  );
  return response.data;
}

export async function writeOffLoan(id: string): Promise<MonthlyLoanDetail | DailyLoanDetail> {
  const response = await apiClient.patch<MonthlyLoanDetail | DailyLoanDetail>(
    `/loans/${id}/write-off`,
  );
  return response.data;
}

export async function migrateLoan(
  body: MigrateLoanRequest,
): Promise<MonthlyLoanDetail | DailyLoanDetail> {
  const response = await apiClient.post<MonthlyLoanDetail | DailyLoanDetail>(
    '/loans/migrate',
    body,
  );
  return response.data;
}

export async function cancelLoan(
  id: string,
  reason: string,
): Promise<MonthlyLoanDetail | DailyLoanDetail> {
  const response = await apiClient.patch<MonthlyLoanDetail | DailyLoanDetail>(
    `/loans/${id}/cancel`,
    { cancellationReason: reason },
  );
  return response.data;
}
