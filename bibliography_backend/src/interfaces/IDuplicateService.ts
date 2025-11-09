import { IDuplicateCandidate } from '../models/DuplicateCandidate';

export interface IDuplicateService {
  detectForReference(userId: string, referenceId: string): Promise<IDuplicateCandidate[]>;
  listUnresolved(userId: string): Promise<IDuplicateCandidate[]>;
  resolve(userId: string, duplicateId: string, resolution: 'keep-existing' | 'merge' | 'keep-both'): Promise<IDuplicateCandidate | null>;
}
