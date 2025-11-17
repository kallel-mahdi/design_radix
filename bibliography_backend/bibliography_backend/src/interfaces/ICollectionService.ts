import { ICollection } from '../models/Collection';

export interface CreateCollectionInput {
  name: string;
  parentId?: string | null;
  color?: string | null;
}

export interface UpdateCollectionInput {
  name?: string;
  parentId?: string | null;
  position?: number;
  color?: string | null;
}

export interface ICollectionService {
  create(userId: string, data: CreateCollectionInput): Promise<ICollection>;
  getById(id: string, userId: string): Promise<ICollection | null>;
  list(userId: string, includeDeleted?: boolean): Promise<ICollection[]>;
  update(id: string, userId: string, data: UpdateCollectionInput): Promise<ICollection | null>;
  delete(id: string, userId: string): Promise<boolean>;
  restore(id: string, userId: string): Promise<ICollection | null>;
  permanentDelete(id: string, userId: string): Promise<boolean>;
}
