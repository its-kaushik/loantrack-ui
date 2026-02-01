import { z } from 'zod/v4';

export const createFundEntrySchema = z.object({
  entryType: z.enum(['INJECTION', 'WITHDRAWAL'], { message: 'Entry type is required' }),
  amount: z.number().positive('Amount must be greater than 0'),
  description: z.string().max(2000).optional(),
  entryDate: z.string().min(1, 'Date is required'),
});

export type CreateFundEntryFormValues = z.infer<typeof createFundEntrySchema>;
