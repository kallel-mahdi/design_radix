import { useAuthStore, type Tokens } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { API_TIMEOUT_MS } from '../constants';

// Default to API Gateway (port 3000) for centralized auth, logging, and routing
// Direct service access available via VITE_API_BASE_URL=http://localhost:8005/api/bibliography for testing only
const API_BASE_URL = import.meta.env['VITE_API_BASE_URL'] || 'http://localhost:3000/api/bibliography';

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
}

class ApiClient {
  private baseURL: string;
  private timeout: number = API_TIMEOUT_MS;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<void> | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Build full URL with query parameters
   */
  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Build headers with auth token injection
   */
  private buildHeaders(headers?: Record<string, string>): Record<string, string> {
    const authStore = useAuthStore.getState();
    const baseHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Inject access token if available
    if (authStore.tokens?.accessToken) {
      baseHeaders['Authorization'] = `Bearer ${authStore.tokens.accessToken}`;
    }

    // For development: use x-user-id header to bypass JWT
    // In production, this would come from JWT token on backend
    if (!authStore.tokens?.accessToken && import.meta.env.DEV) {
      baseHeaders['x-user-id'] = 'test-user-id';
    }

    return baseHeaders;
  }

  /**
   * Handle fetch with timeout
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Normalize errors to ApiError format
   *
   * Distinguishes between different error types:
   * - AbortError: Request timeout
   * - TypeError with connection message: Server starting (retryable)
   * - Other TypeError: Network error
   * - Error: Generic error
   */
  private normalizeError(error: unknown): ApiError {
    if (error instanceof TypeError) {
      if (error.name === 'AbortError') {
        return {
          message: 'Request timeout',
          code: 'TIMEOUT',
        };
      }

      // Connection refused during startup (before request sent)
      // This happens when fetch() fails immediately because server isn't listening
      const errorMessage = error.message?.toLowerCase() || '';
      if (
        errorMessage.includes('failed to fetch') ||
        errorMessage.includes('network request failed') ||
        errorMessage.includes('request failed') ||
        (error as any).cause instanceof TypeError // Network error during connection (ES2022 feature)
      ) {
        // During dev startup (2-5s), this is expected. Use retryable error code.
        return {
          message: 'Server starting, retrying...',
          code: 'SERVER_STARTING',
        };
      }

      // Other TypeError (actual network issues)
      return {
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
      };
    }

    if (error instanceof Error) {
      return {
        message: error.message || 'Request failed',
        code: 'REQUEST_ERROR',
      };
    }

    return {
      message: 'An unknown error occurred',
      code: 'UNKNOWN_ERROR',
    };
  }

  /**
   * Refresh access token using refresh token
   * Points to editor's auth service (not bibliography backend)
   */
  private async refreshAccessToken(): Promise<void> {
    const authStore = useAuthStore.getState();
    const refreshToken = authStore.tokens?.refreshToken;

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Route auth refresh through API Gateway for consistent CORS, rate limiting, and observability
    const AUTH_SERVICE_URL = import.meta.env['VITE_AUTH_SERVICE_URL'] || 'http://localhost:3000/api/auth';

    try {
      const response = await fetch(`${AUTH_SERVICE_URL}/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      const newTokens: Tokens = {
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken || refreshToken, // Use new refresh token if provided
      };

      // Update tokens in store
      authStore.setTokens(newTokens);
      authStore.refreshSession(data.data.expiresIn || 3600);
    } catch (error) {
      // Refresh failed - logout user
      authStore.logout();
      throw error;
    }
  }

  /**
   * Handle response and show error toasts
   * Extracts and returns the data directly (unwrapped)
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    let data: any;

    try {
      data = await response.json();
    } catch {
      // Response might not be JSON
      data = null;
    }

    // Handle error responses
    if (!response.ok) {
      const error: ApiError = {
        message: data?.message || `HTTP ${response.status}`,
        code: data?.code || `HTTP_${response.status}`,
        details: data?.details || data,
      };

      // Handle specific status codes
      if (response.status === 401) {
        // Don't logout immediately - let request() handle refresh + retry
        error.code = 'UNAUTHORIZED';
      } else if (response.status === 403) {
        useUIStore.getState().addToast({
          message: 'You do not have permission to perform this action.',
          type: 'error',
        });
      } else if (response.status === 500) {
        useUIStore.getState().addToast({
          message: 'Server error. Please try again later.',
          type: 'error',
        });
      }

      throw error;
    }

    // Handle 204 No Content (empty response)
    if (response.status === 204 || data === null) {
      return undefined as T;
    }

    // Extract and return the data directly (unwrapped from envelope)
    const apiResponse = data as ApiResponse<T>;
    return apiResponse.data;
  }

  /**
   * Generic request method with token refresh support
   * Returns the data directly (unwrapped)
   */
  private async request<T>(
    endpoint: string,
    method: string,
    options?: RequestOptions,
  ): Promise<T> {
    const url = this.buildURL(endpoint, options?.params);
    const headers = this.buildHeaders(options?.headers as Record<string, string>);

    try {
      const response = await this.fetchWithTimeout(url, {
        method,
        headers,
        body: options?.body,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      const apiError = error instanceof Object && 'code' in error ? error : this.normalizeError(error);

      // Handle 401 with token refresh and retry
      if (apiError.code === 'UNAUTHORIZED') {
        // Check if refresh is already in progress
        if (this.isRefreshing) {
          // Wait for the ongoing refresh to complete
          await this.refreshPromise;

          // Retry the original request with new token
          const newHeaders = this.buildHeaders(options?.headers as Record<string, string>);
          const retryResponse = await this.fetchWithTimeout(url, {
            method,
            headers: newHeaders,
            body: options?.body,
          });
          return this.handleResponse<T>(retryResponse);
        }

        // Start refresh process
        this.isRefreshing = true;
        this.refreshPromise = this.refreshAccessToken()
          .finally(() => {
            this.isRefreshing = false;
            this.refreshPromise = null;
          });

        try {
          // Wait for refresh to complete
          await this.refreshPromise;

          // Retry the original request with new token
          const newHeaders = this.buildHeaders(options?.headers as Record<string, string>);
          const retryResponse = await this.fetchWithTimeout(url, {
            method,
            headers: newHeaders,
            body: options?.body,
          });
          return this.handleResponse<T>(retryResponse);
        } catch (refreshError) {
          // Refresh failed - show toast and logout
          useUIStore.getState().addToast({
            message: 'Session expired. Please log in again.',
            type: 'error',
          });
          throw apiError;
        }
      }

      throw apiError;
    }
  }

  // HTTP Methods - All return unwrapped data directly
  public async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, 'GET', options);
  }

  public async post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, 'POST', {
      ...options,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public async patch<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, 'PATCH', {
      ...options,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public async put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, 'PUT', {
      ...options,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, 'DELETE', options);
  }

  /**
   * Upload file to server
   * Returns the data directly (unwrapped)
   */
  public async uploadFile<T>(
    endpoint: string,
    file: File,
    options?: RequestOptions,
  ): Promise<T> {
    const url = this.buildURL(endpoint, options?.params);
    const headers = this.buildHeaders();

    // Remove Content-Type for FormData (browser sets it automatically)
    delete headers['Content-Type'];

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      const apiError = error instanceof Object && 'code' in error ? error : this.normalizeError(error);
      throw apiError;
    }
  }

}

export const apiClient = new ApiClient(API_BASE_URL);
