import { describe, it, expect } from 'vitest';
import { createCustomerSchema } from '../schemas';

const validCustomer = {
  fullName: 'Ravi Kumar',
  phone: '9876543210',
};

describe('createCustomerSchema', () => {
  it('accepts valid input with required fields only', () => {
    const result = createCustomerSchema.safeParse(validCustomer);
    expect(result.success).toBe(true);
  });

  it('accepts full valid input', () => {
    const result = createCustomerSchema.safeParse({
      ...validCustomer,
      alternatePhone: '9876543211',
      address: '123 Main St',
      aadhaarNumber: '123456789012',
      panNumber: 'ABCDE1234F',
      idProofType: 'Voter ID',
      occupation: 'Farmer',
      notes: 'Good customer',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty fullName', () => {
    const result = createCustomerSchema.safeParse({ ...validCustomer, fullName: '' });
    expect(result.success).toBe(false);
  });

  it('rejects fullName exceeding 200 characters', () => {
    const result = createCustomerSchema.safeParse({ ...validCustomer, fullName: 'a'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('rejects phone shorter than 10 digits', () => {
    const result = createCustomerSchema.safeParse({ ...validCustomer, phone: '12345' });
    expect(result.success).toBe(false);
  });

  it('rejects phone longer than 15 characters', () => {
    const result = createCustomerSchema.safeParse({ ...validCustomer, phone: '1'.repeat(16) });
    expect(result.success).toBe(false);
  });

  it('accepts empty string for optional alternatePhone', () => {
    const result = createCustomerSchema.safeParse({ ...validCustomer, alternatePhone: '' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid aadhaar (non-12 digits)', () => {
    const result = createCustomerSchema.safeParse({ ...validCustomer, aadhaarNumber: '12345' });
    expect(result.success).toBe(false);
  });

  it('accepts empty string for aadhaar', () => {
    const result = createCustomerSchema.safeParse({ ...validCustomer, aadhaarNumber: '' });
    expect(result.success).toBe(true);
  });

  it('accepts valid 12-digit aadhaar', () => {
    const result = createCustomerSchema.safeParse({ ...validCustomer, aadhaarNumber: '123456789012' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid PAN format', () => {
    const result = createCustomerSchema.safeParse({ ...validCustomer, panNumber: 'INVALID' });
    expect(result.success).toBe(false);
  });

  it('accepts valid PAN format', () => {
    const result = createCustomerSchema.safeParse({ ...validCustomer, panNumber: 'ABCDE1234F' });
    expect(result.success).toBe(true);
  });

  it('accepts empty string for PAN', () => {
    const result = createCustomerSchema.safeParse({ ...validCustomer, panNumber: '' });
    expect(result.success).toBe(true);
  });

  it('rejects notes exceeding 2000 characters', () => {
    const result = createCustomerSchema.safeParse({ ...validCustomer, notes: 'a'.repeat(2001) });
    expect(result.success).toBe(false);
  });
});
