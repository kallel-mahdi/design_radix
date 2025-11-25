import { injectable } from 'inversify';
import { IDuplicateService } from '../interfaces/IDuplicateService';
import { DuplicateCandidate, IDuplicateCandidate } from '../models/DuplicateCandidate';
import { Reference } from '../models/Reference';
import { ApplicationLogger } from '../utils/logger';
import mongoose from 'mongoose';
import { distance as levenshteinDistance } from 'fastest-levenshtein';
import { removeDiacritics } from 'modern-diacritics';

@injectable()
export class DuplicateService implements IDuplicateService {
  /**
   * Detect duplicates for a reference using 3-stage matching:
   * 1. ISBN match (highest confidence)
   * 2. DOI match (high confidence)
   * 3. Title + first author match (lower confidence)
   *
   * NOTE: Follows Zotero's duplicate detection algorithm
   * PERF: Uses batch operations to avoid N+1 queries
   */
  async detectForReference(userId: string, referenceId: string): Promise<IDuplicateCandidate[]> {
    ApplicationLogger.info('Detecting duplicates', { userId, referenceId });

    const reference = await Reference.findOne({ _id: referenceId, userId });
    if (!reference) {
      return [];
    }

    // Collect all potential matches with their confidence and reason
    type MatchReason = 'isbn' | 'doi' | 'title-creator';
    const potentialMatches: Array<{
      matchId: mongoose.Types.ObjectId;
      reason: MatchReason;
      confidence: number;
    }> = [];

    // Stage 1: ISBN match
    if (reference.isbn) {
      const isbnMatches = await Reference.find({
        userId,
        isbn: reference.isbn,
        _id: { $ne: referenceId },
        deleted: false
      });

      for (const match of isbnMatches) {
        potentialMatches.push({
          matchId: match._id,
          reason: 'isbn',
          confidence: 0.95
        });
      }
    }

    // Stage 2: DOI match
    if (reference.doi) {
      const doiMatches = await Reference.find({
        userId,
        doi: reference.doi,
        _id: { $ne: referenceId },
        deleted: false
      });

      for (const match of doiMatches) {
        // Skip if already matched by ISBN
        if (!potentialMatches.some(p => p.matchId.equals(match._id))) {
          potentialMatches.push({
            matchId: match._id,
            reason: 'doi',
            confidence: 0.9
          });
        }
      }
    }

    // Stage 3: Title + first author match
    if (reference.title && reference.authors && reference.authors.length > 0) {
      const titleNormalized = this.normalizeTitle(reference.title);
      const firstAuthorFamily = reference.authors[0].family;

      if (firstAuthorFamily) {
        const titleMatches = await Reference.find({
          userId,
          _id: { $ne: referenceId },
          deleted: false,
          'authors.0.family': firstAuthorFamily
        });

        for (const match of titleMatches) {
          // Skip if already matched by ISBN or DOI
          if (potentialMatches.some(p => p.matchId.equals(match._id))) {
            continue;
          }

          const matchTitleNormalized = this.normalizeTitle(match.title);
          const similarity = this.calculateSimilarity(titleNormalized, matchTitleNormalized);

          if (similarity > 0.85) {
            potentialMatches.push({
              matchId: match._id,
              reason: 'title-creator',
              confidence: similarity
            });
          }
        }
      }
    }

    if (potentialMatches.length === 0) {
      return [];
    }

    // BATCH: Check existing candidates in one query
    const matchIds = potentialMatches.map(m => m.matchId);
    const existingCandidates = await DuplicateCandidate.find({
      userId,
      existingReferenceId: { $in: matchIds },
      duplicateReferenceId: reference._id
    });

    const existingSet = new Set(
      existingCandidates.map(c => c.existingReferenceId.toString())
    );

    // BATCH: Create all new candidates at once
    const toCreate = potentialMatches
      .filter(m => !existingSet.has(m.matchId.toString()))
      .map(m => ({
        userId,
        existingReferenceId: m.matchId,
        duplicateReferenceId: reference._id,
        matchReason: m.reason,
        confidence: m.confidence
      }));

    let newCandidates: IDuplicateCandidate[] = [];
    if (toCreate.length > 0) {
      newCandidates = await DuplicateCandidate.insertMany(toCreate);
    }

    const allCandidates = [...existingCandidates, ...newCandidates];
    ApplicationLogger.info('Duplicates detected', { userId, referenceId, count: allCandidates.length });
    return allCandidates;
  }

  async listUnresolved(userId: string): Promise<IDuplicateCandidate[]> {
    return DuplicateCandidate.find({ userId, status: 'pending' })
      .populate('existingReferenceId')
      .populate('duplicateReferenceId')
      .sort({ createdAt: -1 });
  }

  async resolve(userId: string, duplicateId: string, action: 'keep-existing' | 'keep-new' | 'merged'): Promise<IDuplicateCandidate | null> {
    const candidate = await DuplicateCandidate.findOneAndUpdate(
      { _id: duplicateId, userId },
      {
        $set: {
          status: action,
          actionTakenBy: userId,
          resolvedAt: new Date()
        }
      },
      { new: true }
    );

    if (!candidate) {
      return null;
    }

    // Execute resolution action based on status
    switch (action) {
      case 'keep-existing':
        // Permanently delete the duplicate reference
        await Reference.deleteOne({
          _id: candidate.duplicateReferenceId,
          userId
        });
        break;

      case 'keep-new':
        // Permanently delete the existing reference
        await Reference.deleteOne({
          _id: candidate.existingReferenceId,
          userId
        });
        break;

      case 'merged':
        // Merge functionality not implemented in MVP
        throw new Error('MERGE_NOT_IMPLEMENTED: Merge functionality not available in MVP');
    }

    return candidate;
  }

  private normalizeTitle(title: string): string {
    return removeDiacritics(title)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) {
      return 1.0;
    }

    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }
}
