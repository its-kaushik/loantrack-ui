import axios from 'axios';
import apiClient from './client';
import type { AuthUser } from '@/stores/auth-store';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    id: string;
    name: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'COLLECTOR';
    tenant_id: string | null;
  };
}

interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface MeResponse {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'COLLECTOR';
  tenantId: string | null;
  tenantName: string | null;
}

export async function login(
  phone: string,
  password: string,
): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}> {
  // Login response uses snake_case — manually map
  const response = await axios.post<{ success: boolean; data: LoginResponse }>(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`,
    { phone, password },
  );

  const data = response.data.data;
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    user: {
      id: data.user.id,
      name: data.user.name,
      role: data.user.role,
      tenantId: data.user.tenant_id,
    },
  };
}

export async function refreshToken(
  token: string,
): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const response = await axios.post<{ success: boolean; data: RefreshResponse }>(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`,
    { refresh_token: token },
  );

  const data = response.data.data;
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await apiClient.patch('/auth/change-password', { currentPassword, newPassword });
}

export async function getMe(): Promise<MeResponse> {
  const response = await apiClient.get('/auth/me');
  return response.data;
}
