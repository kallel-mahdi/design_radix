import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Adapted from editor auth-service validation middleware

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
      return;
    }

    req.body = value;
    next();
  };
};
