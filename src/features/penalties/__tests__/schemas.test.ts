import { describe, it, expect } from 'vitest';
import { imposePenaltySchema, waivePenaltySchema, waiveInterestSchema } from '../schemas';

describe('imposePenaltySchema', () => {
  it('accepts empty input (all fields optional)', () => {
    const result = imposePenaltySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts overrideAmount', () => {
    const result = imposePenaltySchema.safeParse({ overrideAmount: 5000 });
    expect(result.success).toBe(true);
  });

  it('rejects zero overrideAmount', () => {
    const result = imposePenaltySchema.safeParse({ overrideAmount: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects negative overrideAmount', () => {
    const result = imposePenaltySchema.safeParse({ overrideAmount: -100 });
    expect(result.success).toBe(false);
  });

  it('accepts notes', () => {
    const result = imposePenaltySchema.safeParse({ notes: 'Late payment' });
    expect(result.success).toBe(true);
  });
});

describe('waivePenaltySchema', () => {
  it('accepts valid input', () => {
    const result = waivePenaltySchema.safeParse({ waiveAmount: 2000 });
    expect(result.success).toBe(true);
  });

  it('rejects zero waiveAmount', () => {
    const result = waivePenaltySchema.safeParse({ waiveAmount: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects missing waiveAmount', () => {
    const result = waivePenaltySchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('waiveInterestSchema', () => {
  it('accepts valid input', () => {
    const result = waiveInterestSchema.safeParse({
      effectiveDate: '2026-01-15',
      waiveAmount: 3000,
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty effectiveDate', () => {
    const result = waiveInterestSchema.safeParse({
      effectiveDate: '',
      waiveAmount: 3000,
    });
    expect(result.success).toBe(false);
  });

  it('rejects zero waiveAmount', () => {
    const result = waiveInterestSchema.safeParse({
      effectiveDate: '2026-01-15',
      waiveAmount: 0,
    });
    expect(result.success).toBe(false);
  });
});
