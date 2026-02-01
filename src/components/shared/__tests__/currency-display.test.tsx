import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CurrencyDisplay } from '../currency-display';

describe('CurrencyDisplay', () => {
  it('renders formatted positive amount', () => {
    render(<CurrencyDisplay amount={1000} />);
    expect(screen.getByText('Rs 1,000.00')).toBeInTheDocument();
  });

  it('renders formatted large amount with Indian grouping', () => {
    render(<CurrencyDisplay amount={1234567} />);
    expect(screen.getByText('Rs 12,34,567.00')).toBeInTheDocument();
  });

  it('renders negative amount with prefix and destructive class', () => {
    render(<CurrencyDisplay amount={-500} />);
    const el = screen.getByText(/Rs 500\.00/);
    expect(el.textContent).toContain('- Rs 500.00');
    expect(el.className).toContain('text-destructive');
  });

  it('does not apply destructive class for positive amount', () => {
    render(<CurrencyDisplay amount={100} />);
    const el = screen.getByText('Rs 100.00');
    expect(el.className).not.toContain('text-destructive');
  });

  it('handles string amount', () => {
    render(<CurrencyDisplay amount="2500.50" />);
    expect(screen.getByText('Rs 2,500.50')).toBeInTheDocument();
  });

  it('renders zero amount', () => {
    render(<CurrencyDisplay amount={0} />);
    expect(screen.getByText('Rs 0.00')).toBeInTheDocument();
  });

  it('passes custom className', () => {
    render(<CurrencyDisplay amount={100} className="font-bold" />);
    expect(screen.getByText('Rs 100.00').className).toContain('font-bold');
  });
});
