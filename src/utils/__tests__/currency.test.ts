import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../currency';

describe('formatCurrency', () => {
  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('Rs 0.00');
  });

  it('formats small amounts', () => {
    expect(formatCurrency(50)).toBe('Rs 50.00');
  });

  it('formats amounts with decimals', () => {
    expect(formatCurrency(1234.56)).toBe('Rs 1,234.56');
  });

  it('formats thousands with Indian grouping', () => {
    expect(formatCurrency(10000)).toBe('Rs 10,000.00');
  });

  it('formats lakhs with Indian grouping', () => {
    expect(formatCurrency(100000)).toBe('Rs 1,00,000.00');
  });

  it('formats crores with Indian grouping', () => {
    expect(formatCurrency(10000000)).toBe('Rs 1,00,00,000.00');
  });

  it('formats negative amounts', () => {
    expect(formatCurrency(-5000)).toBe('-Rs 5,000.00');
  });

  it('truncates to 2 decimal places', () => {
    expect(formatCurrency(1234.5678)).toBe('Rs 1,234.57');
  });

  it('pads single decimal to 2 places', () => {
    expect(formatCurrency(100.5)).toBe('Rs 100.50');
  });
});
