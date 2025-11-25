import { Request, Response, NextFunction } from 'express';
import { ApplicationLogger } from '../utils/logger';
import { config } from '../config/environment';

// Adapted from editor document-service trustGateway middleware

export interface GatewayAuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
  gatewayAuth: {
    timestamp: string;
    authenticatedBy: string;
  };
}

/**
 * Middleware to trust authentication headers from API Gateway
 * This replaces JWT validation since the gateway has already authenticated the user
 */
export const trustGatewayAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const userId = req.headers['x-user-id'] as string;
  const userEmail = req.headers['x-user-email'] as string;
  const username = req.headers['x-user-username'] as string;
  const userRole = req.headers['x-user-role'] as string;

  if (!userId) {
    ApplicationLogger.warn('Missing x-user-id header', {
      url: req.url,
      ip: req.ip
    });

    res.status(401).json({
      success: false,
      message: 'Unauthorized - missing user context'
    });
    return;
  }

  // Attach trusted user context to request
  (req as GatewayAuthenticatedRequest).user = {
    id: userId,
    email: userEmail || '',
    username: username || userEmail || '',
    role: userRole || 'user'
  };

  (req as GatewayAuthenticatedRequest).gatewayAuth = {
    timestamp: Date.now().toString(),
    authenticatedBy: 'api-gateway'
  };

  ApplicationLogger.debug('Request authenticated via API Gateway', {
    userId: userId.substring(0, 8) + '...',
    url: req.url,
    method: req.method
  });

  next();
};

/**
 * Middleware for development/testing - allows bypassing gateway auth
 * DO NOT USE IN PRODUCTION
 *
 * Sets default dev user ONLY if x-user-id header is not already present
 * This allows tests to override with specific user IDs
 */
export const bypassGatewayAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (config.nodeEnv === 'production') {
    throw new Error('bypassGatewayAuth middleware cannot be used in production');
  }

  // Only set defaults if headers are not already present (allows test overrides)
  // Use test-user-id to match frontend client.ts default for development
  const userId = (req.headers['x-user-id'] as string) || 'test-user-id';
  const userEmail = (req.headers['x-user-email'] as string) || 'test@example.com';
  const username = (req.headers['x-user-username'] as string) || 'test-user';
  const userRole = (req.headers['x-user-role'] as string) || 'user';

  // Set headers for controllers that read directly from headers
  req.headers['x-user-id'] = userId;
  req.headers['x-user-email'] = userEmail;
  req.headers['x-user-username'] = username;
  req.headers['x-user-role'] = userRole;

  // Create mock user for development
  (req as GatewayAuthenticatedRequest).user = {
    id: userId,
    email: userEmail,
    username: username,
    role: userRole
  };

  (req as GatewayAuthenticatedRequest).gatewayAuth = {
    timestamp: Date.now().toString(),
    authenticatedBy: 'development-bypass'
  };

  ApplicationLogger.info('Development: Bypassing gateway auth', { userId: userId.substring(0, 8) + '...', url: req.url });
  next();
};

export { GatewayAuthenticatedRequest as AuthenticatedRequest };
