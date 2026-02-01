import { z } from 'zod/v4';

export const expenseCategories = [
  'TRAVEL',
  'SALARY',
  'OFFICE',
  'LEGAL',
  'MISC',
] as const;

export const createExpenseSchema = z.object({
  category: z.enum(expenseCategories, { message: 'Category is required' }),
  amount: z.number().positive('Amount must be greater than 0'),
  description: z.string().max(2000).optional(),
  expenseDate: z.string().min(1, 'Date is required'),
});

export type CreateExpenseFormValues = z.infer<typeof createExpenseSchema>;
