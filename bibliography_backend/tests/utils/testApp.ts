import 'reflect-metadata';
import express from 'express';
import { configureContainer, resetContainer } from '../../src/config/container';
import { bypassGatewayAuth } from '../../src/middleware/trustGateway';
import { errorHandler } from '../../src/middleware/errorHandler';

// Import routes
import { referencesRouter } from '../../src/routes/references';
import { collectionsRouter } from '../../src/routes/collections';
import { tagsRouter } from '../../src/routes/tags';
import { duplicatesRouter } from '../../src/routes/duplicates';
import { healthRouter } from '../../src/routes/health';

export function createTestApp() {
  const app = express();

  // Reset and configure DI container for test isolation
  resetContainer();
  configureContainer();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Use bypass auth for tests
  app.use('/api/bibliography', bypassGatewayAuth);

  // Routes
  app.use('/api/bibliography/references', referencesRouter);
  app.use('/api/bibliography/collections', collectionsRouter);
  app.use('/api/bibliography/tags', tagsRouter);
  app.use('/api/bibliography/duplicates', duplicatesRouter);
  app.use('/health', healthRouter);

  // Error handler
  app.use(errorHandler);

  return app;
}
