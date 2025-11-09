import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoose from 'mongoose';
import { config } from './config/environment';
import { configureContainer } from './config/container';
import { ApplicationLogger, requestLogger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { trustGatewayAuth, bypassGatewayAuth } from './middleware/trustGateway';

// Import routes
import { referencesRouter } from './routes/references';
import { collectionsRouter } from './routes/collections';
import { tagsRouter } from './routes/tags';
import { projectsRouter } from './routes/projects';
import { duplicatesRouter } from './routes/duplicates';
import { healthRouter } from './routes/health';

const app = express();

// Configure DI container
configureContainer();

// Middleware
app.use(helmet());
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Auth middleware (trust gateway or dev bypass)
if (config.trustGatewayAuth) {
  app.use('/api/bibliography', trustGatewayAuth);
} else {
  ApplicationLogger.warn('Using bypass auth - DEVELOPMENT MODE ONLY');
  app.use('/api/bibliography', bypassGatewayAuth);
}

// Routes
app.use('/api/bibliography/references', referencesRouter);
app.use('/api/bibliography/collections', collectionsRouter);
app.use('/api/bibliography/tags', tagsRouter);
app.use('/api/bibliography/projects', projectsRouter);
app.use('/api/bibliography/duplicates', duplicatesRouter);
app.use('/health', healthRouter);

// Error handler (must be last)
app.use(errorHandler);

// Database connection
mongoose
  .connect(config.mongodbUrl)
  .then(() => {
    ApplicationLogger.info('MongoDB connected', { database: config.mongodbUrl });

    // Start server
    app.listen(config.port, () => {
      ApplicationLogger.info('Bibliography service started', {
        port: config.port,
        env: config.nodeEnv
      });
    });
  })
  .catch((error) => {
    ApplicationLogger.error('MongoDB connection failed', error);
    process.exit(1);
  });

export default app;
