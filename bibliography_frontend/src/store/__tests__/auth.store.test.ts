import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useAuthStore, type UserProfile, type Tokens } from '../auth.store';

describe('Auth Store', () => {
  const mockUser: UserProfile = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    avatar: 'https://example.com/avatar.jpg',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const mockTokens: Tokens = {
    accessToken: 'test-access-token-123',
    refreshToken: 'test-refresh-token-456',
  };

  beforeEach(() => {
    // Reset store before each test
    useAuthStore.setState({
      isAuthenticated: false,
      tokens: null,
      user: null,
      sessionExpiry: null,
    });

    // Clear any previous timers
    vi.clearAllTimers();
  });

  describe('Login action', () => {
    it('should set authenticated state with token and user', () => {
      const { login } = useAuthStore.getState();

      login(mockTokens, mockUser);

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.tokens).toEqual(mockTokens);
      expect(state.user).toEqual(mockUser);
      expect(state.sessionExpiry).toBeInstanceOf(Date);
    });

    it('should set session expiry based on expiresIn parameter', () => {
      const { login } = useAuthStore.getState();
      const beforeLogin = new Date();

      login(mockTokens, mockUser, 7200); // 2 hours

      const state = useAuthStore.getState();
      const expiry = state.sessionExpiry as Date;

      // Should be approximately 2 hours from now
      const timeDiff = expiry.getTime() - beforeLogin.getTime();
      expect(timeDiff).toBeGreaterThan(7190 * 1000); // Allow 10s margin
      expect(timeDiff).toBeLessThan(7210 * 1000);
    });

    it('should use default expiry of 3600 seconds if not specified', () => {
      const { login } = useAuthStore.getState();
      const beforeLogin = new Date();

      login(mockTokens, mockUser);

      const state = useAuthStore.getState();
      const expiry = state.sessionExpiry as Date;

      // Should be approximately 1 hour from now
      const timeDiff = expiry.getTime() - beforeLogin.getTime();
      expect(timeDiff).toBeGreaterThan(3590 * 1000);
      expect(timeDiff).toBeLessThan(3610 * 1000);
    });
  });

  describe('Logout action', () => {
    it('should clear all auth state', () => {
      const { login, logout } = useAuthStore.getState();

      // First login
      login(mockTokens, mockUser);

      // Then logout
      logout();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.tokens).toBe(null);
      expect(state.user).toBe(null);
      expect(state.sessionExpiry).toBe(null);
    });
  });

  describe('SetUser action', () => {
    it('should update user profile', () => {
      const { login, setUser } = useAuthStore.getState();

      login(mockTokens, mockUser);

      const updatedUser: UserProfile = {
        ...mockUser,
        name: 'Updated Name',
        avatar: 'https://example.com/new-avatar.jpg',
      };

      setUser(updatedUser);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(updatedUser);
      expect(state.user?.name).toBe('Updated Name');
    });
  });

  describe('SetTokens action', () => {
    it('should update tokens', () => {
      const { login, setTokens } = useAuthStore.getState();

      login(mockTokens, mockUser);

      const newTokens: Tokens = {
        accessToken: 'new-access-token-456',
        refreshToken: 'new-refresh-token-789',
      };

      setTokens(newTokens);

      const state = useAuthStore.getState();
      expect(state.tokens).toEqual(newTokens);
    });
  });

  describe('RefreshSession action', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should update session expiry', () => {
      const { login, refreshSession } = useAuthStore.getState();
      const now = new Date('2024-01-01T12:00:00Z');
      vi.setSystemTime(now);

      login(mockTokens, mockUser, 1800); // 30 minutes

      const oldExpiry = useAuthStore.getState().sessionExpiry as Date;

      // Wait a tiny bit
      vi.advanceTimersByTime(100);

      refreshSession(3600); // Refresh to 1 hour

      const newExpiry = useAuthStore.getState().sessionExpiry as Date;

      expect(newExpiry.getTime()).toBeGreaterThan(oldExpiry.getTime());
    });
  });

  describe('IsSessionValid check', () => {
    it('should return false when no session exists', () => {
      const { isSessionValid } = useAuthStore.getState();

      expect(isSessionValid()).toBe(false);
    });

    it('should return true when session is valid', () => {
      const { login, isSessionValid } = useAuthStore.getState();

      login(mockTokens, mockUser, 3600);

      expect(isSessionValid()).toBe(true);
    });

    it('should return false when session has expired', () => {
      vi.useFakeTimers();
      const now = new Date('2024-01-01T12:00:00Z');
      vi.setSystemTime(now);

      const { login, isSessionValid } = useAuthStore.getState();

      // Login with very short expiry
      login(mockTokens, mockUser, 1);

      // Advance time past expiry
      vi.advanceTimersByTime(2000);

      expect(isSessionValid()).toBe(false);

      vi.useRealTimers();
    });
  });
});
