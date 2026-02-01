import { z } from 'zod/v4';

export const createCustomerSchema = z.object({
  fullName: z.string().min(1, 'Name is required').max(200),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(15),
  alternatePhone: z.string().min(10).max(15).optional().or(z.literal('')),
  address: z.string().max(1000).optional().or(z.literal('')),
  aadhaarNumber: z
    .string()
    .regex(/^\d{12}$/, 'Aadhaar must be 12 digits')
    .optional()
    .or(z.literal('')),
  panNumber: z
    .string()
    .regex(/^[A-Z]{5}\d{4}[A-Z]$/, 'Invalid PAN format (e.g. ABCDE1234F)')
    .optional()
    .or(z.literal('')),
  idProofType: z.string().max(50).optional().or(z.literal('')),
  occupation: z.string().max(200).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
});

export const updateCustomerSchema = createCustomerSchema;

export type CreateCustomerFormValues = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerFormValues = z.infer<typeof updateCustomerSchema>;
