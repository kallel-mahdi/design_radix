import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { ApplicationLogger } from '../utils/logger';

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
          code: 'VALIDATION_ERROR',
          details,
        });
      }

      next(error);
    }
  };
};
