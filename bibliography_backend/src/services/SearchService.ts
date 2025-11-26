import { injectable } from 'inversify';
import { Reference, IReference } from '../models/Reference';
import { ApplicationLogger } from '../utils/logger';
import { ISearchService, SearchFilters, SearchResult, SearchFacets } from '../interfaces/ISearchService';

/**
 * SearchService - Advanced search with facets
 *
 * Uses MongoDB text index for full-text search and
 * aggregation pipeline for facet computation.
 *
 * Features:
 * - Full-text search with weighted fields
 * - Author filter (AND logic)
 * - Year range filter
 * - Venue filter (OR logic)
 * - Tag filter (AND logic)
 * - Facet aggregation for filter UI
 */
@injectable()
export class SearchService implements ISearchService {
  /**
   * Search references with filters and compute facets
   */
  async search(
    userId: string,
    filters: SearchFilters,
    page: number = 1,
    pageSize: number = 50
  ): Promise<SearchResult> {
    ApplicationLogger.info('Searching references', { userId, filters, page, pageSize });

    // Build match stage for query
    const matchStage = this.buildMatchStage(userId, filters);

    // Execute search and facet aggregation in parallel
    const [searchResults, facetResults] = await Promise.all([
      this.executeSearch(matchStage, filters.query, page, pageSize),
      this.computeFacets(userId, filters)
    ]);

    ApplicationLogger.info('Search complete', {
      userId,
      total: searchResults.total,
      returned: searchResults.references.length
    });

    return {
      references: searchResults.references,
      total: searchResults.total,
      facets: facetResults
    };
  }

  /**
   * Build MongoDB match stage from filters
   */
  private buildMatchStage(userId: string, filters: SearchFilters): Record<string, any> {
    const match: Record<string, any> = {
      userId,
      deleted: false
    };

    // Full-text search
    if (filters.query?.trim()) {
      match.$text = { $search: filters.query.trim() };
    }

    // Author filter (AND logic - all authors must be present)
    if (filters.authors && filters.authors.length > 0) {
      match['authors.full'] = { $all: filters.authors };
    }

    // Year range filter
    if (filters.yearStart || filters.yearEnd) {
      match.year = {};
      if (filters.yearStart) {
        match.year.$gte = filters.yearStart;
      }
      if (filters.yearEnd) {
        match.year.$lte = filters.yearEnd;
      }
    }

    // Venue filter (OR logic - any venue matches)
    if (filters.venues && filters.venues.length > 0) {
      match.venue = { $in: filters.venues };
    }

    // Tag filter (AND logic - all tags must be present)
    if (filters.tags && filters.tags.length > 0) {
      match.tags = { $all: filters.tags };
    }

    return match;
  }

  /**
   * Execute search query with pagination
   */
  private async executeSearch(
    matchStage: Record<string, any>,
    query: string | undefined,
    page: number,
    pageSize: number
  ): Promise<{ references: IReference[]; total: number }> {
    const skip = (page - 1) * pageSize;

    // Build sort - use text score if searching, otherwise createdAt
    const sort: Record<string, any> = query?.trim()
      ? { score: { $meta: 'textScore' }, createdAt: -1 }
      : { createdAt: -1 };

    // Build projection - include text score if searching
    const projection = query?.trim()
      ? { score: { $meta: 'textScore' } }
      : {};

    const [references, total] = await Promise.all([
      Reference.find(matchStage, projection)
        .sort(sort)
        .skip(skip)
        .limit(pageSize)
        .exec(),
      Reference.countDocuments(matchStage)
    ]);

    return { references, total };
  }

  /**
   * Compute facets for filter UI
   *
   * Returns counts for years, venues, authors, and tags
   * based on current search filters (excluding the facet's own filter)
   */
  private async computeFacets(userId: string, filters: SearchFilters): Promise<SearchFacets> {
    // Base match without specific filters (for accurate facet counts)
    const baseMatch: Record<string, any> = {
      userId,
      deleted: false
    };

    // Apply text search to facets
    if (filters.query?.trim()) {
      baseMatch.$text = { $search: filters.query.trim() };
    }

    // Compute all facets in a single aggregation
    const facetPipeline = [
      { $match: baseMatch },
      {
        $facet: {
          // Year facet
          years: [
            { $match: { year: { $exists: true, $ne: null } } },
            { $group: { _id: '$year', count: { $sum: 1 } } },
            { $sort: { _id: -1 as const } },
            { $limit: 20 }
          ],
          // Venue facet
          venues: [
            { $match: { venue: { $exists: true, $nin: [null, ''] } } },
            { $group: { _id: '$venue', count: { $sum: 1 } } },
            { $sort: { count: -1 as const } },
            { $limit: 20 }
          ],
          // Author facet (unwind authors array)
          authors: [
            { $unwind: '$authors' },
            { $group: { _id: '$authors.full', count: { $sum: 1 } } },
            { $sort: { count: -1 as const } },
            { $limit: 30 }
          ],
          // Tag facet (unwind tags array)
          tags: [
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 as const } },
            { $limit: 20 }
          ]
        }
      }
    ];

    const [result] = await Reference.aggregate(facetPipeline);

    return {
      years: (result?.years || []).map((item: any) => ({
        value: item._id,
        count: item.count
      })),
      venues: (result?.venues || []).map((item: any) => ({
        value: item._id,
        count: item.count
      })),
      authors: (result?.authors || []).map((item: any) => ({
        value: item._id,
        count: item.count
      })),
      tags: (result?.tags || []).map((item: any) => ({
        value: item._id,
        count: item.count
      }))
    };
  }
}
