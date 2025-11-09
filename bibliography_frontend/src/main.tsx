import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './styles/tailwind.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Placeholder App component (will be replaced in Session 2)
function App() {
  return (
    <div className="min-h-screen bg-bg-dark text-text-primary">
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-accent">
            Bibliography Manager
          </h1>
          <p className="text-text-secondary">
            Project scaffolded! Ready for Session 2.
          </p>
          <p className="text-sm text-text-muted mt-4">
            Run <code className="bg-bg-surface px-2 py-1 rounded">npm install</code> then{' '}
            <code className="bg-bg-surface px-2 py-1 rounded">npm run dev</code>
          </p>
        </div>
      </div>
    </div>
  );
}

const rootElement = document.querySelector('#root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </StrictMode>
  );
}
