import apiClient from './client';
import type { PaginatedResponse } from '@/types/api';
import type { Expense } from '@/types/entities';
import type { CreateExpenseRequest } from '@/types/requests';

export interface ListExpensesParams {
  category?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export async function listExpenses(
  params?: ListExpensesParams,
): Promise<PaginatedResponse<Expense>> {
  const response = await apiClient.get<PaginatedResponse<Expense>>('/expenses', { params });
  return response.data;
}

export async function createExpense(body: CreateExpenseRequest): Promise<Expense> {
  const response = await apiClient.post<Expense>('/expenses', body);
  return response.data;
}

export async function updateExpense(
  id: string,
  body: Partial<CreateExpenseRequest>,
): Promise<Expense> {
  const response = await apiClient.put<Expense>(`/expenses/${id}`, body);
  return response.data;
}

export async function deleteExpense(id: string): Promise<void> {
  await apiClient.patch(`/expenses/${id}/delete`);
}
