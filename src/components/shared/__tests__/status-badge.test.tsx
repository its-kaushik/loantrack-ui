import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../status-badge';

describe('StatusBadge', () => {
  describe('loan variant (default)', () => {
    it('renders ACTIVE with green classes', () => {
      render(<StatusBadge status="ACTIVE" />);
      const badge = screen.getByText('ACTIVE');
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain('bg-green-100');
    });

    it('renders CLOSED with gray classes', () => {
      render(<StatusBadge status="CLOSED" />);
      expect(screen.getByText('CLOSED').className).toContain('bg-gray-100');
    });

    it('renders DEFAULTED with red classes', () => {
      render(<StatusBadge status="DEFAULTED" />);
      expect(screen.getByText('DEFAULTED').className).toContain('bg-red-100');
    });

    it('renders WRITTEN_OFF with red-200 classes', () => {
      render(<StatusBadge status="WRITTEN_OFF" />);
      expect(screen.getByText('WRITTEN OFF').className).toContain('bg-red-200');
    });

    it('renders CANCELLED with orange classes', () => {
      render(<StatusBadge status="CANCELLED" />);
      expect(screen.getByText('CANCELLED').className).toContain('bg-orange-100');
    });
  });

  describe('approval variant', () => {
    it('renders PENDING with amber classes', () => {
      render(<StatusBadge status="PENDING" variant="approval" />);
      expect(screen.getByText('PENDING').className).toContain('bg-amber-100');
    });

    it('renders APPROVED with green classes', () => {
      render(<StatusBadge status="APPROVED" variant="approval" />);
      expect(screen.getByText('APPROVED').className).toContain('bg-green-100');
    });

    it('renders REJECTED with red classes', () => {
      render(<StatusBadge status="REJECTED" variant="approval" />);
      expect(screen.getByText('REJECTED').className).toContain('bg-red-100');
    });
  });

  describe('penalty variant', () => {
    it('renders PENDING with amber classes', () => {
      render(<StatusBadge status="PENDING" variant="penalty" />);
      expect(screen.getByText('PENDING').className).toContain('bg-amber-100');
    });

    it('renders PARTIALLY_PAID with blue classes', () => {
      render(<StatusBadge status="PARTIALLY_PAID" variant="penalty" />);
      expect(screen.getByText('PARTIALLY PAID').className).toContain('bg-blue-100');
    });

    it('renders PAID with green classes', () => {
      render(<StatusBadge status="PAID" variant="penalty" />);
      expect(screen.getByText('PAID').className).toContain('bg-green-100');
    });

    it('renders WAIVED with gray classes', () => {
      render(<StatusBadge status="WAIVED" variant="penalty" />);
      expect(screen.getByText('WAIVED').className).toContain('bg-gray-100');
    });
  });

  describe('label formatting', () => {
    it('replaces underscores with spaces', () => {
      render(<StatusBadge status="WRITTEN_OFF" />);
      expect(screen.getByText('WRITTEN OFF')).toBeInTheDocument();
    });

    it('replaces multiple underscores', () => {
      render(<StatusBadge status="PARTIALLY_PAID" variant="penalty" />);
      expect(screen.getByText('PARTIALLY PAID')).toBeInTheDocument();
    });
  });

  describe('unknown status', () => {
    it('falls back to gray for unknown loan status', () => {
      render(<StatusBadge status="UNKNOWN" variant="loan" />);
      expect(screen.getByText('UNKNOWN').className).toContain('bg-gray-100');
    });

    it('falls back to gray for unknown approval status', () => {
      render(<StatusBadge status="UNKNOWN" variant="approval" />);
      expect(screen.getByText('UNKNOWN').className).toContain('bg-gray-100');
    });
  });

  it('passes custom className', () => {
    render(<StatusBadge status="ACTIVE" className="my-custom" />);
    expect(screen.getByText('ACTIVE').className).toContain('my-custom');
  });
});
