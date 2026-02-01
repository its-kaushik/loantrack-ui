import { z } from 'zod/v4';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(15),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.literal('COLLECTOR'),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
