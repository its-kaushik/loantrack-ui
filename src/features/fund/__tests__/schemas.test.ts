import { describe, it, expect } from 'vitest';
import { createFundEntrySchema } from '../schemas';

const validEntry = {
  entryType: 'INJECTION' as const,
  amount: 500000,
  entryDate: '2026-01-15',
};

describe('createFundEntrySchema', () => {
  it('accepts valid INJECTION', () => {
    const result = createFundEntrySchema.safeParse(validEntry);
    expect(result.success).toBe(true);
  });

  it('accepts valid WITHDRAWAL', () => {
    const result = createFundEntrySchema.safeParse({ ...validEntry, entryType: 'WITHDRAWAL' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid entryType', () => {
    const result = createFundEntrySchema.safeParse({ ...validEntry, entryType: 'TRANSFER' });
    expect(result.success).toBe(false);
  });

  it('rejects zero amount', () => {
    const result = createFundEntrySchema.safeParse({ ...validEntry, amount: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects empty entryDate', () => {
    const result = createFundEntrySchema.safeParse({ ...validEntry, entryDate: '' });
    expect(result.success).toBe(false);
  });
});
