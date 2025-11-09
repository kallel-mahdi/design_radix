import { Request, Response, NextFunction } from 'express';
import { ApplicationLogger } from '../utils/logger';

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
 */
export const bypassGatewayAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('bypassGatewayAuth middleware cannot be used in production');
  }

  // Set mock headers for controllers that read directly from headers
  req.headers['x-user-id'] = 'dev-user-123';
  req.headers['x-user-email'] = 'dev@example.com';
  req.headers['x-user-username'] = 'dev-user';
  req.headers['x-user-role'] = 'user';

  // Create mock user for development
  (req as GatewayAuthenticatedRequest).user = {
    id: 'dev-user-123',
    email: 'dev@example.com',
    username: 'dev-user',
    role: 'user'
  };

  (req as GatewayAuthenticatedRequest).gatewayAuth = {
    timestamp: Date.now().toString(),
    authenticatedBy: 'development-bypass'
  };

  ApplicationLogger.info('Development: Bypassing gateway auth', { url: req.url });
  next();
};

export { GatewayAuthenticatedRequest as AuthenticatedRequest };
