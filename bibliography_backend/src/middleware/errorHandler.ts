import { Request, Response, NextFunction } from 'express';
import { ApplicationLogger } from '../utils/logger';
import { config } from '../config/environment';

// Adapted from editor document-service error handler

interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  error?: string; // Session 10.5: Error code for API responses (e.g., 'INVALID_PDF', 'NO_FILE')
  details?: any;
}

export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  ApplicationLogger.error('Error occurred', error, {
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';
  let errorCode = error.error || error.code || error.name || 'INTERNAL_ERROR'; // Session 10.5: Prefer error field
  let details = error.details || null;

  // Parse error message for known error codes
  const errorMessagePatterns = [
    'MAX_COLORED_TAGS',
    'POSITION_TAKEN',
    'INVALID_POSITION',
    'MERGE_NOT_IMPLEMENTED'
  ];

  for (const pattern of errorMessagePatterns) {
    if (message.startsWith(pattern + ':')) {
      statusCode = 400;
      errorCode = pattern;
      break;
    }
  }

  // Handle MongoDB validation errors
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errorCode = 'VALIDATION_ERROR';
    details = error.details || error.message;
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    errorCode = 'INVALID_ID';
  } else if (error.name === 'DocumentNotFoundError') {
    statusCode = 404;
    message = 'Document not found';
    errorCode = 'NOT_FOUND';
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
    errorCode = 'UNAUTHORIZED';
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Forbidden';
    errorCode = 'FORBIDDEN';
  } else if (error.name === 'ConflictError') {
    statusCode = 409;
    message = 'Conflict';
    errorCode = 'CONFLICT';
  } else if (error.code === '11000' || (error as any).code === 11000) {
    statusCode = 409;
    message = 'Duplicate key error';
    errorCode = 'DUPLICATE_KEY';
  }

  // Session 10.5: Handle Multer file filter errors (thrown by fileUpload middleware)
  if (message.includes('Invalid file type') || message.includes('Only PDF files')) {
    statusCode = 400;
    errorCode = 'INVALID_FILE_TYPE';
  }

  // Don't expose internal errors in production
  if (config.nodeEnv === 'production' && statusCode === 500) {
    message = 'Internal Server Error';
    errorCode = 'INTERNAL_ERROR';
    details = null;
  }

  const errorResponse = {
    success: false,
    message,
    error: errorCode, // Session 10.5: Use 'error' field for consistency with controller responses
    ...(details && { details }),
    ...(config.nodeEnv === 'development' && { stack: error.stack })
  };

  res.status(statusCode).json(errorResponse);
};

// Custom error classes
export class DocumentNotFoundError extends Error {
  statusCode = 404;

  constructor(message = 'Document not found') {
    super(message);
    this.name = 'DocumentNotFoundError';
  }
}

export class UnauthorizedError extends Error {
  statusCode = 401;

  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  statusCode = 403;

  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends Error {
  statusCode = 409;
  details?: any;

  constructor(message: string, details?: any) {
    super(message);
    this.name = 'ConflictError';
    this.details = details;
  }
}
