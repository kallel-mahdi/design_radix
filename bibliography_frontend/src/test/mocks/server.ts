import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * MSW Server Setup
 * Used in test setup to intercept all API calls
 */
export const server = setupServer(...handlers);
