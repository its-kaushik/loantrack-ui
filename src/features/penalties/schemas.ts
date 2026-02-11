import { z } from 'zod/v4';

export const imposePenaltySchema = z.object({
  overrideAmount: z.number().positive('Amount must be greater than 0').optional(),
  notes: z.string().max(2000).optional(),
});

export const waivePenaltySchema = z.object({
  waiveAmount: z.number().positive('Waive amount must be greater than 0'),
  notes: z.string().max(2000).optional(),
});

export const waiveInterestSchema = z.object({
  waiveAmount: z.number().positive('Waive amount must be greater than 0'),
  notes: z.string().max(2000).optional(),
});

export type ImposePenaltyFormValues = z.infer<typeof imposePenaltySchema>;
export type WaivePenaltyFormValues = z.infer<typeof waivePenaltySchema>;
export type WaiveInterestFormValues = z.infer<typeof waiveInterestSchema>;
