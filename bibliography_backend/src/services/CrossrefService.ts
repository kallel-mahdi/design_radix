import { injectable } from 'inversify';
import { ApplicationLogger } from '../utils/logger';
import { ReferenceType } from '@bibliography/shared';
import { CreateReferenceInput } from '../interfaces/IReferenceService';
import { config } from '../config/environment';

/**
 * Crossref API Response Interfaces
 * Based on Crossref REST API v1 specification
 */
interface CrossrefAuthor {
  given?: string;
  family?: string;
  sequence?: string;
  affiliation?: unknown[];
}

interface CrossrefDate {
  'date-parts'?: number[][];
}

interface CrossrefWork {
  DOI: string;
  type: string;
  title?: string[];
  author?: CrossrefAuthor[];
  published?: CrossrefDate;
  'container-title'?: string[];
  publisher?: string;
  URL?: string;
  abstract?: string;
  page?: string;
  volume?: string;
  issue?: string;
  ISBN?: string[];
}

interface CrossrefResponse {
  status: string;
  'message-type': string;
  message: CrossrefWork;
}

/**
 * TYPE_MAP: Crossref work type → Bibliography Reference type
 *
 * Deviation from Zotero: We use direct mapping to our canonical types.
 * Zotero uses translator system with more nuanced type mappings.
 * Raw Crossref type stored in sourceRaw.payload as backup.
 */
const TYPE_MAP: Record<string, ReferenceType> = {
  'journal-article': 'article',
  'proceedings-article': 'conference',
  'book': 'book',
  'book-chapter': 'chapter',
  'dissertation': 'thesis',
  'report': 'other',
  'dataset': 'other',
  'posted-content': 'other'
};

/**
 * CrossrefService
 *
 * Handles DOI metadata fetching from Crossref REST API.
 *
 * Deviation from Zotero: We use direct Crossref API instead of Zotero's
 * translator system. Translator pattern deferred to Phase 2 for file imports.
 *
 * See: docs/sessions/06-plan.md for architecture decisions
 */
@injectable()
export class CrossrefService {
  private readonly CROSSREF_API = `${config.crossrefApiUrl}/works`;
  private readonly USER_AGENT = 'BibliographyManager/1.0 (mailto:support@bibliography.app)';
  private readonly TIMEOUT_MS = 10000;

  /**
   * Fetch metadata from Crossref API with exponential backoff retry
   *
   * Uses Crossref polite pool (mailto in User-Agent) for priority processing.
   * Implements retry logic with exponential backoff (1s, 2s, 4s, 8s, 16s).
   * Respects Retry-After header for 429/503 responses.
   *
   * Deviation from Zotero: We retry max 5 times (Zotero retries up to 1 hour).
   * This is more appropriate for user-facing requests.
   *
   * See: docs/sessions/06-plan.md and Zotero's http.js (lines 155-222)
   */
  async fetchMetadata(doi: string, maxRetries = 5): Promise<CrossrefWork> {
    ApplicationLogger.info('Fetching Crossref metadata', { doi, maxRetries });

    const retryDelays = [1000, 2000, 4000, 8000, 16000]; // milliseconds

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(
          `${this.CROSSREF_API}/${encodeURIComponent(doi)}`,
          {
            headers: {
              'User-Agent': this.USER_AGENT,
              'Accept': 'application/json'
            },
            signal: AbortSignal.timeout(this.TIMEOUT_MS)
          }
        );

        // Handle successful response
        if (response.ok) {
          const data = await response.json() as CrossrefResponse;
          ApplicationLogger.info('Crossref metadata fetched', {
            doi,
            title: data.message.title?.[0]?.substring(0, 50),
            attempts: attempt + 1
          });
          return data.message;
        }

        // 404: DOI not found (don't retry)
        if (response.status === 404) {
          ApplicationLogger.warn('DOI not found', { doi });
          throw new Error('DOI not found');
        }

        // 429/503: Rate limit or service unavailable (retry with backoff)
        if (response.status === 429 || response.status === 503) {
          if (attempt === maxRetries - 1) {
            ApplicationLogger.warn('Max retries exceeded', { doi, status: response.status });
            throw new Error('Rate limit exceeded, please try again later');
          }

          // Check for Retry-After header (Zotero pattern)
          const retryAfter = response.headers.get('Retry-After');
          let delayMs = retryDelays[attempt];

          if (retryAfter) {
            const retryAfterInt = parseInt(retryAfter, 10);
            if (!isNaN(retryAfterInt)) {
              // Retry-After is in seconds
              delayMs = retryAfterInt * 1000;
              ApplicationLogger.info('Using Retry-After header', { doi, retryAfterSeconds: retryAfterInt, attempt: attempt + 1 });
            } else {
              // Retry-After might be HTTP-date format - parse it
              const retryDate = new Date(retryAfter);
              if (!isNaN(retryDate.getTime())) {
                delayMs = Math.max(0, retryDate.getTime() - Date.now());
                ApplicationLogger.info('Using Retry-After date', { doi, retryAfterDate: retryAfter, delayMs, attempt: attempt + 1 });
              }
            }
          }

          ApplicationLogger.info('Retrying after rate limit', { doi, status: response.status, delayMs, attempt: attempt + 1 });
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }

        // Other errors (don't retry)
        throw new Error(`Crossref API error: ${response.statusText}`);

      } catch (error) {
        if (error instanceof Error) {
          // Timeout errors (don't retry)
          if (error.name === 'AbortError' || error.name === 'TimeoutError') {
            ApplicationLogger.error('Crossref request timeout', error);
            throw new Error('Request timeout - Crossref API did not respond in time');
          }

          // If we already threw a specific error (404, rate limit, etc), re-throw it
          if (error.message.includes('DOI not found') ||
              error.message.includes('Rate limit exceeded') ||
              error.message.includes('Crossref API error')) {
            throw error;
          }

          // Network errors (retry if attempts remaining)
          if (attempt < maxRetries - 1) {
            const delayMs = retryDelays[attempt];
            ApplicationLogger.info('Retrying after network error', { doi, delayMs, attempt: attempt + 1 });
            await new Promise(resolve => setTimeout(resolve, delayMs));
            continue;
          }

          ApplicationLogger.error('Crossref fetch failed', error);
          throw error;
        }

        ApplicationLogger.error('Unknown Crossref error', error as Error);
        throw new Error('Network error - failed to connect to Crossref API');
      }
    }

    // Should never reach here, but TypeScript needs it
    throw new Error('Max retries exceeded');
  }

  /**
   * Map Crossref work to CreateReferenceInput
   *
   * Abstract handling: Saves when Crossref provides it (matches Zotero behavior).
   * Crossref abstract coverage is improving (confirmed via WebSearch).
   *
   * Authors: Maps given/family from Crossref. Backend auto-generates 'full' field.
   *
   * Type mapping: Uses TYPE_MAP with fallback to 'other'.
   */
  mapToReferenceInput(crossrefData: CrossrefWork): CreateReferenceInput {
    const type = TYPE_MAP[crossrefData.type] || 'other';

    const title = crossrefData.title?.[0] || 'Untitled';

    const authors = crossrefData.author?.map(a => ({
      given: a.given || '',
      family: a.family || ''
    })) || [];

    const year = crossrefData.published?.['date-parts']?.[0]?.[0];

    const venue = crossrefData['container-title']?.[0];

    const doi = crossrefData.DOI.toLowerCase();

    const url = crossrefData.URL;

    // Save abstract when available (matches Zotero behavior)
    const abstract = crossrefData.abstract || undefined;

    ApplicationLogger.info('Mapped Crossref data to reference input', {
      doi,
      type,
      authorsCount: authors.length,
      hasAbstract: !!abstract
    });

    return {
      type,
      title,
      authors,
      year,
      venue,
      doi,
      url,
      abstract,
      tags: [],
      collectionIds: [],
      sourceRaw: {
        provider: 'doi',
        payload: crossrefData
      }
    };
  }
}
