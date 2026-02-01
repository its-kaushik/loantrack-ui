import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../login-form';

const mockMutate = vi.fn();
const mockLoginState = {
  mutate: mockMutate,
  isPending: false,
  error: null as unknown,
};

vi.mock('../../hooks/use-login', () => ({
  useLogin: () => mockLoginState,
}));

describe('LoginForm', () => {
  beforeEach(() => {
    mockMutate.mockReset();
    mockLoginState.isPending = false;
    mockLoginState.error = null;
  });

  it('renders phone and password fields', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('renders sign in button', () => {
    render(<LoginForm />);
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('shows validation error for empty phone', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(screen.getByText('Phone number is required')).toBeInTheDocument();
    });
  });

  it('shows validation error for short password', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText('Phone Number'), '9876543210');
    await user.type(screen.getByLabelText('Password'), '12345');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });
  });

  it('calls mutate with valid credentials', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText('Phone Number'), '9876543210');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        phone: '9876543210',
        password: 'password123',
      });
    });
  });

  it('shows "Signing in..." when pending', () => {
    mockLoginState.isPending = true;
    render(<LoginForm />);
    expect(screen.getByRole('button', { name: 'Signing in...' })).toBeDisabled();
  });

  it('displays API error message', () => {
    mockLoginState.error = { message: 'Invalid credentials' };
    render(<LoginForm />);
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('displays fallback error message when no message provided', () => {
    mockLoginState.error = {};
    render(<LoginForm />);
    expect(screen.getByText('Invalid credentials. Please try again.')).toBeInTheDocument();
  });

  it('does not show error div when no error', () => {
    mockLoginState.error = null;
    const { container } = render(<LoginForm />);
    expect(container.querySelector('.bg-destructive\\/10')).not.toBeInTheDocument();
  });

  it('has correct input types', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText('Phone Number')).toHaveAttribute('type', 'tel');
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });

  it('does not call mutate on empty form submit', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(screen.getByText('Phone number is required')).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });
});
