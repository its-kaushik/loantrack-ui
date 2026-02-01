import { describe, it, expect } from 'vitest';
import { createTenantSchema } from '../schemas';

const validTenant = {
  name: 'ABC Finance',
  slug: 'abc-finance',
  ownerName: 'Suresh Kumar',
  ownerPhone: '9876543210',
  adminName: 'Rajesh',
  adminPhone: '9876543211',
  adminPassword: 'adminpass1',
};

describe('createTenantSchema', () => {
  it('accepts valid input', () => {
    const result = createTenantSchema.safeParse(validTenant);
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = createTenantSchema.safeParse({ ...validTenant, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects slug shorter than 2 characters', () => {
    const result = createTenantSchema.safeParse({ ...validTenant, slug: 'a' });
    expect(result.success).toBe(false);
  });

  it('rejects slug with uppercase letters', () => {
    const result = createTenantSchema.safeParse({ ...validTenant, slug: 'ABC-Finance' });
    expect(result.success).toBe(false);
  });

  it('rejects slug with spaces', () => {
    const result = createTenantSchema.safeParse({ ...validTenant, slug: 'abc finance' });
    expect(result.success).toBe(false);
  });

  it('rejects slug starting with hyphen', () => {
    const result = createTenantSchema.safeParse({ ...validTenant, slug: '-abc' });
    expect(result.success).toBe(false);
  });

  it('rejects slug ending with hyphen', () => {
    const result = createTenantSchema.safeParse({ ...validTenant, slug: 'abc-' });
    expect(result.success).toBe(false);
  });

  it('accepts slug with numbers', () => {
    const result = createTenantSchema.safeParse({ ...validTenant, slug: 'abc123' });
    expect(result.success).toBe(true);
  });

  it('accepts slug with hyphens between segments', () => {
    const result = createTenantSchema.safeParse({ ...validTenant, slug: 'abc-def-123' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email format', () => {
    const result = createTenantSchema.safeParse({ ...validTenant, ownerEmail: 'not-email' });
    expect(result.success).toBe(false);
  });

  it('accepts valid email', () => {
    const result = createTenantSchema.safeParse({ ...validTenant, ownerEmail: 'owner@test.com' });
    expect(result.success).toBe(true);
  });

  it('accepts empty string for optional ownerEmail', () => {
    const result = createTenantSchema.safeParse({ ...validTenant, ownerEmail: '' });
    expect(result.success).toBe(true);
  });

  it('rejects admin password shorter than 8 characters', () => {
    const result = createTenantSchema.safeParse({ ...validTenant, adminPassword: '1234567' });
    expect(result.success).toBe(false);
  });
});
