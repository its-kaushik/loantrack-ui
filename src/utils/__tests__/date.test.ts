import { describe, it, expect, vi, afterEach } from 'vitest';
import { formatDate, formatTimestamp, todayString } from '../date';

describe('formatDate', () => {
  it('formats a date string', () => {
    expect(formatDate('2026-01-15')).toBe('15 Jan 2026');
  });

  it('formats another date', () => {
    expect(formatDate('2025-12-25')).toBe('25 Dec 2025');
  });

  it('formats a date with leading zeros', () => {
    expect(formatDate('2026-03-05')).toBe('05 Mar 2026');
  });
});

describe('formatTimestamp', () => {
  it('formats a full ISO timestamp', () => {
    const result = formatTimestamp('2026-01-15T10:30:00.000Z');
    expect(result).toMatch(/15 Jan 2026/);
    expect(result).toMatch(/\d{2}:\d{2} (AM|PM)/);
  });
});

describe('todayString', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns YYYY-MM-DD format', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 15));
    expect(todayString()).toBe('2026-01-15');
    vi.useRealTimers();
  });

  it('pads single-digit months and days', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 5));
    expect(todayString()).toBe('2026-03-05');
    vi.useRealTimers();
  });

  it('matches YYYY-MM-DD pattern', () => {
    expect(todayString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
