import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CurrencyInput } from '../currency-input';

describe('CurrencyInput', () => {
  it('renders with placeholder', () => {
    render(<CurrencyInput value={undefined} onValueChange={() => {}} placeholder="Enter amount" />);
    expect(screen.getByPlaceholderText('Enter amount')).toBeInTheDocument();
  });

  it('renders with default placeholder', () => {
    render(<CurrencyInput value={undefined} onValueChange={() => {}} />);
    expect(screen.getByPlaceholderText('Enter amount')).toBeInTheDocument();
  });

  it('calls onValueChange with numeric value on input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CurrencyInput value={undefined} onValueChange={onChange} />);

    const input = screen.getByPlaceholderText('Enter amount');
    await user.type(input, '1500');

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall).toBe(1500);
  });

  it('calls onValueChange with undefined for empty input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CurrencyInput value={100} onValueChange={onChange} />);

    const input = screen.getByDisplayValue('100');
    await user.clear(input);

    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('strips non-numeric characters except dots', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CurrencyInput value={undefined} onValueChange={onChange} />);

    const input = screen.getByPlaceholderText('Enter amount');
    await user.type(input, 'abc123');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall).toBe(123);
  });

  it('handles decimal input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CurrencyInput value={undefined} onValueChange={onChange} />);

    const input = screen.getByPlaceholderText('Enter amount');
    await user.type(input, '99.50');

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall).toBe(99.5);
  });

  it('shows formatted preview when value is positive', () => {
    render(<CurrencyInput value={5000} onValueChange={() => {}} />);
    expect(screen.getByText('Rs 5,000.00')).toBeInTheDocument();
  });

  it('does not show preview when value is undefined', () => {
    render(<CurrencyInput value={undefined} onValueChange={() => {}} />);
    expect(screen.queryByText(/Rs/)).not.toBeInTheDocument();
  });

  it('does not show preview when value is 0', () => {
    render(<CurrencyInput value={0} onValueChange={() => {}} />);
    expect(screen.queryByText(/Rs/)).not.toBeInTheDocument();
  });

  it('renders as disabled', () => {
    render(<CurrencyInput value={100} onValueChange={() => {}} disabled />);
    expect(screen.getByDisplayValue('100')).toBeDisabled();
  });

  it('renders with custom id', () => {
    render(<CurrencyInput value={undefined} onValueChange={() => {}} id="amount" />);
    expect(document.getElementById('amount')).toBeInTheDocument();
  });
});
