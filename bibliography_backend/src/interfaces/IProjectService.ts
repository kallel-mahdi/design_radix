import { IProjectLink } from '../models/ProjectLink';
import { IReference } from '../models/Reference';
import { ICollection } from '../models/Collection';

export interface IProjectService {
  linkReference(userId: string, projectId: string, referenceId: string): Promise<IProjectLink>;
  unlinkReference(userId: string, projectId: string, referenceId: string): Promise<boolean>;
  linkCollection(userId: string, projectId: string, collectionId: string): Promise<IProjectLink>;
  unlinkCollection(userId: string, projectId: string, collectionId: string): Promise<boolean>;
  getProjectReferences(userId: string, projectId: string): Promise<IReference[]>;
  getProjectCollections(userId: string, projectId: string): Promise<ICollection[]>;
  getReferenceProjects(userId: string, referenceId: string): Promise<string[]>;
  getCollectionProjects(userId: string, collectionId: string): Promise<string[]>;
}
