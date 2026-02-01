import { describe, it, expect } from 'vitest';
import { loginSchema, changePasswordSchema } from '../schemas';

describe('loginSchema', () => {
  it('accepts valid input', () => {
    const result = loginSchema.safeParse({ phone: '9876543210', password: 'secret123' });
    expect(result.success).toBe(true);
  });

  it('rejects empty phone', () => {
    const result = loginSchema.safeParse({ phone: '', password: 'secret123' });
    expect(result.success).toBe(false);
  });

  it('rejects password shorter than 6 characters', () => {
    const result = loginSchema.safeParse({ phone: '9876543210', password: '12345' });
    expect(result.success).toBe(false);
  });

  it('rejects missing fields', () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('changePasswordSchema', () => {
  it('accepts valid input with matching passwords', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'oldpass',
      newPassword: 'newpass123',
      confirmPassword: 'newpass123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects mismatched passwords', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'oldpass',
      newPassword: 'newpass123',
      confirmPassword: 'different',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short new password', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'oldpass',
      newPassword: '12345',
      confirmPassword: '12345',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty current password', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: '',
      newPassword: 'newpass123',
      confirmPassword: 'newpass123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty confirm password', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'oldpass',
      newPassword: 'newpass123',
      confirmPassword: '',
    });
    expect(result.success).toBe(false);
  });
});
