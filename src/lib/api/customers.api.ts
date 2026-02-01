import apiClient from './client';
import type { PaginatedResponse } from '@/types/api';
import type { Customer, CustomerDetail, CustomerLoan } from '@/types/entities';
import type { CreateCustomerRequest, UpdateCustomerRequest } from '@/types/requests';

export interface ListCustomersParams {
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

export async function getCustomer(id: string): Promise<CustomerDetail> {
  const response = await apiClient.get<CustomerDetail>(`/customers/${id}`);
  return response.data;
}

export async function createCustomer(body: CreateCustomerRequest): Promise<Customer> {
  const response = await apiClient.post<Customer>('/customers', body);
  return response.data;
}

export async function updateCustomer(
  id: string,
  body: UpdateCustomerRequest,
): Promise<Customer> {
  const response = await apiClient.put<Customer>(`/customers/${id}`, body);
  return response.data;
}

export async function getCustomerLoans(id: string): Promise<CustomerLoan[]> {
  const response = await apiClient.get<CustomerLoan[]>(`/customers/${id}/loans`);
  return response.data;
}

export async function clearDefaulter(id: string): Promise<Customer> {
  const response = await apiClient.patch<Customer>(`/customers/${id}/clear-defaulter`);
  return response.data;
}
