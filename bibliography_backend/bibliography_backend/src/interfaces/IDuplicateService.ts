import { IDuplicateCandidate } from '../models/DuplicateCandidate';

export interface IDuplicateService {
  detectForReference(userId: string, referenceId: string): Promise<IDuplicateCandidate[]>;
  listUnresolved(userId: string): Promise<IDuplicateCandidate[]>;
  resolve(userId: string, duplicateId: string, action: 'keep-existing' | 'keep-new' | 'merged'): Promise<IDuplicateCandidate | null>;
}
