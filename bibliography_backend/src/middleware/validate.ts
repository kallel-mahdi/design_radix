import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { ApplicationLogger } from '../utils/logger';

// Body validation (existing)
export const validate = <T extends z.ZodTypeAny>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        ApplicationLogger.warn('Validation failed', { path: req.path, details });

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          error: 'VALIDATION_ERROR',
          details,
        });
      }

      next(error);
    }
  };
};

// Param validation
export const validateParams = <T extends z.ZodTypeAny>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.params);
      req.params = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        ApplicationLogger.warn('Param validation failed', { path: req.path, details });

        return res.status(400).json({
          success: false,
          message: 'Invalid path parameters',
          error: 'VALIDATION_ERROR',
          details,
        });
      }

      next(error);
    }
  };
};

// Query validation
export const validateQuery = <T extends z.ZodTypeAny>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        ApplicationLogger.warn('Query validation failed', { path: req.path, details });

        return res.status(400).json({
          success: false,
          message: 'Invalid query parameters',
          error: 'VALIDATION_ERROR',
          details,
        });
      }

      next(error);
    }
  };
};

// Header validation
export const validateHeaders = <T extends z.ZodTypeAny>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.headers);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        ApplicationLogger.warn('Header validation failed', { path: req.path, details });

        return res.status(401).json({
          success: false,
          message: 'Missing or invalid headers',
          error: 'UNAUTHORIZED',
          details,
        });
      }

      next(error);
    }
  };
};

// Common validation schemas
export const ObjectIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format')
});

export const NameParamSchema = z.object({
  name: z.string().min(1).max(100)
});

export const PaginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(1000).optional(),
  offset: z.coerce.number().int().min(0).optional()
});

export const ReferenceListQuerySchema = z.object({
  collectionId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  tags: z.string().optional(), // comma-separated
  search: z.string().optional(),
  deleted: z.enum(['true', 'false']).optional()
}).merge(PaginationQuerySchema);

export const GatewayHeaderSchema = z.object({
  'x-user-id': z.string().min(1)
});
