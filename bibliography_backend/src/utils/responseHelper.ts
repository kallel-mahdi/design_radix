import { Response } from 'express';

/**
 * ResponseHelper - Utility for consistent API response envelopes
 *
 * DRY: Extracted from repetitive controller patterns
 * Maintains consistent response format: { success, message, data?, pagination? }
 */
export const ResponseHelper = {
  /**
   * Send a success response
   */
  success<T>(
    res: Response,
    data: T,
    message: string,
    statusCode = 200
  ): void {
    res.status(statusCode).json({
      success: true,
      message,
      data
    });
  },

  /**
   * Send a success response with pagination metadata
   */
  successWithPagination<T>(
    res: Response,
    data: T[],
    message: string,
    pagination: {
      total: number;
      limit: number;
      offset: number;
    },
    statusCode = 200
  ): void {
    res.status(statusCode).json({
      success: true,
      message,
      data,
      pagination: {
        ...pagination,
        hasMore: pagination.offset + data.length < pagination.total
      }
    });
  },

  /**
   * Send an error response (used by error handler middleware)
   */
  error(
    res: Response,
    message: string,
    statusCode = 400,
    details?: Record<string, unknown>
  ): void {
    const response: { success: false; message: string; details?: Record<string, unknown> } = {
      success: false,
      message
    };
    if (details) {
      response.details = details;
    }
    res.status(statusCode).json(response);
  },

  /**
   * Send a created response (201)
   */
  created<T>(res: Response, data: T, message: string): void {
    ResponseHelper.success(res, data, message, 201);
  },

  /**
   * Send a no content response (204)
   */
  noContent(res: Response): void {
    res.status(204).send();
  }
};
