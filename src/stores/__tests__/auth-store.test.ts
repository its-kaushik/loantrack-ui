import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useAuthStore } from '../auth-store';

const mockUser = {
  id: 'user-1',
  name: 'Test Admin',
  role: 'ADMIN' as const,
  tenantId: 'tenant-1',
};

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      user: null,
      isHydrated: false,
    });
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('has correct initial state', () => {
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.expiresAt).toBeNull();
    expect(state.user).toBeNull();
  });

  describe('setAuth', () => {
    it('sets all auth fields', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-15T12:00:00Z'));

      useAuthStore.getState().setAuth({
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
        expiresIn: 3600,
        user: mockUser,
      });

      const state = useAuthStore.getState();
      expect(state.accessToken).toBe('access-123');
      expect(state.refreshToken).toBe('refresh-456');
      expect(state.expiresAt).toBe(Date.now() + 3600 * 1000);
      expect(state.user).toEqual(mockUser);
    });

    it('computes expiresAt from expiresIn', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-15T12:00:00Z'));
      const now = Date.now();

      useAuthStore.getState().setAuth({
        accessToken: 'a',
        refreshToken: 'r',
        expiresIn: 1800,
        user: mockUser,
      });

      expect(useAuthStore.getState().expiresAt).toBe(now + 1800 * 1000);
    });
  });

  describe('setTokens', () => {
    it('updates tokens without clearing user', () => {
      useAuthStore.setState({ user: mockUser });

      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-15T12:00:00Z'));

      useAuthStore.getState().setTokens('new-access', 'new-refresh', 7200);

      const state = useAuthStore.getState();
      expect(state.accessToken).toBe('new-access');
      expect(state.refreshToken).toBe('new-refresh');
      expect(state.expiresAt).toBe(Date.now() + 7200 * 1000);
      expect(state.user).toEqual(mockUser);
    });
  });

  describe('clearAuth', () => {
    it('resets all auth fields to null', () => {
      useAuthStore.getState().setAuth({
        accessToken: 'a',
        refreshToken: 'r',
        expiresIn: 3600,
        user: mockUser,
      });

      useAuthStore.getState().clearAuth();

      const state = useAuthStore.getState();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.expiresAt).toBeNull();
      expect(state.user).toBeNull();
    });
  });

  describe('setHydrated', () => {
    it('sets isHydrated to true', () => {
      useAuthStore.getState().setHydrated(true);
      expect(useAuthStore.getState().isHydrated).toBe(true);
    });

    it('sets isHydrated to false', () => {
      useAuthStore.setState({ isHydrated: true });
      useAuthStore.getState().setHydrated(false);
      expect(useAuthStore.getState().isHydrated).toBe(false);
    });
  });

  describe('partialize', () => {
    it('does not persist accessToken', () => {
      useAuthStore.getState().setAuth({
        accessToken: 'secret',
        refreshToken: 'refresh-123',
        expiresIn: 3600,
        user: mockUser,
      });

      const raw = localStorage.getItem('loantrack-auth');
      expect(raw).not.toBeNull();
      const persisted = JSON.parse(raw!);
      expect(persisted.state).not.toHaveProperty('accessToken');
      expect(persisted.state).toHaveProperty('refreshToken');
      expect(persisted.state).toHaveProperty('expiresAt');
      expect(persisted.state).toHaveProperty('user');
    });
  });
});
