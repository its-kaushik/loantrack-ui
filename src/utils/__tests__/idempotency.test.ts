import { describe, it, expect } from 'vitest';
import { generateIdempotencyKey } from '../idempotency';

describe('generateIdempotencyKey', () => {
  it('returns a valid UUID v4 format', () => {
    const key = generateIdempotencyKey();
    expect(key).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it('returns unique keys on successive calls', () => {
    const keys = new Set(Array.from({ length: 100 }, () => generateIdempotencyKey()));
    expect(keys.size).toBe(100);
  });

  it('returns a string', () => {
    expect(typeof generateIdempotencyKey()).toBe('string');
  });
});
