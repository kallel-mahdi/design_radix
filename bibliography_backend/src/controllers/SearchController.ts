import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { ISearchService, SearchFilters } from '../interfaces/ISearchService';
import { TYPES } from '../config/types';
import { ApplicationLogger } from '../utils/logger';
import { GatewayAuthenticatedRequest } from '../middleware/trustGateway';

/**
 * SearchController
 *
 * Handles search requests with filters and facets.
 * Session 14 implementation.
 */
@injectable()
export class SearchController {
  constructor(
    @inject(TYPES.ISearchService) private searchService: ISearchService
  ) {}

  /**
   * Search references with filters
   *
   * GET /search?q=...&authors=...&yearStart=...&yearEnd=...&venues=...&tags=...&page=...&pageSize=...
   *
   * Query params:
   * - q: Full-text search query
   * - authors: Comma-separated author names (AND logic)
   * - yearStart: Minimum year
   * - yearEnd: Maximum year
   * - venues: Comma-separated venue names (OR logic)
   * - tags: Comma-separated tag names (AND logic)
   * - page: Page number (default 1)
   * - pageSize: Results per page (default 50, max 100)
   */
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as GatewayAuthenticatedRequest).user.id;

      // Parse query parameters
      const filters: SearchFilters = {
        query: req.query.q as string | undefined,
        authors: this.parseArrayParam(req.query.authors as string),
        yearStart: this.parseIntParam(req.query.yearStart as string),
        yearEnd: this.parseIntParam(req.query.yearEnd as string),
        venues: this.parseArrayParam(req.query.venues as string),
        tags: this.parseArrayParam(req.query.tags as string),
      };

      const page = Math.max(1, this.parseIntParam(req.query.page as string) || 1);
      const pageSize = Math.min(100, Math.max(1, this.parseIntParam(req.query.pageSize as string) || 50));

      ApplicationLogger.info('Search request', { userId, filters, page, pageSize });

      const result = await this.searchService.search(userId, filters, page, pageSize);

      res.status(200).json({
        success: true,
        data: {
          references: result.references,
          total: result.total,
          facets: result.facets,
          pagination: {
            page,
            pageSize,
            totalPages: Math.ceil(result.total / pageSize),
            hasMore: page * pageSize < result.total
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Parse comma-separated string to array
   */
  private parseArrayParam(value: string | undefined): string[] | undefined {
    if (!value?.trim()) return undefined;
    return value.split(',').map(s => s.trim()).filter(Boolean);
  }

  /**
   * Parse string to integer
   */
  private parseIntParam(value: string | undefined): number | undefined {
    if (!value?.trim()) return undefined;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? undefined : parsed;
  }
}
