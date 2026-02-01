import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatePicker } from '../date-picker';

describe('DatePicker', () => {
  it('renders with placeholder when no value', () => {
    render(<DatePicker value={undefined} onChange={() => {}} />);
    expect(screen.getByText('Pick a date')).toBeInTheDocument();
  });

  it('renders custom placeholder', () => {
    render(<DatePicker value={undefined} onChange={() => {}} placeholder="Select date" />);
    expect(screen.getByText('Select date')).toBeInTheDocument();
  });

  it('renders formatted date when value is provided', () => {
    render(<DatePicker value="2026-01-15" onChange={() => {}} />);
    expect(screen.getByText(/January 15/)).toBeInTheDocument();
  });

  it('calls onChange with today date string when Today button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker value="2026-01-15" onChange={onChange} />);

    // Open popover
    await user.click(screen.getByText(/January 15/));

    // Wait for the popover to appear, then click Today
    await waitFor(() => {
      expect(screen.getByText('Today')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Today'));

    // Verify onChange was called with a YYYY-MM-DD string (today's date)
    expect(onChange).toHaveBeenCalledTimes(1);
    const calledWith = onChange.mock.calls[0][0];
    expect(calledWith).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('renders as disabled', () => {
    render(<DatePicker value={undefined} onChange={() => {}} disabled />);
    expect(screen.getByText('Pick a date').closest('button')).toBeDisabled();
  });

  it('renders with custom id', () => {
    render(<DatePicker value={undefined} onChange={() => {}} id="date-field" />);
    expect(document.getElementById('date-field')).toBeInTheDocument();
  });
});
