import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '../empty-state';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="No loans found" />);
    expect(screen.getByText('No loans found')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<EmptyState title="No loans" description="Create a new loan to get started" />);
    expect(screen.getByText('Create a new loan to get started')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const { container } = render(<EmptyState title="No loans" />);
    expect(container.querySelector('p')).not.toBeInTheDocument();
  });

  it('renders action button and handles click', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<EmptyState title="No data" action={{ label: 'Create New', onClick }} />);

    await user.click(screen.getByText('Create New'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders link action when actionLabel and actionHref provided', () => {
    render(
      <EmptyState title="No loans" actionLabel="Create Loan" actionHref="/loans/new" />,
    );
    const link = screen.getByText('Create Loan').closest('a');
    expect(link).toHaveAttribute('href', '/loans/new');
  });

  it('does not render action button when no action provided', () => {
    render(<EmptyState title="Nothing here" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('does not render link when only actionLabel is provided without href', () => {
    render(<EmptyState title="Nothing" actionLabel="Click me" />);
    expect(screen.queryByText('Click me')).not.toBeInTheDocument();
  });

  it('renders decorative circles', () => {
    const { container } = render(<EmptyState title="Empty" />);
    expect(container.querySelector('.rounded-full')).toBeInTheDocument();
  });
});
