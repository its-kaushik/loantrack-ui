import apiClient from './client';
import type { User } from '@/types/entities';
import type { CreateUserRequest } from '@/types/requests';

export async function listUsers(): Promise<User[]> {
  const response = await apiClient.get<User[]>('/users');
  return response.data;
}

export async function createUser(body: CreateUserRequest): Promise<User> {
  const response = await apiClient.post<User>('/users', body);
  return response.data;
}

export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  email?: string | null;
}

export async function updateUser(id: string, body: UpdateUserRequest): Promise<User> {
  const response = await apiClient.put<User>(`/users/${id}`, body);
  return response.data;
}

export async function deactivateUser(id: string): Promise<{ message: string }> {
  const response = await apiClient.patch<{ message: string }>(`/users/${id}/deactivate`);
  return response.data;
}

export async function resetPassword(
  id: string,
  newPassword: string,
): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>(`/users/${id}/reset-password`, {
    newPassword,
  });
  return response.data;
}
