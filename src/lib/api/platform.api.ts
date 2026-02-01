import apiClient from './client';
import type { PaginatedResponse } from '@/types/api';
import type { Tenant } from '@/types/entities';
import type { PlatformStats, TenantDetail } from '@/features/platform/types';
import type { CreateTenantRequest } from '@/types/requests';

export async function getPlatformStats(): Promise<PlatformStats> {
  const response = await apiClient.get<PlatformStats>('/platform/stats');
  return response.data;
}

export interface ListTenantsParams {
  status?: string;
  page?: number;
  limit?: number;
}

export async function listTenants(
  params?: ListTenantsParams,
): Promise<PaginatedResponse<Tenant>> {
  const response = await apiClient.get<PaginatedResponse<Tenant>>('/platform/tenants', { params });
  return response.data;
}

export async function getTenant(id: string): Promise<TenantDetail> {
  const response = await apiClient.get<TenantDetail>(`/platform/tenants/${id}`);
  return response.data;
}

export interface CreateTenantResponse {
  tenant: Tenant;
  admin: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    role: string;
  };
}

export async function createTenant(body: CreateTenantRequest): Promise<CreateTenantResponse> {
  const response = await apiClient.post<CreateTenantResponse>('/platform/tenants', body);
  return response.data;
}

export async function suspendTenant(id: string): Promise<Tenant> {
  const response = await apiClient.patch<Tenant>(`/platform/tenants/${id}/suspend`);
  return response.data;
}

export async function activateTenant(id: string): Promise<Tenant> {
  const response = await apiClient.patch<Tenant>(`/platform/tenants/${id}/activate`);
  return response.data;
}
