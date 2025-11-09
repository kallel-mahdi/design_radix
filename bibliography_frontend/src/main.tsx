import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { createRouter } from '@tanstack/react-router';
import { App } from './App';
import { routeTree } from './routeTree.gen';
import { createQueryClient } from './common/config/reactQuery';
import './styles/tailwind.css';

// Create query client with optimized defaults
const queryClient = createQueryClient();

// Create the router
const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.querySelector('#root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <App router={router} queryClient={queryClient} />
    </StrictMode>
  );
}
