import type { UserRole } from '@/types/enums';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  tenantId: string | null;
}

export interface LoginFormValues {
  phone: string;
  password: string;
}

export interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
