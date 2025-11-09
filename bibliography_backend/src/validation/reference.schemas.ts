import Joi from 'joi';

export const createReferenceSchema = Joi.object({
  type: Joi.string()
    .valid('article', 'book', 'chapter', 'conference', 'thesis', 'other')
    .required()
    .messages({
      'any.required': 'Reference type is required',
      'any.only': 'Type must be one of: article, book, chapter, conference, thesis, other'
    }),

  title: Joi.string()
    .min(1)
    .required()
    .messages({
      'any.required': 'Title is required',
      'string.empty': 'Title cannot be empty'
    }),

  authors: Joi.array()
    .items(Joi.object({
      given: Joi.string().allow('').optional(),
      family: Joi.string().allow('').optional()
    }))
    .optional(),

  year: Joi.number()
    .integer()
    .min(1000)
    .max(2100)
    .optional()
    .messages({
      'number.min': 'Year must be at least 1000',
      'number.max': 'Year cannot exceed 2100'
    }),

  venue: Joi.string().optional(),

  doi: Joi.string()
    .regex(/^10\.\d{4,}\/\S+$/)
    .optional()
    .messages({
      'string.pattern.base': 'Invalid DOI format. Must start with "10." followed by registrant code and suffix'
    }),

  isbn: Joi.string().optional(),

  url: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'Invalid URL format'
    }),

  abstract: Joi.string().optional(),

  tags: Joi.array()
    .items(Joi.string())
    .optional(),

  collectionIds: Joi.array()
    .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
    .optional()
    .messages({
      'string.pattern.base': 'Invalid collection ID format. Must be valid MongoDB ObjectId'
    }),

  sourceRaw: Joi.object({
    provider: Joi.string().valid('doi', 'bibtex', 'csl-json', 'ris', 'manual').required(),
    payload: Joi.any().required()
  }).required()
});

export const updateReferenceSchema = Joi.object({
  title: Joi.string().min(1).optional(),
  authors: Joi.array().items(Joi.object({
    given: Joi.string().allow('').optional(),
    family: Joi.string().allow('').optional()
  })).optional(),
  year: Joi.number().integer().min(1000).max(2100).optional(),
  venue: Joi.string().optional(),
  doi: Joi.string().regex(/^10\.\d{4,}\/\S+$/).optional(),
  isbn: Joi.string().optional(),
  url: Joi.string().uri().optional(),
  abstract: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  collectionIds: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).optional()
}).min(1);
