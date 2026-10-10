import { describe, it, expect } from 'vitest';
import { canSettleDailyLoan } from '../settlement';

const base = {
  status: 'ACTIVE' as const,
  principalAmount: 50000,
  totalRepaymentAmount: 60000,
  totalCollected: 52500,
};

describe('canSettleDailyLoan', () => {
  it('allows an active loan whose collections cover the principal but not the scheduled total', () => {
    expect(canSettleDailyLoan(base)).toBe(true);
  });

  it('allows settling at exactly the principal', () => {
    expect(canSettleDailyLoan({ ...base, totalCollected: 50000 })).toBe(true);
  });

  it('refuses when collections are below the principal', () => {
    expect(canSettleDailyLoan({ ...base, totalCollected: 49999.99 })).toBe(false);
    expect(canSettleDailyLoan({ ...base, totalCollected: 0 })).toBe(false);
  });

  it('refuses a fully repaid loan, which is closed normally instead', () => {
    expect(canSettleDailyLoan({ ...base, totalCollected: 60000 })).toBe(false);
    expect(canSettleDailyLoan({ ...base, totalCollected: 60500 })).toBe(false);
  });

  it.each(['CLOSED', 'DEFAULTED', 'WRITTEN_OFF', 'CANCELLED'] as const)(
    'refuses a %s loan',
    (status) => {
      expect(canSettleDailyLoan({ ...base, status })).toBe(false);
    },
  );
});
