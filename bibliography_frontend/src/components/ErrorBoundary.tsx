/**
 * ErrorBoundary Component
 *
 * Catches React errors and displays a fallback UI instead of crashing the app.
 * Prevents one bad component from taking down the entire application.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // In production, you could send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  override render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      // Default fallback UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-app-bg-secondary">
          <div className="max-w-md rounded-lg border border-red-500 bg-app-surface p-6 shadow-lg">
            <div className="mb-4 flex items-center gap-2">
              <svg
                className="h-6 w-6 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              <h1 className="text-lg font-semibold text-app-text-primary">
                Something went wrong
              </h1>
            </div>

            <p className="mb-4 text-sm text-app-text-secondary">
              An unexpected error occurred. You can try reloading the app or
              contact support if the problem persists.
            </p>

            <details className="mb-4 rounded border border-app-border bg-app-bg-secondary p-3">
              <summary className="cursor-pointer text-sm font-medium text-app-text-primary">
                Error details
              </summary>
              <pre className="mt-2 overflow-x-auto text-xs text-app-text-secondary">
                {this.state.error.message}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            </details>

            <div className="flex gap-2">
              <button
                className="flex-1 rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
                onClick={() => window.location.reload()}
                type="button"
              >
                Reload App
              </button>
              <button
                className="rounded border border-app-border bg-app-bg-secondary px-4 py-2 text-sm font-medium text-app-text-primary hover:bg-app-surface-hover transition-colors"
                onClick={this.resetError}
                type="button"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
