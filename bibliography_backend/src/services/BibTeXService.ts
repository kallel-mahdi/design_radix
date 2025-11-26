import { injectable } from 'inversify';
import bibtexParse from '@orcid/bibtex-parse-js';
import { ApplicationLogger } from '../utils/logger';
import { ReferenceType } from '@bibliography/shared';
import { CreateReferenceInput } from '../interfaces/IReferenceService';

/**
 * BibTeX Entry Type → Reference Type mapping
 *
 * Based on standard BibTeX entry types:
 * https://www.bibtex.com/e/entry-types/
 */
const BIBTEX_TYPE_MAP: Record<string, ReferenceType> = {
  article: 'article',
  book: 'book',
  booklet: 'book',
  inbook: 'chapter',
  incollection: 'chapter',
  inproceedings: 'conference',
  conference: 'conference',
  mastersthesis: 'thesis',
  phdthesis: 'thesis',
  thesis: 'thesis',
  misc: 'other',
  techreport: 'other',
  unpublished: 'other',
  manual: 'other',
  proceedings: 'conference',
};

/**
 * Parsed reference ready for import
 */
export interface ParsedBibTeXReference {
  title: string;
  authors: Array<{ given?: string; family?: string }>;
  year?: number;
  venue?: string;
  doi?: string;
  url?: string;
  abstract?: string;
  type: ReferenceType;
  citationKey: string;
  bibtexRaw: string;
}

/**
 * Parse error with location info
 */
export interface BibTeXParseError {
  message: string;
  entry?: string;
}

/**
 * Parse result
 */
export interface BibTeXParseResult {
  references: ParsedBibTeXReference[];
  errors: BibTeXParseError[];
}

/**
 * Raw entry from @orcid/bibtex-parse-js
 */
interface BibtexEntry {
  citationKey: string;
  entryType: string;
  entryTags: Record<string, string>;
}

/**
 * BibTeXService - Parse and export BibTeX format
 *
 * Uses @orcid/bibtex-parse-js (simple, widely used parser)
 *
 * Features:
 * - Parse BibTeX files/strings into reference objects
 * - Export references to BibTeX format
 * - Handle author parsing (BibTeX "and" separator)
 *
 * Pattern: Follows CrossrefService style for consistency
 */
@injectable()
export class BibTeXService {
  /**
   * Parse BibTeX string into references
   */
  parse(bibtexString: string): BibTeXParseResult {
    ApplicationLogger.info('Parsing BibTeX input', { length: bibtexString.length });

    try {
      const entries: BibtexEntry[] = bibtexParse.toJSON(bibtexString);

      const references: ParsedBibTeXReference[] = [];
      const errors: BibTeXParseError[] = [];

      for (const entry of entries) {
        try {
          const parsed = this.mapEntryToReference(entry, bibtexString);
          references.push(parsed);
        } catch (err) {
          errors.push({
            entry: entry.citationKey,
            message: err instanceof Error ? err.message : 'Failed to parse entry',
          });
        }
      }

      ApplicationLogger.info('BibTeX parsing complete', {
        entriesCount: references.length,
        errorsCount: errors.length,
      });

      return { references, errors };
    } catch (err) {
      ApplicationLogger.error('BibTeX parsing failed', err instanceof Error ? err : undefined);
      return {
        references: [],
        errors: [{ message: err instanceof Error ? err.message : 'Parse failed' }],
      };
    }
  }

  /**
   * Map BibTeX entry to our reference format
   */
  private mapEntryToReference(entry: BibtexEntry, originalBibtex: string): ParsedBibTeXReference {
    const tags = entry.entryTags;

    // Extract title (required)
    const title = tags.title || 'Untitled';

    // Extract authors from "and"-separated format
    const authors = this.parseAuthors(tags.author);

    // Extract year
    const year = this.parseYear(tags.year || tags.date);

    // Extract venue (journal, booktitle, or publisher)
    const venue = tags.journal || tags.booktitle || tags.publisher;

    // Extract DOI
    const doi = tags.doi;

    // Extract URL
    const url = tags.url;

    // Extract abstract
    const abstract = tags.abstract;

    // Map entry type
    const type = BIBTEX_TYPE_MAP[entry.entryType.toLowerCase()] || 'other';

    // Extract the original BibTeX entry from the string
    const bibtexRaw = this.extractEntryBibtex(entry.citationKey, originalBibtex);

    return {
      title,
      authors,
      year,
      venue,
      doi,
      url,
      abstract,
      type,
      citationKey: entry.citationKey,
      bibtexRaw,
    };
  }

  /**
   * Parse author string from BibTeX format
   *
   * BibTeX format: "Family, Given and Family2, Given2"
   * or: "Given Family and Given2 Family2"
   */
  private parseAuthors(authorStr: string | undefined): Array<{ given?: string; family?: string }> {
    if (!authorStr) {
      return [];
    }

    // Split by " and " (BibTeX separator)
    const authorParts = authorStr.split(/\s+and\s+/i);

    return authorParts.map(author => {
      const trimmed = author.trim();

      // Check for "Family, Given" format
      if (trimmed.includes(',')) {
        const [family, ...givenParts] = trimmed.split(',');
        return {
          family: family.trim(),
          given: givenParts.join(',').trim() || undefined,
        };
      }

      // Assume "Given Family" format - last word is family name
      const parts = trimmed.split(/\s+/);
      if (parts.length === 1) {
        return { family: parts[0] };
      }

      const family = parts.pop();
      return {
        given: parts.join(' '),
        family,
      };
    });
  }

  /**
   * Parse year from string
   */
  private parseYear(yearStr: string | undefined): number | undefined {
    if (!yearStr) return undefined;

    // Extract 4-digit year
    const match = yearStr.match(/\d{4}/);
    if (match) {
      const year = parseInt(match[0], 10);
      if (year >= 1000 && year <= 2100) {
        return year;
      }
    }
    return undefined;
  }

  /**
   * Extract the original BibTeX entry from the full string
   */
  private extractEntryBibtex(key: string, fullBibtex: string): string {
    // Try to find the entry in the original string
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`@\\w+\\{${escapedKey}[\\s\\S]*?\\n\\}`, 'i');
    const match = fullBibtex.match(regex);
    return match ? match[0] : '';
  }

  /**
   * Convert parsed reference to CreateReferenceInput
   *
   * Pattern: Follows CrossrefService.mapToReferenceInput style
   * Note: citationKey is auto-generated by ReferenceService, not passed here
   */
  toCreateInput(parsed: ParsedBibTeXReference): CreateReferenceInput {
    return {
      type: parsed.type,
      title: parsed.title,
      authors: parsed.authors,
      year: parsed.year,
      venue: parsed.venue,
      doi: parsed.doi,
      url: parsed.url,
      abstract: parsed.abstract,
      tags: [],
      collectionIds: [],
      sourceRaw: {
        provider: 'bibtex',
        payload: parsed.bibtexRaw,
      },
    };
  }

  /**
   * Export references to BibTeX format
   */
  export(references: Array<{
    type: string;
    title: string;
    authors: Array<{ given?: string; family?: string; full?: string }>;
    year?: number;
    venue?: string;
    doi?: string;
    url?: string;
    abstract?: string;
    citationKey: string;
  }>): string {
    const entries: string[] = [];

    for (const ref of references) {
      const entry = this.referenceToEntry(ref);
      entries.push(entry);
    }

    return entries.join('\n\n');
  }

  /**
   * Convert single reference to BibTeX entry
   */
  private referenceToEntry(ref: {
    type: string;
    title: string;
    authors: Array<{ given?: string; family?: string; full?: string }>;
    year?: number;
    venue?: string;
    doi?: string;
    url?: string;
    abstract?: string;
    citationKey: string;
  }): string {
    const bibtexType = this.toBibtexType(ref.type);
    const fields: string[] = [];

    // Title
    fields.push(`  title = {${this.escapeLatex(ref.title)}}`);

    // Authors
    if (ref.authors.length > 0) {
      const authorStr = ref.authors
        .map(a => a.family && a.given ? `${a.family}, ${a.given}` : (a.full || a.family || 'Unknown'))
        .join(' and ');
      fields.push(`  author = {${authorStr}}`);
    }

    // Year
    if (ref.year) {
      fields.push(`  year = {${ref.year}}`);
    }

    // Venue (journal or booktitle based on type)
    if (ref.venue) {
      const venueField = ['conference', 'inproceedings', 'chapter', 'inbook', 'incollection']
        .includes(bibtexType) ? 'booktitle' : 'journal';
      fields.push(`  ${venueField} = {${this.escapeLatex(ref.venue)}}`);
    }

    // DOI
    if (ref.doi) {
      fields.push(`  doi = {${ref.doi}}`);
    }

    // URL
    if (ref.url) {
      fields.push(`  url = {${ref.url}}`);
    }

    // Abstract
    if (ref.abstract) {
      fields.push(`  abstract = {${this.escapeLatex(ref.abstract)}}`);
    }

    return `@${bibtexType}{${ref.citationKey},\n${fields.join(',\n')}\n}`;
  }

  /**
   * Convert our type to BibTeX type
   */
  private toBibtexType(type: string): string {
    const reverseMap: Record<string, string> = {
      article: 'article',
      book: 'book',
      chapter: 'incollection',
      conference: 'inproceedings',
      thesis: 'phdthesis',
      other: 'misc',
    };
    return reverseMap[type] || 'misc';
  }

  /**
   * Escape special LaTeX characters
   */
  private escapeLatex(str: string): string {
    return str
      .replace(/\\/g, '\\textbackslash{}')
      .replace(/&/g, '\\&')
      .replace(/%/g, '\\%')
      .replace(/\$/g, '\\$')
      .replace(/#/g, '\\#')
      .replace(/_/g, '\\_')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/~/g, '\\textasciitilde{}')
      .replace(/\^/g, '\\textasciicircum{}');
  }
}
