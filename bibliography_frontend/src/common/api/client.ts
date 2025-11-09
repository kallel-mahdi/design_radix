import { useUIStore } from '../../store/ui.store';

// Environment configuration
const API_BASE_URL = import.meta.env['VITE_API_BASE_URL'] || 'http://localhost:8005/api/bibliography';

// Common API types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string | number;
  details?: any;
}

export interface RequestConfig extends RequestInit {
  timeout?: number;
  skipAuth?: boolean;
  skipGlobalLoading?: boolean;
}

// Custom fetch with timeout
async function fetchWithTimeout(
  url: string,
  options: RequestConfig = {}
): Promise<Response> {
  const { timeout = 10000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Auth token management
class AuthManager {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }
}

export const authManager = new AuthManager();

// API Client class (adapted from editor)
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const {
      skipAuth = false,
      skipGlobalLoading = false,
      ...requestConfig
    } = config;

    // Show global loading if not skipped
    if (!skipGlobalLoading) {
      useUIStore.getState().setGlobalLoading(true);
    }

    try {
      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(requestConfig.headers as Record<string, string>),
      };

      // Add auth token if not skipped
      if (!skipAuth) {
        const token = authManager.getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      // Make request
      const response = await fetchWithTimeout(`${this.baseURL}${endpoint}`, {
        ...requestConfig,
        headers,
      });

      // Handle response
      await this.handleResponse(response);

      // Parse JSON response
      const data = await response.json() as T;

      return data;
    } catch (error) {
      throw this.handleError(error);
    } finally {
      // Hide global loading
      if (!skipGlobalLoading) {
        useUIStore.getState().setGlobalLoading(false);
      }
    }
  }

  private async handleResponse(response: Response): Promise<void> {
    if (!response.ok) {
      let errorData: any = {};

      try {
        errorData = await response.json();
      } catch {
        // If JSON parsing fails, use status text
        errorData = { message: response.statusText };
      }

      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }
  }

  private handleError(error: any): ApiError {
    // Network errors
    if (error.name === 'AbortError') {
      return {
        message: 'Request timed out',
        code: 'TIMEOUT',
      };
    }

    if (!navigator.onLine) {
      return {
        message: 'No internet connection',
        code: 'NETWORK_ERROR',
      };
    }

    // Auth errors
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      authManager.clearToken();

      // Add toast notification
      useUIStore.getState().addToast({
        message: 'Session expired. Please log in again.',
        type: 'error',
      });

      return {
        message: 'Authentication required',
        code: 'AUTH_ERROR',
      };
    }

    // Server errors
    if (error.message?.includes('500')) {
      return {
        message: 'Server error. Please try again later.',
        code: 'SERVER_ERROR',
      };
    }

    // Default error
    return {
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      details: error,
    };
  }

  // HTTP methods
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

// Export configured client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Utility functions for common patterns
export const createApiEndpoint = (path: string) => `${API_BASE_URL}${path}`;

export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as any).message === 'string'
  );
};
