import { z } from 'zod/v4';

export const createTenantSchema = z.object({
  name: z.string().min(1, 'Business name is required').max(200),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(50)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens'),
  ownerName: z.string().min(1, 'Owner name is required').max(200),
  ownerPhone: z.string().min(10, 'Phone must be at least 10 digits').max(15),
  ownerEmail: z.string().email('Invalid email').max(255).optional().or(z.literal('')),
  address: z.string().max(2000).optional(),
  adminName: z.string().min(1, 'Admin name is required').max(100),
  adminPhone: z.string().min(10, 'Phone must be at least 10 digits').max(15),
  adminPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export type CreateTenantFormValues = z.infer<typeof createTenantSchema>;
