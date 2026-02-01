import apiClient from './client';
import type { PaginatedResponse } from '@/types/api';
import type { Customer } from '@/types/entities';

interface ListCustomersParams {
  search?: string;
  phone?: string;
  isDefaulter?: boolean;
  page?: number;
  limit?: number;
}

export async function listCustomers(
  params?: ListCustomersParams,
): Promise<PaginatedResponse<Customer>> {
  const response = await apiClient.get<PaginatedResponse<Customer>>('/customers', { params });
  return response.data;
}

export async function getCustomer(id: string): Promise<Customer> {
  const response = await apiClient.get<Customer>(`/customers/${id}`);
  return response.data;
}
