import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface UserProfile {
	id: string;
	email: string;
	name: string;
	avatar?: string;
	createdAt: string;
	updatedAt: string;
}

export interface Tokens {
	accessToken: string;
	refreshToken: string;
}

interface AuthState {
	// Authentication state
	isAuthenticated: boolean;
	tokens: Tokens | null;
	user: UserProfile | null;

	// Session state
	sessionExpiry: Date | null;
}

interface AuthActions {
	// Authentication actions
	login: (tokens: Tokens, user: UserProfile, expiresIn?: number) => void;
	logout: () => void;
	setUser: (user: UserProfile) => void;
	setTokens: (tokens: Tokens | null) => void;

	// Session actions
	refreshSession: (expiresIn?: number) => void;
	isSessionValid: () => boolean;
}

export const useAuthStore = create<AuthState & AuthActions>()(
	devtools(
		persist(
			(set, get) => ({
				// Initial state
				isAuthenticated: false,
				tokens: null,
				user: null,
				sessionExpiry: null,

				// Authentication actions
				login: (tokens, user, expiresIn = 3600) => {
					const expiry = new Date();
					expiry.setSeconds(expiry.getSeconds() + expiresIn);

					set(
						{
							isAuthenticated: true,
							tokens,
							user,
							sessionExpiry: expiry,
						},
						false,
						'auth/login'
					);
				},

				logout: () => {
					set(
						{
							isAuthenticated: false,
							tokens: null,
							user: null,
							sessionExpiry: null,
						},
						false,
						'auth/logout'
					);
				},

				setUser: (user) => {
					set({ user }, false, 'auth/setUser');
				},

				setTokens: (tokens) => {
					set({ tokens }, false, 'auth/setTokens');
				},

				// Session actions
				refreshSession: (expiresIn = 3600) => {
					const expiry = new Date();
					expiry.setSeconds(expiry.getSeconds() + expiresIn);
					set({ sessionExpiry: expiry }, false, 'auth/refreshSession');
				},

				isSessionValid: () => {
					const { sessionExpiry } = get();
					if (!sessionExpiry) return false;
					return new Date() < new Date(sessionExpiry);
				},
			}),
			{
				name: 'bibliography-auth-store',
				partialize: (state) => ({
					isAuthenticated: state.isAuthenticated,
					tokens: state.tokens,
					user: state.user,
					sessionExpiry: state.sessionExpiry,
				}),
			}
		),
		{
			name: 'auth-store',
		}
	)
);

// Selectors for optimized subscriptions
export const useIsAuthenticated = () =>
	useAuthStore((state) => state.isAuthenticated);

export const useCurrentUser = () => useAuthStore((state) => state.user);

export const useAuthTokens = () => useAuthStore((state) => state.tokens);

export const useAccessToken = () => useAuthStore((state) => state.tokens?.accessToken);
