import { describe, it, expect } from 'vitest';
import { createUserSchema, resetPasswordSchema } from '../schemas';

const validUser = {
  name: 'Ravi Kumar',
  phone: '9876543210',
  password: 'password123',
  role: 'COLLECTOR' as const,
};

describe('createUserSchema', () => {
  it('accepts valid input', () => {
    const result = createUserSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = createUserSchema.safeParse({ ...validUser, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects name exceeding 100 characters', () => {
    const result = createUserSchema.safeParse({ ...validUser, name: 'a'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('rejects phone shorter than 10 digits', () => {
    const result = createUserSchema.safeParse({ ...validUser, phone: '12345' });
    expect(result.success).toBe(false);
  });

  it('rejects password shorter than 8 characters', () => {
    const result = createUserSchema.safeParse({ ...validUser, password: '1234567' });
    expect(result.success).toBe(false);
  });

  it('only accepts COLLECTOR role', () => {
    const result = createUserSchema.safeParse({ ...validUser, role: 'ADMIN' });
    expect(result.success).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  it('accepts valid password', () => {
    const result = resetPasswordSchema.safeParse({ newPassword: 'newpass123' });
    expect(result.success).toBe(true);
  });

  it('rejects password shorter than 8 characters', () => {
    const result = resetPasswordSchema.safeParse({ newPassword: '1234567' });
    expect(result.success).toBe(false);
  });
});
