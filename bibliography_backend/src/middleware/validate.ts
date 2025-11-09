import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApplicationLogger } from '../utils/logger';

export const validate = (schema: Joi.Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      ApplicationLogger.warn('Validation failed', { path: req.path, details });

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details
      });
    }

    req.body = value;
    next();
  };
};
