import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoanCard } from '../loan-card';
import type { Loan } from '@/types/entities';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockLoan: Loan = {
  id: 'loan-123',
  loanNumber: 'LN-0001',
  loanType: 'MONTHLY',
  borrowerId: 'cust-1',
  borrowerName: 'Ravi Kumar',
  principalAmount: 100000,
  interestRate: 2,
  disbursementDate: '2026-01-01',
  status: 'ACTIVE',
  guarantorId: null,
  guarantorName: null,
  isMigrated: false,
  createdAt: '2026-01-01T00:00:00Z',
};

describe('LoanCard', () => {
  it('renders borrower name', () => {
    render(<LoanCard loan={mockLoan} />);
    expect(screen.getByText('Ravi Kumar')).toBeInTheDocument();
  });

  it('renders loan number', () => {
    render(<LoanCard loan={mockLoan} />);
    expect(screen.getByText('LN-0001')).toBeInTheDocument();
  });

  it('renders principal amount', () => {
    render(<LoanCard loan={mockLoan} />);
    expect(screen.getByText('Rs 1,00,000.00')).toBeInTheDocument();
  });

  it('renders loan type badge', () => {
    render(<LoanCard loan={mockLoan} />);
    expect(screen.getByText('MONTHLY')).toBeInTheDocument();
  });

  it('renders status badge', () => {
    render(<LoanCard loan={mockLoan} />);
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
  });

  it('links to loan detail page', () => {
    render(<LoanCard loan={mockLoan} />);
    const link = screen.getByText('Ravi Kumar').closest('a');
    expect(link).toHaveAttribute('href', '/loans/loan-123');
  });
});
